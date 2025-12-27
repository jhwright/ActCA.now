// --- Netlify Serverless Function: send-suggestion.js ---
// Logs suggestion form submissions to Google Sheets

// Import google-auth-library directly for better serverless compatibility
import { JWT } from 'google-auth-library';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

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
    const normalizedPrivateKey = keyData.private_key?.replace(/\\n/g, '\n');
    
    const auth = new JWT({
      email: keyData.client_email,
      key: normalizedPrivateKey,
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

function buildUrl(base, path, query = {}) {
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

async function sheetsFetch({ auth, method, path, query, body }) {
  // Ensure the JWT has fetched tokens so requests include auth headers.
  await auth.authorize();
  const authHeaders = await auth.getRequestHeaders();

  const res = await fetch(buildUrl(SHEETS_API_BASE, path, query), {
    method,
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-json response (rare)
  }

  if (!res.ok) {
    const msg =
      json?.error?.message ||
      (typeof json?.message === 'string' ? json.message : null) ||
      (text || `HTTP ${res.status}`);
    const err = new Error(msg);
    err.code = res.status;
    err.response = { status: res.status, data: json || text };
    throw err;
  }

  return json;
}

async function ensureSuggestionsSheetHeaders(sheets, spreadsheetId, sheetName) {
  try {
    // Check if sheet exists and has headers
    const response = await sheetsFetch({
      auth: sheets.auth,
      method: 'GET',
      path: `/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`${sheetName}!A1:E1`)}`,
    });

    const values = response?.values;
    
    // If headers exist and match what we expect, skip
    if (values && values.length > 0 && values[0] && values[0].length >= 5) {
      const existingHeaders = values[0].map(h => String(h).toLowerCase());
      const expectedHeaders = ['timestamp', 'name', 'email', 'message', 'ip'];
      const hasAllHeaders = expectedHeaders.every(h => existingHeaders.includes(h));
      if (hasAllHeaders) {
        console.log('Suggestions sheet headers already exist');
        return;
      }
    }
    
    // Headers don't exist or don't match - write them
    console.log('Writing suggestions sheet headers...');
    const headers = ['timestamp', 'name', 'email', 'message', 'ip'];
    await sheetsFetch({
      auth: sheets.auth,
      method: 'PUT',
      path: `/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`${sheetName}!A1:E1`)}`,
      query: { valueInputOption: 'USER_ENTERED' },
      body: { values: [headers] },
    });
    console.log('Suggestions sheet headers written successfully');
  } catch (error) {
    // If GET fails (sheet doesn't exist), try to write headers anyway
    // The PUT might work if the sheet exists but is empty
    if (error.code === 400 || error.response?.status === 400) {
      console.warn('Sheet might not exist. Attempting to write headers anyway...');
      try {
        const headers = ['timestamp', 'name', 'email', 'message', 'ip'];
        await sheetsFetch({
          auth: sheets.auth,
          method: 'PUT',
          path: `/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`${sheetName}!A1:E1`)}`,
          query: { valueInputOption: 'USER_ENTERED' },
          body: { values: [headers] },
        });
        console.log('Suggestions sheet headers written successfully (after retry)');
      } catch (putError) {
        console.error('Could not write suggestions sheet headers. Sheet may need to be created manually:', putError.message);
        // Don't throw - we'll try to append anyway, which might work
      }
    } else {
      console.error('Error checking/writing suggestions sheet headers:', error.message);
      // Don't throw - we'll try to append anyway
    }
  }
}

async function appendSuggestionToGoogleSheets(suggestionData) {
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

    // We keep a lightweight "sheets" object for header initialization to reuse sheetsFetch().
    const sheets = { auth };
    
    // Use a separate sheet name for suggestions
    const sheetName = process.env.GOOGLE_SHEETS_SUGGESTIONS_SHEET_NAME || 'Suggestions';
    
    console.log(`Google Sheets: Attempting to write suggestion to sheet "${sheetName}" in spreadsheet ${spreadsheetId}`);
    
    // Ensure headers exist (only runs if sheet is empty)
    await ensureSuggestionsSheetHeaders(sheets, spreadsheetId, sheetName);
    
    // Prepare row data: timestamp, name, email, message, ip
    const rowData = [
      suggestionData.timestamp,
      suggestionData.name || 'Anonymous',
      suggestionData.email || 'Not provided',
      suggestionData.message,
      suggestionData.ip,
    ];

    // Append row to sheet
    const result = await sheetsFetch({
      auth,
      method: 'POST',
      path: `/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`${sheetName}!A:E`)}:append`,
      query: {
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
      },
      body: { values: [rowData] },
    });

    console.log(`Google Sheets: Successfully appended suggestion. Updated range: ${result?.updates?.updatedRange || 'unknown'}`);
    return true;
  } catch (error) {
    console.error('Google Sheets: Error writing suggestion to sheet:', {
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
    const { name, email, message } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Message is required',
          success: false,
        }),
      };
    }

    // Extract IP address
    const ip = event.headers['x-forwarded-for'] || 
               event.requestContext?.identity?.sourceIp || 
               'unknown';

    // Prepare suggestion data
    const suggestionData = {
      timestamp: new Date().toISOString(),
      name: name || 'Anonymous',
      email: email || 'Not provided',
      message: message,
      ip: ip,
    };

    // Log suggestion
    console.log('Suggestion received:', {
      name: suggestionData.name,
      email: suggestionData.email,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      timestamp: suggestionData.timestamp,
    });

    // Write to Google Sheets (if configured)
    let sheetsSuccess = false;
    let sheetsError = null;
    try {
      console.log('Attempting to write suggestion to Google Sheets...');
      const result = await appendSuggestionToGoogleSheets(suggestionData);
      sheetsSuccess = result === true;
      if (result === null) {
        console.warn('Google Sheets: Integration skipped (not configured or credentials missing)');
      } else {
        console.log('Successfully wrote suggestion to Google Sheets');
      }
    } catch (error) {
      // Log error but don't fail the request
      sheetsError = error;
      console.error('Google Sheets: Write failed (continuing anyway):', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        details: error.response?.data,
      });
    }

    // Success response
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
        message: 'Suggestion received successfully',
        sheetsLogged: sheetsSuccess,
        sheetsError: sheetsError ? sheetsError.message : null,
        sheetsErrorCode: sheetsError?.code ?? null,
        sheetsErrorStatus: sheetsError?.response?.status ?? null,
      }),
    };
  } catch (error) {
    console.error('Error sending suggestion:', error);
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
        success: false,
      }),
    };
  }
};

