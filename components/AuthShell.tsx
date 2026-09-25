import Image from 'next/image'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

// Gedeelde opbouw voor inloggen, registreren en wachtwoordschermen:
// foto met clubnaam bovenaan (mobiel) of links (desktop), formulier op papier.
export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-2">
      <div className="relative h-[42vh] min-h-[260px] md:h-auto md:min-h-screen overflow-hidden bg-ink">
        <Image
          src="/photos/01-jong-en-energiek/02-samen-buiten-trainen.jpg"
          alt="Groep sporters na een buitentraining bij zonsondergang"
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="absolute left-0 right-0 bottom-0 p-6 md:p-10">
          <p className="font-display text-paper text-5xl md:text-7xl leading-none tracking-wide">VETFIT</p>
          <p className="font-label font-bold text-xs uppercase tracking-widest text-sage mt-2">Bootcamp buiten, elke week</p>
        </div>
      </div>

      <div className="flex items-start md:items-center justify-center px-5 py-8 md:py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl text-ink">{title}</h1>
          {subtitle && <p className="text-muted mt-2">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
