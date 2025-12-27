// --- Netlify Serverless Function: submit-suggestion.js ---
// Handles suggestion box form submissions with hCaptcha verification

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
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse JSON body
    let email, suggestion, captchaToken;
    
    try {
      const data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      email = data.email;
      suggestion = data.suggestion;
      captchaToken = data['h-captcha-response'];
    } catch (parseError) {
      // Fallback: try URL-encoded form data
      const formData = new URLSearchParams(event.body);
      email = formData.get('email');
      suggestion = formData.get('suggestion');
      captchaToken = formData.get('h-captcha-response');
    }

    // Validate required fields
    if (!email || !suggestion || !captchaToken) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Missing required fields. Please complete all fields and verify you are human.' 
        }),
      };
    }

    // Verify hCaptcha token
    const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY || '0x0000000000000000000000000000000000000000'; // Default test key
    const verifyUrl = 'https://hcaptcha.com/siteverify';
    
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: hcaptchaSecret,
        response: captchaToken,
      }),
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.success) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Captcha verification failed. Please try again.' 
        }),
      };
    }

    // Log submission (in production, you'd send email or store in database)
    const submission = {
      email,
      suggestion,
      timestamp: new Date().toISOString(),
      ip: event.headers['x-forwarded-for'] || event.requestContext?.identity?.sourceIp || 'unknown',
      userAgent: event.headers['user-agent'] || 'unknown',
    };

    console.log('Suggestion submitted:', JSON.stringify(submission, null, 2));

    // TODO: Send email notification
    // You can use Netlify's built-in email service, SendGrid, or another email provider
    // Example with Netlify Functions + SendGrid:
    // await sendEmail({
    //   to: process.env.ADMIN_EMAIL,
    //   subject: 'New Suggestion Box Submission',
    //   text: `Email: ${email}\n\nSuggestion:\n${suggestion}`,
    // });

    // Return success response
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
        message: 'Your suggestion has been received. Thank you!',
      }),
    };
  } catch (error) {
    console.error('Error processing suggestion:', error);
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

