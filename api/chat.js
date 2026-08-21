import { callClaude } from '../lib/claude.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages must be a non-empty array' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured (Vercel Project Settings > Environment Variables)' });
    return;
  }

  try {
    const reply = await callClaude(messages, apiKey);
    res.status(200).json({ reply });
  } catch (err) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
}
