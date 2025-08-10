import { tavily } from "@tavily/core";

// Shape returned to callers / tools
export interface TavilyResultSummary {
  title: string;
  snippet: string;
  url: string;
}

let _client: ReturnType<typeof tavily> | null = null;

function getClient() {
  if (_client) return _client;
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY not set");
  }
  _client = tavily({ apiKey });
  return _client;
}

/**
 * Runs a Tavily web search and returns simplified results.
 * - Limits maxResults to 5 for concise reasoning.
 * - Avoids large payloads (no raw content/images answer request).
 * - Gracefully handles and logs (server side) errors returning empty array.
 */
export async function searchTavily(query: string): Promise<TavilyResultSummary[]> {
  if (!query || !query.trim()) return [];
  try {
    const client = getClient();
    const res = await client.search(query, {
      maxResults: 5,
      searchDepth: "advanced",
      includeAnswer: false,
      includeRawContent: false,
    } as any); // types from sdk allow flexible param bag
    return (res.results || []).map(r => ({
      title: r.title,
      snippet: r.content?.slice(0, 280) || "",
      url: r.url,
    }));
  } catch (err) {
    console.error("Tavily search failed", err);
    return [];
  }
}
