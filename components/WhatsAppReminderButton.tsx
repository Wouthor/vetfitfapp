'use client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vetfitfapp.vercel.app'

const MESSAGE = `Hey VetFit crew! 💪

Morgen (zaterdag) trainen we weer van 10:00–11:00. Wie is er bij? Laat het weten! 🏃

De training staat klaar in de app: ${APP_URL}`

export default function WhatsAppReminderButton() {
  const url = `https://wa.me/?text=${encodeURIComponent(MESSAGE)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border border-green-800/50 bg-green-900/20 hover:bg-green-900/40 text-green-400 font-semibold transition-colors"
    >
      📲 Stuur WhatsApp reminder
    </a>
  )
}
