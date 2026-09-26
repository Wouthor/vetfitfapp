// Maakt een lijst van alle foto's in de fotomap, zodat de app er willekeurig een kan kiezen.
// Draait automatisch vóór `npm run dev` en `npm run build` (predev/prebuild).
import fs from 'fs'
import path from 'path'

const FOLDER = 'photos/02-oudere-sporters'
const dir = path.join(process.cwd(), 'public', FOLDER)
const photos = fs
  .readdirSync(dir)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort()
  .map((f) => `/${FOLDER}/${f}`)

if (photos.length === 0) throw new Error(`Geen foto's gevonden in public/${FOLDER}`)

fs.writeFileSync(
  path.join(process.cwd(), 'lib', 'photos.generated.json'),
  JSON.stringify(photos, null, 2) + '\n'
)
console.log(`Fotolijst: ${photos.length} foto's uit public/${FOLDER}`)
