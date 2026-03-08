import { Paper } from './paperService'

// Types for AI responses
export interface PaperSummary {
    objective: string
    methodology: string
    contributions: string
    findings: string
    limitations: string
    future_research: string
    is_mock?: boolean
}

export interface ResearchTrend {
    topic: string
    growth: string
    sentiment: string
    papers: number
    description: string
}

export interface ResearchRecommendation {
    topic: string
    reason: string
    papers_count: number
}

// Provider Interface
interface AIProvider {
    generateSummary(title: string, abstract: string): Promise<PaperSummary>
    generateCitation(paper: Paper, format: string): Promise<string>
    generateLiteratureReview(papers: Paper[]): Promise<string>
    generateTrends(field: string): Promise<ResearchTrend[]>
    generateRecommendations(papers: Paper[]): Promise<ResearchRecommendation[]>
    generateResearchAnswer(question: string, papers: Paper[]): Promise<string>
}

// Helper: retry logic for transient failures
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1000): Promise<T> {
    let lastError: any
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn()
        } catch (err: any) {
            lastError = err
            const status = err?.status || err?.response?.status
            // Only retry on 429 (rate limit) or 503 (service unavailable)
            if (status === 429 || status === 503) {
                if (i < retries) {
                    console.warn(`Gemini API rate limited/unavailable. Retrying in ${delayMs}ms... (attempt ${i + 1}/${retries})`)
                    await new Promise(r => setTimeout(r, delayMs * (i + 1)))
                    continue
                }
            }
            throw err
        }
    }
    throw lastError
}

// Gemini Provider Implementation
class GeminiProvider implements AIProvider {
    constructor() {
    }

    private async callModel(prompt: string): Promise<string> {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set.")

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

        try {
            return await withRetry(async () => {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                })

                const data = await response.json()
                if (data.error) {
                    throw new Error(data.error.message || 'Gemini API Error')
                }

                if (!data.candidates || data.candidates.length === 0) {
                    throw new Error('No candidates returned from Gemini API')
                }

                return data.candidates[0].content.parts[0].text
            })
        } catch (err: any) {
            const message = err?.message || ''

            if (message.includes('quota') || message.includes('429')) {
                throw new Error("Gemini API quota exceeded. Please try again later or check your API key limits.")
            }
            if (message.includes('safety') || message.includes('blocked')) {
                throw new Error("Invalid request to Gemini API. This might be due to safety filters or an invalid prompt.")
            }
            if (message.includes('key') || message.includes('auth')) {
                throw new Error("Invalid or unauthorized Gemini API key. Please check your .env.local configuration.")
            }

            throw err
        }
    }

    async generateSummary(title: string, abstract: string): Promise<PaperSummary> {
        const prompt = `You are an academic research analyst. Analyze this research paper and provide a structured breakdown.

Title: ${title}
Abstract: ${abstract}

Return a JSON object with these fields. Each field should contain 2-4 detailed sentences.
{
    "objective": "What the paper aims to achieve",
    "methodology": "How the research was conducted",
    "contributions": "Key contributions to the field",
    "findings": "Main results and discoveries",
    "limitations": "Acknowledged limitations",
    "future_research": "Suggested future directions"
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks.`

        let responseText = ""
        let isMock = false

        try {
            responseText = await this.callModel(prompt)
        } catch (err: any) {
            console.error("Gemini Summary Error Details:", err)
            console.error("Gemini Summary Error Message:", err.message)
            console.error("API Key present in Next.js?:", !!process.env.GEMINI_API_KEY)
            isMock = true
        }

        let parsed: any = {}
        if (!isMock) {
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/)
                parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText)
            } catch (e) {
                console.error("Gemini Summary Parsing Error:", e)
                isMock = true
            }
        }

        const prefix = isMock ? "[MOCK] " : ""
        return {
            objective: parsed.objective || `${prefix}Analysis pending. Please check API quota.`,
            methodology: parsed.methodology || `${prefix}Methodology synthesis in progress.`,
            contributions: parsed.contributions || `${prefix}Core contributions identification active.`,
            findings: parsed.findings || `${prefix}Key findings extraction in progress.`,
            limitations: parsed.limitations || `${prefix}Critical limitation analysis pending.`,
            future_research: parsed.future_research || `${prefix}Future research direction synthesis active.`,
            is_mock: isMock
        }
    }

    async generateCitation(paper: Paper, format: string): Promise<string> {
        const prompt = `Generate a properly formatted ${format.toUpperCase()} citation for this academic paper:

Title: ${paper.title}
Authors: ${paper.authors?.join(', ') || 'Unknown'}
Year: ${paper.year || 'n.d.'}
Source: ${paper.source || 'Unknown Publisher'}
URL: ${paper.url || ''}

Return ONLY the formatted citation text, nothing else.`

        return (await this.callModel(prompt)).trim()
    }

    async generateLiteratureReview(papers: Paper[]): Promise<string> {
        const metadata = papers.map(p => `- **${p.title}** (${p.year || 'N/A'}): ${p.abstract || 'No abstract available.'}`).join('\n\n')
        const prompt = `You are an academic researcher. Write a comprehensive literature review that synthesizes the following research papers. Use proper academic tone, identify common themes, compare methodologies, and highlight gaps in the literature. Format the output in Markdown with clear sections.

PAPERS:
${metadata}`

        return await this.callModel(prompt)
    }

    async generateTrends(field: string): Promise<ResearchTrend[]> {
        const prompt = `Based on your knowledge of current research trends in "${field}", identify exactly 4 emerging trends. Each trend should be realistic and well-described.

Return a JSON array with exactly 4 objects. Each object must have these fields:
- "topic": Short topic name (3-5 words)
- "growth": Percentage growth like "+45%"
- "sentiment": One of "High", "Medium", or "Stable"
- "papers": Approximate number of papers (integer)
- "description": Brief description (1-2 sentences)

IMPORTANT: Return ONLY the JSON array, no markdown, no code blocks.`

        const responseText = await this.callModel(prompt)
        try {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/)
            return JSON.parse(jsonMatch ? jsonMatch[0] : responseText) || []
        } catch (e) {
            console.error("Trends Parsing Error:", e)
            console.error("Raw response:", responseText.substring(0, 500))
            return []
        }
    }

    async generateRecommendations(papers: Paper[]): Promise<ResearchRecommendation[]> {
        const contexts = papers.map(p => p.title).join(', ')
        const prompt = `Based on these research interests: ${contexts}

Suggest exactly 3 new research directions the user might find interesting. Return a JSON array with exactly 3 objects:
[{"topic": "...", "reason": "Why this is relevant (2 sentences)", "papers_count": approximate_number}]

IMPORTANT: Return ONLY the JSON array, no markdown, no code blocks.`

        const responseText = await this.callModel(prompt)
        try {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/)
            return JSON.parse(jsonMatch ? jsonMatch[0] : responseText) || []
        } catch (e) {
            console.error("Recommendations Parsing Error:", e)
            return []
        }
    }

    async generateResearchAnswer(question: string, papers: Paper[]): Promise<string> {
        const metadata = papers.map((p, i) => `[${i + 1}] "${p.title}" (${p.year || 'N/A'}) - ${p.abstract || 'No abstract available.'}`).join('\n\n')
        const prompt = `You are an academic research assistant. 

Use the following research papers to answer the user's question. Provide a clear, well-structured explanation and cite the papers where relevant using their numbers (e.g., [1], [2]).

USER QUESTION: "${question}"

RESEARCH PAPERS:
${metadata}

Format your response in Markdown. Include:
1. A clear answer to the question
2. Supporting evidence from the papers
3. Citations referencing the paper numbers
4. A brief conclusion`

        return await this.callModel(prompt)
    }
}

