/**
 * TruthLens Optional AI & Heuristic Assistance Service
 *
 * NOTE: As mandated by TruthLens architectural principles, this service is STRICTLY
 * optional and provides advisory assistance only. It never defines factual verdicts.
 */

const CATEGORY_KEYWORDS = {
  FINANCE: ['bank', 'rbi', 'money', 'tax', 'surcharge', 'account', 'currency', 'stock', 'crypto', 'inflation', 'deposit', 'withdrawal'],
  HEALTH: ['doctor', 'hospital', 'medicine', 'pharma', 'cure', 'cancer', 'vaccine', 'virus', 'diet', 'sodium', 'health', 'disease'],
  POLITICS: ['government', 'minister', 'election', 'parliament', 'court', 'law', 'police', 'president', 'prime minister', 'policy', 'vote']
};

/**
 * Suggests an editorial category based on claim text.
 * Falls back to deterministic keyword matching if no external LLM is configured.
 *
 * @param {string} text
 * @returns {{ suggestedCategory: string, confidence: number, isAiPowered: boolean, reasoning: string }}
 */
export function suggestCategory(text = '') {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matched = keywords.filter((kw) => lower.includes(kw));
    if (matched.length > 0) {
      return {
        suggestedCategory: category,
        confidence: Math.min(0.9, 0.5 + matched.length * 0.15),
        isAiPowered: false,
        reasoning: `Identified thematic keywords: "${matched.slice(0, 3).join(', ')}"`
      };
    }
  }

  return {
    suggestedCategory: 'OTHER',
    confidence: 0.4,
    isAiPowered: false,
    reasoning: 'No specific domain keywords matched; defaulted to Other category.'
  };
}

/**
 * Generates recommended official research queries for the human reviewer.
 * @param {Object} claim
 * @returns {Array<{ label: string, query: string, targetType: string }>}
 */
export function generateResearchAssistance(claim) {
  if (!claim || !claim.text) return [];

  // Extract core keywords
  const cleanSnippet = claim.text
    .replace(/BREAKING|SHOCKING|SHARE BEFORE DELETED|[!?:;"]/gi, '')
    .trim()
    .slice(0, 60);

  const assistance = [
    {
      label: 'Official Gazette / Government Search',
      query: `site:gov.* "${cleanSnippet}"`,
      targetType: 'Regulatory'
    },
    {
      label: 'Verified Fact-Check Database Search',
      query: `fact check "${cleanSnippet}"`,
      targetType: 'Fact-Checkers'
    },
    {
      label: 'Credible Wire Services Search',
      query: `(Reuters OR AP OR "Press Trust") "${cleanSnippet}"`,
      targetType: 'News Wires'
    }
  ];

  return assistance;
}
