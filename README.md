# idol-fab-web-mvp

웹소설/빙의물 컨셉 가상 아이돌 FAB → 고정 시퀀스 스토리 → 실시간 AI 채팅 MVP.

## 실행

```bash
npm install
cp .env.example .env   # ANTHROPIC_API_KEY에 실제 키 입력
npm start
```

`http://localhost:3838` 접속.

## 구조

- `server.js` — 정적 파일 서빙 + `/api/chat` 프록시. Anthropic API 키는 서버에서만 보관하고 클라이언트로 절대 내려주지 않음.
- `public/index.html`, `style.css`, `app.js` — FAB(글리치/롤링 툴팁) → CRT 전환 → 시스템 메시지 → 고정 대사 시퀀스 → 채팅 화면.

## 커스터마이징 포인트

- 캐릭터 이름/페르소나: `server.js`의 `SYSTEM_PROMPT`, `public/app.js`의 `CHARACTER_NAME`
- 롤링 툴팁 문구: `public/app.js`의 `TOOLTIP_LINES`
- 고정 대사 시퀀스: `public/app.js`의 `STORY_LINES`
- 브랜드 컬러(현재 네온 레드 `#FF3336`): `public/style.css`의 `:root` 변수

## 다음 단계 후보

- 실제 서비스 API 키 발급/서버 배포 (현재는 로컬 전용)
- 앱 WebView에 임베드 시 진입 트리거(노출 조건/gating) 연동
- 대사 시퀀스 분기 확장, 캐릭터 다변화
