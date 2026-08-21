# idol-fab-web-mvp

웹소설/빙의물 컨셉 가상 아이돌 FAB → 고정 시퀀스 스토리 → 실시간 AI 채팅 MVP.

## 실행

```bash
npm install
cp .env.example .env   # OPENAI_API_KEY에 실제 키 입력 (console.anthropic.com 아님, platform.openai.com 키)
npm start
```

`http://localhost:3838` 접속.

## 구조

- `server.js` — 로컬 개발용. 정적 파일 서빙 + `/api/chat` 프록시.
- `api/chat.js` — Vercel 배포용 서버리스 함수. 실제 배포는 이 파일이 처리함 (`server.js`는 Vercel에서 안 씀).
- `lib/chat.js` — OpenAI Chat Completions API 호출 로직 + 캐릭터 페르소나(`SYSTEM_PROMPT`) 공통 모듈. `server.js`와 `api/chat.js`가 같이 사용.
- `public/index.html`, `style.css`, `app.js` — FAB(글리치/롤링 툴팁) → CRT 전환 → 시스템 메시지 → 고정 대사 시퀀스 → 채팅 화면.
- API 키는 서버(로컬 `.env` / Vercel 환경변수)에서만 보관하고 클라이언트로 절대 내려주지 않음.

## Vercel 배포 시 유의사항

- Environment Variables에 `OPENAI_API_KEY` 등록 필수 (등록 후 재배포해야 반영됨)
- 프로젝트 Framework Preset은 반드시 **Other**여야 함 — Express.js로 잡히면 `api/chat.js`가 아니라 `server.js`를 잘못된 방식으로 빌드하려다 실패함

## 커스터마이징 포인트

- 캐릭터 이름/페르소나/모델: `lib/chat.js`의 `SYSTEM_PROMPT`, `OPENAI_MODEL`, `public/app.js`의 `CHARACTER_NAME`
- 캐릭터 이미지: `public/assets/rian.png` 교체
- 롤링 툴팁 문구: `public/app.js`의 `TOOLTIP_LINES`
- 고정 대사 시퀀스: `public/app.js`의 `STORY_LINES`
- 브랜드 컬러(현재 코랄 핑크 `#FF6B81` + 퍼플 `#B98CFF`): `public/style.css`의 `:root` 변수

## 다음 단계 후보

- 앱 WebView에 임베드 시 진입 트리거(노출 조건/gating) 연동
- 대사 시퀀스 분기 확장, 캐릭터 다변화
