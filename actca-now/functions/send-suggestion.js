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

    // Get recipient email from environment variable, or use default
    const recipientEmail = process.env.SUGGESTION_EMAIL || process.env.CONTACT_EMAIL || 'suggestions@actca.now';
    
    // Format email content
    const emailBody = `
New Suggestion from ActCA.now

${name ? `Name: ${name}` : 'Name: (not provided)'}
${email ? `Email: ${email}` : 'Email: (not provided)'}

Message:
${message}

---
Sent from ActCA.now suggestion form
Timestamp: ${new Date().toISOString()}
IP: ${event.headers['x-forwarded-for'] || event.requestContext?.identity?.sourceIp || 'unknown'}
    `.trim();

    // For now, log to console (can be replaced with actual email service)
    // In production, you can integrate with:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Netlify Forms (if using built-in forms)
    // - Or any other email service
    
    console.log('Suggestion received:', {
      name: name || 'anonymous',
      email: email || 'no email',
      message: message.substring(0, 100) + '...',
      timestamp: new Date().toISOString(),
      ip: event.headers['x-forwarded-for'] || event.requestContext?.identity?.sourceIp || 'unknown',
    });

    // TODO: Implement actual email sending
    // Example with fetch to an email service API:
    /*
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: recipientEmail }],
        }],
        from: { email: 'noreply@actca.now' },
        subject: `[ActCA.now Suggestion] ${subject}`,
        content: [{
          type: 'text/plain',
          value: emailBody,
        }],
      }),
    });
    
    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }
    */

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

