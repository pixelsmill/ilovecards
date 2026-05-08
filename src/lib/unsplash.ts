export async function fetchUnsplashImage(query: string): Promise<string | undefined> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) return undefined
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=portrait`,
      { headers: { Authorization: `Client-ID ${accessKey}` }, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return undefined
    const data = await res.json()
    return (data.results?.[0]?.urls?.regular as string | undefined) ?? undefined
  } catch {
    return undefined
  }
}
