import nodemailer from 'nodemailer'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    const { email, code } = request.body || {}

    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof code !== 'string' ||
      !/^\d{6}$/.test(code)
    ) {
      return response.status(400).json({ error: 'Invalid email or verification code.' })
    }

    const { SMTP_USER, SMTP_APP_PASSWORD } = process.env

    if (!SMTP_USER || !SMTP_APP_PASSWORD) {
      return response.status(500).json({
        error: 'Email service is not configured. Set SMTP_USER and SMTP_APP_PASSWORD.',
      })
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `Hack Tank <${SMTP_USER}>`,
      to: email,
      subject: 'Your Hack Tank verification code',
      text: `Your Hack Tank verification code is: ${code}. It is valid for a few minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0b1928; line-height: 1.6;">
          <p>Hello,</p>
          <p>Here is your Hack Tank verification code:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
          <p>This code is valid for a few minutes.</p>
        </div>
      `,
    })

    return response.status(200).json({ ok: true })
  } catch (error) {
    console.error('Verification email failed:', error)
    return response.status(500).json({
      error: 'Failed to send verification email.',
    })
  }
}