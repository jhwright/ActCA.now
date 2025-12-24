// --- Netlify Serverless Function: log-call.js ---
// Logs call actions to Google Sheets (placeholder implementation)

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { targetID, zip } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!targetID) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'targetID is required' }),
      };
    }

    // TODO: Implement Google Sheets API integration
    // Placeholder: Log to console (in production, this would write to Google Sheets)
    console.log('Call logged:', {
      targetID,
      zip: zip || 'unknown',
      timestamp: new Date().toISOString(),
      ip: event.headers['x-forwarded-for'] || event.requestContext?.identity?.sourceIp || 'unknown',
    });

    // Placeholder response - in production, this would confirm Google Sheets write
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
        message: 'Call logged successfully',
        targetID,
        zip: zip || 'unknown',
      }),
    };
  } catch (error) {
    console.error('Error logging call:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};

