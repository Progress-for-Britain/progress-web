const axios = require('axios');

// Verifies a Cloudflare Turnstile token using server-side secret
// Looks up secret from several common env var names for flexibility
async function verifyTurnstileToken(token) {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY

  if (!secret) {
    return {
      success: false,
      error: 'Missing Turnstile secret. Set CLOUDFLARE_TURNSTILE_SECRET_KEY.'
    };
  }

  try {
    const body = new URLSearchParams();
    body.append('secret', secret);
    body.append('response', token);

    const { data } = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // data.success is boolean; data["error-codes"] may contain details
    return {
      success: !!data?.success,
      errorCodes: data?.["error-codes"] || [],
      action: data?.action,
      cdata: data?.cdata
    };
  } catch (err) {
    return {
      success: false,
      error: 'Verification request failed',
      details: err?.message || String(err)
    };
  }
}

module.exports = { verifyTurnstileToken };

