import nodemailer from 'nodemailer'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vetfitfapp.vercel.app'
const INSTRUCTOR_EMAIL = process.env.INSTRUCTOR_EMAIL ?? ''

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  })
}

// ── Welkomstmail voor nieuwe atleet ──────────────────────────────
export async function sendWelcomeEmail(to: string) {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"VetFitFapp" <${process.env.EMAIL_USER}>`,
    to,
    subject: '💪 Welkom bij VetFitFapp!',
    html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1f2937;">

        <!-- Header met logo -->
        <tr>
          <td align="center" style="padding:32px 32px 24px;background:#111827;border-bottom:1px solid #1f2937;">
            <img src="${APP_URL}/icon.png" width="72" height="72"
              style="border-radius:16px;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" alt="VetFitFapp" />
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Welkom bij VetFitFapp! 🎉</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="color:#d1d5db;font-size:16px;line-height:1.6;margin:0 0 16px;">
              Potverdorie, heb je nu gewoon een account aangemaakt in de VetFitFapp? Jazeker, heb jij dat! Je kunt nu inloggen en de trainingen bekijken en als de meester er een keertje niet is, kun je gewoon zelf een training maken. Hoe vet is dat!
            </p>
            <p style="color:#d1d5db;font-size:16px;line-height:1.6;margin:0 0 24px;">
              📅 We trainen <strong style="color:#ffffff;">elke zaterdag van 10:00–11:00</strong>. Kijk vrijdag in de app voor de training van de volgende dag.
            </p>

            <!-- CTA knop -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 24px;">
                  <a href="${APP_URL}"
                    style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;font-size:16px;
                    text-decoration:none;padding:14px 32px;border-radius:12px;">
                    Open de app →
                  </a>
                </td>
              </tr>
            </table>

            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;border-top:1px solid #1f2937;padding-top:20px;">
              Tot zaterdag! 💪<br/>
              <strong style="color:#9ca3af;">VetFitFapp</strong>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

// ── Melding aan instructor bij nieuwe aanmelding ──────────────────
export async function sendNewUserNotification(newUserEmail: string) {
  if (!INSTRUCTOR_EMAIL) return
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"VetFitFapp" <${process.env.EMAIL_USER}>`,
    to: INSTRUCTOR_EMAIL,
    subject: '🆕 Nieuwe atleet aangemeld',
    html: `
<body style="font-family:sans-serif;background:#0a0a0a;padding:32px 20px;">
  <div style="max-width:480px;margin:0 auto;background:#111827;border-radius:16px;padding:28px;border:1px solid #1f2937;">
    <h2 style="color:#ffffff;margin:0 0 12px;">Nieuwe aanmelding 🎉</h2>
    <p style="color:#d1d5db;font-size:16px;margin:0;">
      <strong style="color:#f97316;">${newUserEmail}</strong> heeft zich zojuist aangemeld voor VetFitFapp.
    </p>
  </div>
</body>`,
  })
}

// ── Vrijdag reminder aan instructor ──────────────────────────────
export async function sendFridayReminder() {
  if (!INSTRUCTOR_EMAIL) return

  const whatsappText = encodeURIComponent(
    `Strijders en strijdettes! Morgen gaan we weer gymmen! Wie is er bij? Lemme know. De training kun je misschien al in de app zien: ${APP_URL}`
  )
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`

  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"VetFitFapp" <${process.env.EMAIL_USER}>`,
    to: INSTRUCTOR_EMAIL,
    subject: '📲 Vrijdagreminder – stuur de WhatsApp naar de groep',
    html: `
<body style="font-family:sans-serif;background:#0a0a0a;padding:32px 20px;">
  <div style="max-width:480px;margin:0 auto;background:#111827;border-radius:16px;padding:28px;border:1px solid #1f2937;">
    <h2 style="color:#ffffff;margin:0 0 8px;">Vergeet de WhatsApp niet! 💬</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Morgen is er bootcamp. Stuur de reminder naar de groep:</p>

    <!-- Bericht om te kopiëren -->
    <div style="background:#1f2937;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0;white-space:pre-line;">Strijders en strijdettes! Morgen gaan we weer gymmen! Wie is er bij? Lemme know. De training kun je misschien al in de app zien: ${APP_URL}</p>
    </div>

    <!-- WhatsApp knop -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${whatsappUrl}"
            style="display:inline-block;background:#25D366;color:#ffffff;font-weight:700;font-size:16px;
            text-decoration:none;padding:14px 28px;border-radius:12px;">
            📲 Open WhatsApp met bericht
          </a>
        </td>
      </tr>
    </table>

    <p style="color:#6b7280;font-size:13px;margin:24px 0 0;text-align:center;">
      Of kopieer het bericht hierboven en plak het in de groep.
    </p>
  </div>
</body>`,
  })
}
