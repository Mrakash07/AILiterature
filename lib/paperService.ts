export interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string | null
  year: number | null
  source: string
  url: string | null
}

const SEMANTIC_SCHOLAR_URL =
  "https://api.semanticscholar.org/graph/v1/paper/search"

const OPENALEX_URL = "https://api.openalex.org/works"

/**
 * Search papers from Semantic Scholar API.
 * Falls back to OpenAlex if Semantic Scholar fails.
 */
export async function searchPapers(
  query: string,
  limit = 10
): Promise<Paper[]> {
  // Try Semantic Scholar first
  try {
    const papers = await searchSemanticScholar(query, limit)
    if (papers.length > 0) return papers
  } catch (error) {
    console.warn("Semantic Scholar failed, trying OpenAlex fallback:", error)
  }

  // Fallback to OpenAlex (free, no rate limits)
  try {
    const papers = await searchOpenAlex(query, limit)
    if (papers.length > 0) return papers
  } catch (error) {
    console.warn("OpenAlex also failed:", error)
  }

  // If both APIs fail, return empty instead of fake data
  return []
}

async function searchSemanticScholar(
  query: string,
  limit: number
): Promise<Paper[]> {
  const response = await fetch(
    `${SEMANTIC_SCHOLAR_URL}?query=${encodeURIComponent(
      query
    )}&limit=${limit}&fields=paperId,title,authors,abstract,year,url`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // cache for 5 minutes
    }
  )

  if (!response.ok) {
    throw new Error(
      `Semantic Scholar API responded with ${response.status}`
    )
  }

  const data = await response.json()

  if (!data.data) {
    return []
  }

  return data.data.map((paper: any) => ({
    id: String(paper.paperId || `ss-${Math.random().toString(36).substr(2, 9)}`),
    title: paper.title || 'Untitled Research',
    authors: Array.isArray(paper.authors) ? paper.authors.map((a: any) => a.name).filter(Boolean) : [],
    abstract: paper.abstract || null,
    year: paper.year || null,
    source: "Semantic Scholar",
    url: paper.url || null,
  }))
}

async function searchOpenAlex(
  query: string,
  limit: number
): Promise<Paper[]> {
  const response = await fetch(
    `${OPENALEX_URL}?search=${encodeURIComponent(query)}&per_page=${limit}&select=id,title,authorships,abstract_inverted_index,publication_year,doi`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "AILiterature/1.0 (mailto:research@ailiterature.app)",
      },
      next: { revalidate: 300 },
    }
  )

  if (!response.ok) {
    throw new Error(`OpenAlex API responded with ${response.status}`)
  }

  const data = await response.json()

  if (!data.results || data.results.length === 0) {
    return []
  }

  return data.results.map((work: any) => {
    // Reconstruct abstract from inverted index
    let abstract: string | null = null
    if (work.abstract_inverted_index) {
      const invertedIndex: Record<string, number[]> = work.abstract_inverted_index
      const words: [string, number][] = []
      for (const [word, positions] of Object.entries(invertedIndex)) {
        for (const pos of positions) {
          words.push([word, pos])
        }
      }
      words.sort((a, b) => a[1] - b[1])
      abstract = words.map(w => w[0]).join(' ')
    }

    // Extract OpenAlex ID (last part of the URL)
    const openAlexId = work.id ? work.id.replace('https://openalex.org/', '') : `oa-${Math.random().toString(36).substr(2, 9)}`

    // Build URL from DOI if available
    const url = work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : null

    return {
      id: openAlexId,
      title: work.title || 'Untitled Research',
      authors: Array.isArray(work.authorships)
        ? work.authorships
          .map((a: any) => a.author?.display_name)
          .filter(Boolean)
        : [],
      abstract,
      year: work.publication_year || null,
      source: "OpenAlex",
      url,
    }
  })
}

/**
 * Enhanced search that handles user history and Firestore caching.
 * Can be called from both Server Components and API routes.
 */
export async function searchAndCachePapers(
  query: string,
  limit: number = 10,
  userId?: string,
  adminDb?: any
): Promise<Paper[]> {
  // 1. Save search history if user is logged in
  if (userId && adminDb) {
    adminDb.collection('search_history').add({
      user_id: userId,
      query: query,
      created_at: new Date().toISOString()
    }).catch((error: any) => {
      console.error('Failed to save search history:', error)
    })
  }

  // 2. Fetch papers from APIs
  const papers = await searchPapers(query, limit)

  // 3. Cache papers in Firestore for later reference
  if (papers.length > 0 && adminDb) {
    try {
      const batch = adminDb.batch()
      papers.forEach((p: Paper) => {
        if (!p.id) return // Safety check
        const docRef = adminDb.collection('papers').doc(p.id)
        batch.set(docRef, {
          id: p.id,
          title: p.title,
          authors: p.authors || [],
          abstract: p.abstract || null,
          year: p.year || null,
          source: p.source || 'Database',
          url: p.url || null,
          updated_at: new Date().toISOString()
        }, { merge: true })
      })
      // We don't await batch.commit() to keep the response fast
      batch.commit().catch((error: any) => {
        console.error('Firestore Papers Batch Write Error:', error)
      })
    } catch (e) {
      console.error('Batch setup error:', e)
    }
  }

  return papers
}