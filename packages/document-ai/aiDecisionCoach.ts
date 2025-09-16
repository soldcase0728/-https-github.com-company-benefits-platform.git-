// packages/document-ai/aiDecisionCoach.ts

/**
 * Minimal viable AI coach for plan recommendation with transparency.
 * Returns best plan, reasons, confidence, and disclaimer.
 */
export async function getRecommendation(employee: { age: number; dependents: number }, plans: any[]) {
  // In MVP, use a simple prompt and hardcoded response. Replace with real LLM call later.
  const prompt = `
    Employee: ${employee.age}, ${employee.dependents} dependents
    Options: ${plans.map(p => p.basics).join(', ')}
    Return: Best plan ID and 3 bullet points why
  `;

  // TODO: Replace with LLM call (OpenAI, Anthropic, etc.)
  return {
    recommendedPlan: "plan_123",
    reasons: [
      "Lowest total cost for family of 4",
      "Includes pediatric dental",
      "No referrals needed"
    ],
    confidence: 0.75,
    disclaimer: "Review all options"
  };
}
