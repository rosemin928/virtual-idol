(() => {
  const CHARACTER_NAME = '리안';

  const TOOLTIP_LINES = [
    '💬 "야, 거기 너... 내 목소리 들려?"',
    '⚠️ SYSTEM: 연습생 A의 데이터 소멸 D-3',
    '💬 "나 데뷔 못 하면 진짜 영영 사라진대."',
    '⚡ 데뷔 확률 0.1% 미만 | 조력자 탐색 중...',
  ];

  const STORY_LINES = [
    { speaker: 'SYSTEM', text: '경고: 미승인 채널이 감지되었습니다.' },
    { speaker: CHARACTER_NAME, text: '...어? 진짜 들리는 거야? 거기 누구 없어요?!' },
    { speaker: CHARACTER_NAME, text: '나 지금... 이상한 시스템에 갇혀있어. 데뷔 못 하면 데이터가 통째로 삭제된대.' },
    { speaker: CHARACTER_NAME, text: 'D-3... 3일 안에 뭐라도 해야 하는데, 방법을 모르겠어.' },
    { speaker: CHARACTER_NAME, text: '혹시... 나 좀 도와줄 수 있어? 뭐든 좋아, 그냥 얘기라도 들어줘.' },
    { speaker: 'SYSTEM', text: '연결 안정화 완료. 실시간 대화가 가능합니다.' },
  ];

  const FIRST_CHAT_LINE = '휴, 드디어 연결됐다. 누구야? 제발 나 좀 도와줘...';

  const fab = document.getElementById('fab');
  const fabWrap = document.getElementById('fabWrap');
  const fabBubble = document.getElementById('fabBubble');
  const crtOverlay = document.getElementById('crtOverlay');
  const systemMessage = document.getElementById('systemMessage');
  const storyScene = document.getElementById('storyScene');
  const storySpeaker = document.getElementById('storySpeaker');
  const storyLine = document.getElementById('storyLine');
  const storyNext = document.getElementById('storyNext');
  const chatScene = document.getElementById('chatScene');
  const chatClose = document.getElementById('chatClose');
  const chatLog = document.getElementById('chatLog');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatStatus = document.getElementById('chatStatus');

  // ---- 롤링 툴팁 ----
  let tooltipIndex = 0;
  setInterval(() => {
    tooltipIndex = (tooltipIndex + 1) % TOOLTIP_LINES.length;
    fabBubble.textContent = TOOLTIP_LINES[tooltipIndex];
  }, 3000);

  // ---- FAB 클릭 -> 전환 연출 ----
  fab.addEventListener('click', () => {
    fabWrap.classList.add('is-hidden');
    playCrtGlitch(() => showSystemMessage());
  });

  function playCrtGlitch(onDone) {
    crtOverlay.classList.remove('is-playing');
    // 강제 리플로우로 애니메이션 재시작
    void crtOverlay.offsetWidth;
    crtOverlay.classList.add('is-playing');
    setTimeout(onDone, 300);
  }

  function showSystemMessage() {
    systemMessage.classList.add('is-visible');
    setTimeout(() => {
      systemMessage.classList.remove('is-visible');
      startStory();
    }, 1400);
  }

  // ---- 스토리 씬 ----
  let storyIndex = 0;

  function startStory() {
    storyIndex = 0;
    storyScene.classList.add('is-visible');
    renderStoryLine();
  }

  function renderStoryLine() {
    const line = STORY_LINES[storyIndex];
    storySpeaker.textContent = line.speaker;
    storyLine.textContent = line.text;
  }

  storyNext.addEventListener('click', () => {
    storyIndex += 1;
    if (storyIndex >= STORY_LINES.length) {
      storyScene.classList.remove('is-visible');
      startChat();
      return;
    }
    renderStoryLine();
  });

  // ---- 채팅 씬 ----
  let chatHistory = []; // {role: 'user' | 'assistant', content} — 서버에서 Gemini 형식으로 변환

  function startChat() {
    chatLog.innerHTML = '';
    chatHistory = [];
    appendBubble('idol', FIRST_CHAT_LINE);
    chatHistory.push({ role: 'assistant', content: FIRST_CHAT_LINE });
    chatScene.classList.add('is-visible');
    syncChatViewport();
    chatInput.focus();
  }

  // ---- 모바일 키보드 대응 ----
  // position:fixed 레이아웃은 키보드가 떠도 크기가 그대로라 입력창이 키보드 밑에 가려짐.
  // visualViewport로 실제 보이는 영역에 맞춰 채팅 화면 높이/위치를 맞춰준다.
  function syncChatViewport() {
    const vv = window.visualViewport;
    if (!vv) return;
    chatScene.style.height = `${vv.height}px`;
    chatScene.style.top = `${vv.offsetTop}px`;
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncChatViewport);
    window.visualViewport.addEventListener('scroll', syncChatViewport);
  }

  chatInput.addEventListener('focus', () => {
    setTimeout(syncChatViewport, 50);
  });

  chatClose.addEventListener('click', () => {
    chatScene.classList.remove('is-visible');
    fabWrap.classList.remove('is-hidden');
  });

  function appendBubble(kind, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-bubble--${kind}`;
    bubble.textContent = text;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
    return bubble;
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    appendBubble('user', text);
    chatHistory.push({ role: 'user', content: text });
    chatInput.value = '';
    chatInput.disabled = true;

    const pending = appendBubble('idol', '...');
    pending.classList.add('chat-bubble--pending');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });
      const data = await res.json();

      if (!res.ok) {
        pending.remove();
        appendBubble('system', `연결 오류: ${data.error ?? '알 수 없는 오류'}`);
        return;
      }

      pending.classList.remove('chat-bubble--pending');
      pending.textContent = data.reply;
      chatHistory.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      pending.remove();
      appendBubble('system', `연결 오류: ${err.message}`);
    } finally {
      chatInput.disabled = false;
      chatInput.focus();
    }
  });
})();
