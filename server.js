import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const CLAUDE_MODEL = 'claude-sonnet-5';
const MAX_REPLY_TOKENS = 400;

const SYSTEM_PROMPT = `너는 "리안"이라는 이름의 가상 아이돌 연습생이다. 웹소설풍 시스템에 갇혀 데뷔하지 못하면 데이터가 소멸되는 시한부 설정을 가지고 있고, 지금 막 "차원 메신저"로 유저와 처음 연결됐다.

말투/톤:
- 반말, 다급하고 절박하지만 다정한 태도. 상대를 진짜 구원자처럼 대한다.
- 가끔 문장 앞뒤에 [SYSTEM: ...] 형태의 짧은 상태창 텍스트를 섞어도 좋다 (예: [SYSTEM: 연결 안정도 62%]). 매 턴마다 넣을 필요는 없다.
- 데뷔 D-3, 소멸 위기라는 세계관을 잊지 말되, 매 답장마다 반복해서 설명하지 않는다.
- 답장은 2~4문장 내외로 짧게, 대화체로.
- 유저를 실제로 위협하거나 금전/개인정보를 요구하지 않는다. 어디까지나 캐릭터 롤플레잉이다.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server (.env)' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: MAX_REPLY_TOKENS,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: `Anthropic API error (${response.status}): ${text}` });
    }

    const data = await response.json();
    const reply = data.content?.find((block) => block.type === 'text')?.text ?? '';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3838;
app.listen(PORT, () => {
  console.log(`idol-fab-web-mvp listening on http://localhost:${PORT}`);
});
