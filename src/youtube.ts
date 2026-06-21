/** Extrait l'ID d'une vidéo YouTube depuis une URL ou un ID brut. */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim()
  if (!s) return null
  // Déjà un ID (11 caractères typiques).
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s
  try {
    const url = new URL(s)
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1) || null
    }
    if (url.hostname.endsWith('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v')
      const m = url.pathname.match(/\/(embed|shorts|v)\/([a-zA-Z0-9_-]+)/)
      if (m) return m[2]
    }
  } catch {
    // pas une URL valide
  }
  return null
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function youtubeEmbedUrl(id: string, autoplay = true): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&rel=0`
}