// Placeholder for OpenAI Provider
class OpenAIProvider implements AIProvider {
    async generateSummary(title: string, abstract: string): Promise<PaperSummary> { throw new Error('OpenAI Provider not implemented. Please use Gemini.') }
    async generateCitation(paper: Paper, format: string): Promise<string> { throw new Error('OpenAI Provider not implemented.') }
    async generateLiteratureReview(papers: Paper[]): Promise<string> { throw new Error('OpenAI Provider not implemented.') }
    async generateTrends(field: string): Promise<ResearchTrend[]> { throw new Error('OpenAI Provider not implemented.') }
    async generateRecommendations(papers: Paper[]): Promise<ResearchRecommendation[]> { throw new Error('OpenAI Provider not implemented.') }
    async generateResearchAnswer(question: string, papers: Paper[]): Promise<string> { throw new Error('OpenAI Provider not implemented.') }
}

// Client Factory
const getProvider = (): AIProvider => {
    const providerType = process.env.LLM_PROVIDER || 'gemini'
    if (providerType === 'openai') return new OpenAIProvider()
    return new GeminiProvider()
}

const client = getProvider()

// Exported Functions
export const summarizePaper = (t: string, a: string) => client.generateSummary(t, a)
export const generateCitation = (p: Paper, f: any) => client.generateCitation(p, f)
export const generateLiteratureReview = (ps: Paper[]) => client.generateLiteratureReview(ps)
export const getResearchTrends = (field: string) => client.generateTrends(field)
export const getResearchRecommendations = (ps: Paper[]) => client.generateRecommendations(ps)
export const generateResearchAnswer = (q: string, ps: Paper[]) => client.generateResearchAnswer(q, ps)
