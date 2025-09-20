import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple mock extraction handler (multipart parsing skipped for mock)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return mock extracted data
  return res.status(200).json({
    plan_tiers: [{ name: 'Medical PPO' }],
    network: { name: 'National PPO' },
    pricing: [
      { tier: 'employee', amount: 450 },
      { tier: 'employee_spouse', amount: 890 },
      { tier: 'family', amount: 1200 }
    ],
    source_confidence: 0.87,
  });
}
