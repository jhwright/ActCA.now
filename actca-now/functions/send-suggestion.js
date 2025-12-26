// --- Netlify Serverless Function: send-suggestion.js ---
// Sends suggestion form submissions via email using Netlify Forms or external service

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

    // Send to Discord webhook
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;

    if (discordWebhook) {
      try {
        const discordResponse = await fetch(discordWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            embeds: [{
              title: '💡 New Suggestion from ActCA.now',
              color: 0xFACC15, // Yellow-400
              fields: [
                {
                  name: '👤 Name',
                  value: name || 'Anonymous',
                  inline: true
                },
                {
                  name: '📧 Email',
                  value: email || 'Not provided',
                  inline: true
                },
                {
                  name: '💬 Message',
                  value: message.length > 1024 ? message.substring(0, 1021) + '...' : message,
                  inline: false
                }
              ],
              timestamp: new Date().toISOString(),
              footer: {
                text: `IP: ${event.headers['x-forwarded-for'] || event.requestContext?.identity?.sourceIp || 'unknown'}`
              }
            }]
          })
        });

        if (!discordResponse.ok) {
          console.error('Discord webhook failed:', await discordResponse.text());
        }
      } catch (error) {
        console.error('Failed to send Discord notification:', error);
        // Don't fail the whole request if Discord fails
      }
    } else {
      console.log('No Discord webhook configured. Suggestion received:', {
        name: name || 'anonymous',
        email: email || 'no email',
        message: message.substring(0, 100) + '...',
        timestamp: new Date().toISOString(),
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

