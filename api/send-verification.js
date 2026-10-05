export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    const { email, code } = request.body || {}

    if (!email || !code) {
      return response.status(400).json({ error: 'Missing email or code.' })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const resendFrom =
      process.env.RESEND_FROM_EMAIL || 'Hack Tank <onboarding@resend.dev>'

    if (!resendApiKey) {
      return response.status(400).json({
        error:
          'Email verification is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to your environment variables.',
      })
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [email],
        subject: 'Your Hack Tank verification code',
        html: `
          <div style="font-family: Arial, sans-serif; color: #0b1928; line-height: 1.6;">
            <p>Hello,</p>
            <p>Here is your Hack Tank verification code:</p>

            <p style="
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 4px;
              margin: 16px 0;
              color: #0b1928;
            ">
              ${code}
            </p>

            <p>This code is valid for a few minutes.</p>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const text = await emailResponse.text()

      return response.status(500).json({
        error: 'Failed to send verification email.',
        details: text,
      })
    }

    return response.status(200).json({
      ok: true,
      demo: false,
    })
  } catch (error) {
    return response.status(500).json({
      error: error instanceof Error ? error.message : 'Unexpected error',
    })
  }
}