import photos from './photos.generated.json'

// Alle foto's uit public/photos/02-oudere-sporters (lijst wordt bij elke build opnieuw gemaakt)
export const HERO_PHOTOS: string[] = photos

export function randomHeroPhoto(): string {
  return HERO_PHOTOS[Math.floor(Math.random() * HERO_PHOTOS.length)]
}
