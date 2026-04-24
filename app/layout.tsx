import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VetFitFapp',
  description: 'Genereer en beheer bootcamp trainingen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Foutopvang: toon JS-crashes zichtbaar op scherm */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.onerror = function(msg, src, line, col, err) {
            var div = document.getElementById('js-error-banner') || document.createElement('div');
            div.id = 'js-error-banner';
            div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#cc0000;color:#fff;padding:10px;z-index:99999;font-size:11px;word-break:break-all;white-space:pre-wrap';
            div.textContent = 'JS FOUT: ' + msg + '\\n' + src + ' regel ' + line;
            document.body && document.body.appendChild(div);
          };
          window.onunhandledrejection = function(e) {
            var div = document.getElementById('js-error-banner') || document.createElement('div');
            div.id = 'js-error-banner';
            div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#cc0000;color:#fff;padding:10px;z-index:99999;font-size:11px;word-break:break-all;white-space:pre-wrap';
            div.textContent = 'PROMISE FOUT: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason));
            document.body && document.body.appendChild(div);
          };
        ` }} />
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
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
