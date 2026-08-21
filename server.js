import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { callChatModel } from './lib/chat.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server (.env)' });
  }

  try {
    const reply = await callChatModel(messages, apiKey);
    res.json({ reply });
  } catch (err) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3838;
app.listen(PORT, () => {
  console.log(`idol-fab-web-mvp listening on http://localhost:${PORT}`);
});
