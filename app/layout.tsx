import type { Metadata } from 'next'
import { Anton, Archivo, Archivo_Narrow } from 'next/font/google'
import './globals.css'

const display = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display', display: 'swap' })
const body = Archivo({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body', display: 'swap' })
const label = Archivo_Narrow({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-label', display: 'swap' })

export const metadata: Metadata = {
  title: 'VetFitFapp',
  description: 'Genereer en beheer bootcamp trainingen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning className={`${display.variable} ${body.variable} ${label.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
{/* Polyfills voor iOS 12 — moet vóór alle andere scripts laden */}
        <script dangerouslySetInnerHTML={{ __html: `
          if (typeof globalThis === 'undefined') { var globalThis = window; }
          if (!Promise.allSettled) {
            Promise.allSettled = function(ps) {
              return Promise.all(ps.map(function(p) {
                return Promise.resolve(p).then(
                  function(v) { return { status: 'fulfilled', value: v }; },
                  function(r) { return { status: 'rejected', reason: r }; }
                );
              }));
            };
          }
          if (!Object.fromEntries) {
            Object.fromEntries = function(entries) {
              return Array.from(entries).reduce(function(o, e) { o[e[0]] = e[1]; return o; }, {});
            };
          }
          if (!('queueMicrotask' in window)) {
            window.queueMicrotask = function(fn) { Promise.resolve().then(fn); };
          }
          if (!('structuredClone' in window)) {
            window.structuredClone = function(obj) {
              try { return JSON.parse(JSON.stringify(obj)); } catch(e) { return obj; }
            };
          }
        ` }} />
      </head>
      <body className="min-h-screen antialiased bg-paper text-ink font-sans">
        {children}
      </body>
    </html>
  )
}
