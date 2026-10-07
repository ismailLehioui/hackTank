import nodemailer from 'nodemailer'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const paymentMessages = {
  'Bank transfer': {
    subject: 'HackTank 2026 - Bank transfer payment instructions',
    text: `Dear Participant,

Thank you for registering for HackTank 2026! 🦈

We’re excited to have you join us for this 24H+ experience of innovation, creativity and entrepreneurship.

You have selected bank transfer as your payment method.

To confirm and secure your participation, please proceed with the payment of 30 TND per person using the bank details below:

Bank: STB
Account Holder: JCI Sousse
RIB: 10500002018710778803

Please make sure to complete your payment before the event. Your place will only be confirmed once the payment has been received and verified.

We recommend completing the payment as soon as possible to secure your spot.

If you have any questions or encounter any issue regarding the payment or your registration, feel free to contact us:

52 910 682

We look forward to welcoming you to the Tank. 🦈

JCI Sousse
HackTank Team`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0b1928; line-height: 1.6;">
        <p>Dear Participant,</p>
        <p>Thank you for registering for HackTank 2026! 🦈</p>
        <p>We’re excited to have you join us for this 24H+ experience of innovation, creativity and entrepreneurship.</p>
        <p>You have selected bank transfer as your payment method.</p>
        <p>To confirm and secure your participation, please proceed with the payment of <strong>30 TND per person</strong> using the bank details below:</p>
        <p><strong>Bank:</strong> STB<br><strong>Account Holder:</strong> JCI Sousse<br><strong>RIB:</strong> 10500002018710778803</p>
        <p>Please make sure to complete your payment before the event. Your place will only be confirmed once the payment has been received and verified.</p>
        <p>We recommend completing the payment as soon as possible to secure your spot.</p>
        <p>If you have any questions or encounter any issue regarding the payment or your registration, feel free to contact us:</p>
        <p>📞 52 910 682</p>
        <p>We look forward to welcoming you to the Tank. 🦈</p>
        <p>JCI Sousse<br>HackTank Team</p>
      </div>
    `,
  },
  'Organizer payment': {
    subject: 'HackTank 2026 - Cash payment information',
    text: `Dear Participant,

Thank you for registering for HackTank 2026! 🦈

We’re excited to have you join us for this 24H+ experience of innovation, creativity and entrepreneurship.

You have selected cash payment as your payment method. The participation fee is 30 TND per person.

Our team will contact you shortly to provide you with the necessary details regarding the payment and your participation.

Please note that payment must be completed before the event in order to confirm your place.

If you have any questions or need any assistance regarding your registration, feel free to contact us:

52 910 682

Get ready to enter the Tank. 🦈

JCI Sousse
HackTank Team`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0b1928; line-height: 1.6;">
        <p>Dear Participant,</p>
        <p>Thank you for registering for HackTank 2026! 🦈</p>
        <p>We’re excited to have you join us for this 24H+ experience of innovation, creativity and entrepreneurship.</p>
        <p>You have selected cash payment as your payment method. The participation fee is <strong>30 TND per person</strong>.</p>
        <p>Our team will contact you shortly to provide you with the necessary details regarding the payment and your participation.</p>
        <p>Please note that payment must be completed before the event in order to confirm your place.</p>
        <p>If you have any questions or need any assistance regarding your registration, feel free to contact us:</p>
        <p>📞 52 910 682</p>
        <p>Get ready to enter the Tank. 🦈</p>
        <p>JCI Sousse<br>HackTank Team</p>
      </div>
    `,
  },
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const { paymentMethod, recipients } = request.body || {}
  const message = paymentMessages[paymentMethod]

  if (
    !message ||
    !Array.isArray(recipients) ||
    recipients.length === 0 ||
    recipients.length > 10 ||
    recipients.some((email) => typeof email !== 'string' || !emailPattern.test(email))
  ) {
    return response.status(400).json({ error: 'Invalid payment method or recipient list.' })
  }

  const { SMTP_USER, SMTP_APP_PASSWORD } = process.env
  if (!SMTP_USER || !SMTP_APP_PASSWORD) {
    return response.status(500).json({ error: 'Email service is not configured.' })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_APP_PASSWORD },
    })

    const uniqueRecipients = [...new Set(recipients.map((email) => email.trim().toLowerCase()))]
    for (const recipient of uniqueRecipients) {
      await transporter.sendMail({
        from: `HackTank 2026 <${SMTP_USER}>`,
        to: recipient,
        ...message,
      })
    }

    return response.status(200).json({ ok: true, sent: uniqueRecipients.length })
  } catch (error) {
    console.error('Payment instructions email failed:', error)
    return response.status(500).json({ error: 'Failed to send payment instructions.' })
  }
}