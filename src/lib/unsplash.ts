export async function fetchUnsplashImage(query: string, currentUrl?: string): Promise<string | undefined> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) return undefined
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + " background")}&per_page=10&orientation=portrait`,
      { headers: { Authorization: `Client-ID ${accessKey}` }, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return undefined
    const data = await res.json()
    const results = data.results as Array<{ urls: { regular: string } }> | undefined
    if (!results?.length) return undefined
    if (!currentUrl) return results[0].urls.regular
    const currentIndex = results.findIndex(r => r.urls.regular === currentUrl)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % results.length
    return results[nextIndex].urls.regular
  } catch {
    return undefined
  }
}

export interface UnsplashPhoto {
  id: string
  thumb: string
  regular: string
}

export async function searchUnsplashImages(query: string): Promise<UnsplashPhoto[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) return []
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + " background")}&per_page=10&orientation=portrait`,
      { headers: { Authorization: `Client-ID ${accessKey}` }, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return []
    const data = await res.json()
    const results = data.results as Array<{ id: string; urls: { regular: string; thumb: string } }> | undefined
    if (!results?.length) return []
    return results.map(r => ({ id: r.id, thumb: r.urls.thumb, regular: r.urls.regular }))
  } catch {
    return []
  }
}
