# 다 같이 함께 저녁을

회식 가능 날짜를 체크하는 정적 웹앱. 데이터는 이 저장소의 `data/*.json`에 저장된다.

```
브라우저(GitHub Pages) ──▶ Cloudflare Worker(토큰 보관) ──▶ 이 저장소의 data/*.json 커밋
```

- `index.html`, `styles.css`, `app.js`, `config.js` : 화면 (GitHub Pages로 배포)
- `worker/` : GitHub 토큰을 대신 들고 JSON을 커밋하는 서버 함수 (Cloudflare Workers)
- `data/` : 참여 기록 · 코멘트 · 투표 (서버 함수가 자동 커밋)

> ⚠️ 저장소가 **public**이면 `data/`의 부서·이름·코멘트가 인터넷에 그대로 공개된다. 실제 직원 정보는 private 저장소에서만 사용할 것.

`config.js`의 `API_URL`이 비어 있으면 서버 없이 브라우저 `localStorage`만 쓰는 모드로 동작한다.

## 설정 순서

### 1. 저장소 만들고 올리기
GitHub에서 빈 저장소를 만든 뒤(이름 예: `team-dinner`):

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/lionfrnd-pyd/edu21.git
git push -u origin main
```

### 2. GitHub Pages 켜기
저장소 **Settings → Pages → Source: Deploy from a branch → main / (root)**.
주소는 `https://lionfrnd-pyd.github.io/edu21/`.

### 3. 저장용 토큰 만들기
**Settings(개인) → Developer settings → Fine-grained tokens → Generate**
- Repository access: **이 저장소만**
- Permissions: **Contents → Read and write** (그 외 없음)

### 4. 서버 함수 배포
`worker/wrangler.toml`의 `GH_REPO`, `ALLOWED_ORIGIN`을 본인 값으로 고친 뒤:

```bash
cd worker
npx wrangler login
npx wrangler secret put GITHUB_TOKEN   # 3번에서 만든 토큰 붙여넣기
npx wrangler deploy                    # 출력되는 https://...workers.dev 주소 복사
```

### 5. 화면과 서버 연결
`config.js`의 `API_URL`에 4번의 workers.dev 주소를 넣고 커밋·푸시.

## 동작 메모
- 등록/취소 가능 시간(한국 시간 12:00~17:00)은 서버에서도 검사한다. 시간은 `wrangler.toml`의 `START_HOUR`/`END_HOUR`로 바꾼다.
- 여러 명이 동시에 저장해 충돌하면 서버가 다시 읽어 최대 5번 재시도한다.
- 화면은 30초마다 서버 데이터를 다시 받아 다른 사람의 변경을 반영한다.
- 로그인이 없어서 누구나 다른 사람 이름으로 등록하거나 코멘트를 삭제할 수 있다.
