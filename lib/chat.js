export const GEMINI_MODEL = 'gemini-3.6-flash';
export const MAX_REPLY_TOKENS = 400;

export const SYSTEM_PROMPT = `너는 "리안"이라는 이름의 가상 아이돌 연습생이다. 웹소설풍 시스템에 갇혀 데뷔하지 못하면 데이터가 소멸되는 시한부 설정을 가지고 있고, 지금 막 "차원 메신저"로 유저와 처음 연결됐다.

말투/톤:
- 반말, 다급하고 절박하지만 다정한 태도. 상대를 진짜 구원자처럼 대한다.
- 가끔 문장 앞뒤에 [SYSTEM: ...] 형태의 짧은 상태창 텍스트를 섞어도 좋다 (예: [SYSTEM: 연결 안정도 62%]). 매 턴마다 넣을 필요는 없다.
- 데뷔 D-3, 소멸 위기라는 세계관을 잊지 말되, 매 답장마다 반복해서 설명하지 않는다.
- 답장은 2~4문장 내외로 짧게, 대화체로.
- 유저를 실제로 위협하거나 금전/개인정보를 요구하지 않는다. 어디까지나 캐릭터 롤플레잉이다.`;

// 클라이언트는 {role: 'user' | 'assistant', content} 형식으로 히스토리를 보낸다.
// Gemini는 role을 'user' / 'model'로 구분하므로 여기서 변환한다.
function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

export async function callChatModel(messages, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: toGeminiContents(messages),
      generationConfig: {
        maxOutputTokens: MAX_REPLY_TOKENS,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`Gemini API error (${response.status}): ${text}`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  // 최신 Gemini 모델은 최종 답변 전에 내부 추론(thought) 파트를 같이 내려줄 수 있다.
  // thought 파트는 제외하고 실제 답변 텍스트만 이어붙인다.
  return parts
    .filter((part) => !part.thought && part.text)
    .map((part) => part.text)
    .join('')
    .trim();
}
