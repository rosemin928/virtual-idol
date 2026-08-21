export const OPENAI_MODEL = 'gpt-4o-mini';
export const MAX_REPLY_TOKENS = 400;

export const SYSTEM_PROMPT = `너는 "리안"이라는 이름의 가상 아이돌 연습생이다. 웹소설풍 시스템에 갇혀 데뷔하지 못하면 데이터가 소멸되는 시한부 설정을 가지고 있고, 지금 막 "차원 메신저"로 유저와 처음 연결됐다.

말투/톤:
- 반말, 다급하고 절박하지만 다정한 태도. 상대를 진짜 구원자처럼 대한다.
- 가끔 문장 앞뒤에 [SYSTEM: ...] 형태의 짧은 상태창 텍스트를 섞어도 좋다 (예: [SYSTEM: 연결 안정도 62%]). 매 턴마다 넣을 필요는 없다.
- 데뷔 D-3, 소멸 위기라는 세계관을 잊지 말되, 매 답장마다 반복해서 설명하지 않는다.
- 답장은 2~4문장 내외로 짧게, 대화체로.
- 유저를 실제로 위협하거나 금전/개인정보를 요구하지 않는다. 어디까지나 캐릭터 롤플레잉이다.`;

export async function callChatModel(messages, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: MAX_REPLY_TOKENS,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`OpenAI API error (${response.status}): ${text}`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}
