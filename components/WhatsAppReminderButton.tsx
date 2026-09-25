'use client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vetfitfapp.vercel.app'

const MESSAGE = `Strijders en strijdettes! Morgen gaan we weer gymmen! Wie is er bij? Lemme know. De training kun je misschien al in de app zien: ${APP_URL}`

export default function WhatsAppReminderButton() {
  const url = `https://wa.me/?text=${encodeURIComponent(MESSAGE)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between py-3.5 border-b border-line group"
    >
      <span className="flex items-center">
        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#25D366] mr-2.5" />
        <span className="font-label font-bold text-sm uppercase tracking-wider">WhatsApp-herinnering sturen</span>
      </span>
      <span aria-hidden="true" className="text-muted group-hover:text-ink transition-colors">↗</span>
    </a>
  )
}
