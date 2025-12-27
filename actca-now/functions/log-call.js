// --- Netlify Serverless Function: log-call.js ---
// Logs call actions and phone clicks to Google Sheets

// Import google-auth-library directly for better serverless compatibility
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

// --- Google Sheets Helper Functions ---
async function getGoogleSheetsAuth() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  // Support both service account JSON key (as string) or individual credentials
  // Use JWT directly from google-auth-library for service account authentication
  if (serviceAccountKey) {
    const keyData = typeof serviceAccountKey === 'string' 
      ? JSON.parse(serviceAccountKey) 
      : serviceAccountKey;
    
    const auth = new JWT({
      email: keyData.client_email,
      key: keyData.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    return auth;
  } else if (serviceAccountEmail && privateKey) {
    const auth = new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    return auth;
  }
  return null;
}

async function ensureSheetHeaders(sheets, spreadsheetId, sheetName) {
  try {
    // Check if sheet exists and has data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:F1`,
    });

    const values = response.data.values;
    
    // If sheet is empty or doesn't have headers, add them
    if (!values || values.length === 0) {
      const headers = ['timestamp', 'phone', 'targetID', 'eventType', 'zip', 'ip'];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:F1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      });
    }
  } catch (error) {
    // If sheet doesn't exist, create it (this might require additional permissions)
    // For now, just log the error - user should create the sheet manually
    console.warn('Could not verify/initialize sheet headers:', error.message);
  }
}

async function appendToGoogleSheets(logData) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  // If no credentials configured, skip Google Sheets integration
  if (!spreadsheetId) {
    console.warn('Google Sheets: Spreadsheet ID not configured (GOOGLE_SHEETS_SPREADSHEET_ID)');
    return null;
  }

  try {
    const auth = await getGoogleSheetsAuth();
    if (!auth) {
      console.warn('Google Sheets: Credentials not configured. Check GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SERVICE_ACCOUNT_EMAIL/GOOGLE_PRIVATE_KEY');
      return null;
    }

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Determine sheet name based on event type (or use default)
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Events';
    
    console.log(`Google Sheets: Attempting to write to sheet "${sheetName}" in spreadsheet ${spreadsheetId}`);
    
    // Ensure headers exist (only runs if sheet is empty)
    await ensureSheetHeaders(sheets, spreadsheetId, sheetName);
    
    // Prepare row data: timestamp, phone, targetID, eventType, zip, ip
    const rowData = [
      logData.timestamp,
      logData.phone,
      logData.targetID,
      logData.eventType,
      logData.zip,
      logData.ip,
    ];

    // Append row to sheet
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:F`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    console.log(`Google Sheets: Successfully appended row. Updated range: ${result.data.updates?.updatedRange || 'unknown'}`);
    return true;
  } catch (error) {
    console.error('Google Sheets: Error writing to sheet:', {
      message: error.message,
      code: error.code,
      details: error.response?.data || error.stack,
    });
    throw error;
  }
}

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { targetID, zip, phone, eventType } = JSON.parse(event.body || '{}');

    // Validate required parameters
    // For backward compatibility, targetID is required for 'call' events
    // For 'click' events, phone is required
    if (!targetID && !phone) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Either targetID or phone is required' }),
      };
    }

    // Determine event type (default to 'call' for backward compatibility)
    const type = eventType || 'call';
    
    // Extract IP address
    const ip = event.headers['x-forwarded-for'] || 
               event.requestContext?.identity?.sourceIp || 
               'unknown';

    // Prepare log data
    const logData = {
      timestamp: new Date().toISOString(),
      phone: phone || 'unknown',
      targetID: targetID || 'unknown',
      eventType: type,
      zip: zip || 'unknown',
      ip: ip,
    };

    // Log to console for debugging
    console.log(`${type === 'click' ? 'Click' : 'Call'} logged:`, logData);

    // Write to Google Sheets (if configured)
    let sheetsSuccess = false;
    let sheetsError = null;
    try {
      const result = await appendToGoogleSheets(logData);
      sheetsSuccess = result === true;
      if (result === null) {
        console.warn('Google Sheets: Integration skipped (not configured or credentials missing)');
      }
    } catch (error) {
      // Log error but don't fail the request
      sheetsError = error;
      console.error('Google Sheets: Write failed (continuing anyway):', {
        message: error.message,
        code: error.code,
      });
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        success: true,
        message: `${type === 'click' ? 'Click' : 'Call'} logged successfully`,
        sheetsLogged: sheetsSuccess,
        sheetsError: sheetsError ? sheetsError.message : null,
        ...logData,
      }),
    };
  } catch (error) {
    console.error('Error logging call:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};


