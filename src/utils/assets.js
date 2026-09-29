/*
  Image resolver.

  Content data refers to images by a key relative to src/assets/images,
  without extension (e.g. "posters/llm-poster"). If a file with that name
  exists in any supported format, its URL is returned; otherwise null, and
  the UI renders a designed placeholder.

  To add a missing poster, QR code, team photo or gallery photo, drop the file
  into src/assets/images using the expected name — no code changes needed.
  Photos that have "-800"/"-1600" variants get a responsive srcSet.
*/

const files = import.meta.glob('../assets/images/**/*.{webp,jpg,jpeg,png,avif,svg}', {
  eager: true,
  import: 'default',
})

const byKey = new Map()

for (const [path, url] of Object.entries(files)) {
  const key = path.replace('../assets/images/', '').replace(/\.[a-z]+$/i, '')
  byKey.set(key, url)
}

const WIDTHS = [800, 1600]

/**
 * @param {string | null | undefined} key
 * @returns {{ src: string, srcSet?: string } | null}
 */
export function resolveImage(key) {
  if (!key) return null

  const variants = WIDTHS.filter((w) => byKey.has(`${key}-${w}`))
  if (variants.length) {
    return {
      src: byKey.get(`${key}-${variants[0]}`),
      srcSet: variants.map((w) => `${byKey.get(`${key}-${w}`)} ${w}w`).join(', '),
    }
  }

  const url = byKey.get(key)
  return url ? { src: url } : null
}
