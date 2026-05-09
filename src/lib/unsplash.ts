export async function fetchUnsplashImage(query: string): Promise<string | undefined> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) return undefined
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + " background")}&per_page=5&orientation=portrait`,
      { headers: { Authorization: `Client-ID ${accessKey}` }, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return undefined
    const data = await res.json()
    const results = data.results as Array<{ urls: { regular: string } }> | undefined
    if (!results?.length) return undefined
    const pick = results[Math.floor(Math.random() * results.length)]
    return pick.urls.regular
  } catch {
    return undefined
  }
}
