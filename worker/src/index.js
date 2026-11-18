// Cloudflare Worker: 브라우저 ↔ GitHub 저장소의 data/*.json 사이를 중계한다.
// GitHub 토큰은 Worker 시크릿(GITHUB_TOKEN)에만 두고, 브라우저에는 절대 내려보내지 않는다.

const FILES = {
  records: 'data/participations.json',
  comments: 'data/comments.json',
  votes: 'data/votes.json',
};
const MOODS = ['happy', 'excited', 'good', 'calm', 'hungry', 'tired', 'stressed', 'sad', 'angry', 'worried'];
const REACTIONS = ['👍', '😂', '🍺', '🔥'];

export default {
  async fetch(req, env) {
    const cors = corsHeaders(req, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const url = new URL(req.url);
    try {
      if (req.method === 'GET' && url.pathname === '/api/state') {
        return json(await readState(env), 200, cors);
      }
      if (req.method === 'POST' && url.pathname === '/api/op') {
        let body;
        try { body = await req.json(); } catch { throw httpErr(400, '잘못된 요청입니다.'); }
        return json(await applyOp(env, body), 200, cors);
      }
      return json({ error: 'not found' }, 404, cors);
    } catch (e) {
      const status = e.status || 500;
      if (!e.status) console.error(e);
      return json({ error: e.status ? e.message : '서버 오류가 발생했습니다.' }, status, cors);
    }
  },
};

/* ---------- 연산 ---------- */
async function applyOp(env, body) {
  if (!body || typeof body !== 'object') throw httpErr(400, '잘못된 요청입니다.');

  switch (body.op) {
    case 'addRecord': {
      checkWindow(env);
      const r = sanitizeRecord(body.record);
      await updateFile(env, FILES.records, [], (recs) => {
        if (recs.some((x) => x.id === r.id)) return recs;
        if (recs.some((x) => x.date === r.date && x.department === r.department && x.name === r.name)) {
          throw httpErr(409, '이미 해당 날짜에 등록된 참여자입니다.');
        }
        return recs.concat(r);
      }, 'data: add participation');
      break;
    }
    case 'removeRecord': {
      checkWindow(env);
      const id = str(body.id, 64);
      await updateFile(env, FILES.records, [], (recs) => recs.filter((x) => x.id !== id), 'data: remove participation');
      await updateFile(env, FILES.votes, {}, (v) => {
        for (const d of Object.keys(v)) {
          if (v[d] && v[d][id]) delete v[d][id];
          if (!v[d] || !Object.keys(v[d]).length) delete v[d];
        }
        return v;
      }, 'data: drop votes of removed participant');
      break;
    }
    case 'addComment': {
      const c = body.comment || {};
      const text = clean(c.text, 300);
      if (!text) throw httpErr(400, '코멘트 내용을 입력해 주세요.');
      const comment = {
        id: str(c.id, 64),
        author: clean(c.author, 20),
        text,
        createdAt: new Date().toISOString(),
      };
      await updateFile(env, FILES.comments, [], (list) =>
        list.some((x) => x.id === comment.id) ? list : list.concat(comment), 'data: add comment');
      break;
    }
    case 'deleteComment': {
      const id = str(body.id, 64);
      await updateFile(env, FILES.comments, [], (list) => list.filter((x) => x.id !== id), 'data: delete comment');
      break;
    }
    case 'react': {
      const id = str(body.id, 64);
      if (!REACTIONS.includes(body.emoji)) throw httpErr(400, '지원하지 않는 반응입니다.');
      const delta = body.delta === -1 ? -1 : 1;
      await updateFile(env, FILES.comments, [], (list) => {
        const c = list.find((x) => x.id === id);
        if (!c) return list;
        c.reactions = c.reactions || {};
        c.reactions[body.emoji] = Math.max(0, (c.reactions[body.emoji] || 0) + delta);
        return list;
      }, 'data: reaction');
      break;
    }
    case 'vote': {
      const date = dateStr(body.date);
      const voterId = str(body.voterId, 64);
      const menu = body.menu === null ? null : clean(body.menu, 40);
      await updateFile(env, FILES.votes, {}, (v) => {
        v[date] = v[date] || {};
        if (menu === null) delete v[date][voterId]; else v[date][voterId] = menu;
        if (!Object.keys(v[date]).length) delete v[date];
        return v;
      }, 'data: vote');
      break;
    }
    default:
      throw httpErr(400, '알 수 없는 요청입니다.');
  }
  return readState(env);
}

/* ---------- 검증 ---------- */
function clean(v, max) {
  if (typeof v !== 'string') return '';
  // 제어문자 제거, 연속 공백 정리(줄바꿈은 유지), 길이 제한
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}
function str(v, max) {
  const s = clean(v, max);
  if (!s) throw httpErr(400, '잘못된 요청입니다.');
  return s;
}
function dateStr(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw httpErr(400, '날짜 형식이 올바르지 않습니다.');
  return v;
}
function sanitizeRecord(r) {
  r = r || {};
  const department = clean(r.department, 30).replace(/\s+/g, ' ');
  const name = clean(r.name, 20).replace(/\s+/g, ' ');
  if (!department) throw httpErr(400, '부서명을 입력해 주세요.');
  if (!name) throw httpErr(400, '이름을 입력해 주세요.');
  return {
    id: str(r.id, 64),
    date: dateStr(r.date),
    department,
    name,
    mood: MOODS.includes(r.mood) ? r.mood : '',
    createdAt: new Date().toISOString(),
  };
}
// 등록/취소 가능 시간(한국 시간) 서버에서도 강제
function checkWindow(env) {
  const start = Number(env.START_HOUR ?? 12), end = Number(env.END_HOUR ?? 17);
  const kstHour = (new Date().getUTCHours() + 9) % 24;
  if (kstHour < start || kstHour >= end) {
    throw httpErr(403, '참여 등록은 당일 낮 12시부터 오후 5시까지만 가능합니다.');
  }
}

/* ---------- GitHub Contents API ---------- */
async function readState(env) {
  const [records, comments, votes] = await Promise.all([
    readFile(env, FILES.records, []),
    readFile(env, FILES.comments, []),
    readFile(env, FILES.votes, {}),
  ]);
  return { records: records.data, comments: comments.data, votes: votes.data };
}

function gh(env, path, init = {}) {
  const branch = env.GH_BRANCH || 'main';
  const qs = init.method === 'PUT' ? '' : `?ref=${encodeURIComponent(branch)}`;
  return fetch(`https://api.github.com/repos/${env.GH_REPO}/contents/${path}${qs}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'team-dinner-worker',
      'Content-Type': 'application/json',
    },
  });
}

async function readFile(env, path, fallback) {
  const res = await gh(env, path);
  if (res.status === 404) return { data: fallback, sha: null };
  if (!res.ok) throw httpErr(502, 'GitHub에서 데이터를 읽지 못했습니다.');
  const j = await res.json();
  try { return { data: JSON.parse(fromB64(j.content)), sha: j.sha }; }
  catch { return { data: fallback, sha: j.sha }; }
}

// 읽기 → 수정 → 커밋. 동시에 누가 먼저 저장해 sha가 어긋나면(409/422) 다시 읽어서 재시도한다.
async function updateFile(env, path, fallback, mutate, message) {
  for (let i = 0; i < 5; i++) {
    const { data, sha } = await readFile(env, path, fallback);
    const before = JSON.stringify(data);
    const next = mutate(data);
    if (JSON.stringify(next) === before) return next;

    const res = await gh(env, path, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: toB64(JSON.stringify(next, null, 2) + '\n'),
        sha: sha || undefined,
        branch: env.GH_BRANCH || 'main',
      }),
    });
    if (res.ok) return next;
    if (res.status === 409 || res.status === 422) {
      await new Promise((r) => setTimeout(r, 150 * (i + 1) + Math.random() * 200));
      continue;
    }
    throw httpErr(502, 'GitHub에 저장하지 못했습니다.');
  }
  throw httpErr(503, '동시에 저장하는 사람이 많아 실패했습니다. 잠시 후 다시 시도해 주세요.');
}

/* ---------- 유틸 ---------- */
function httpErr(status, message) { const e = new Error(message); e.status = status; return e; }
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}
function corsHeaders(req, env) {
  const allowed = (env.ALLOWED_ORIGIN || '*').split(',').map((s) => s.trim());
  const origin = req.headers.get('Origin');
  const h = { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
  if (allowed.includes('*')) h['Access-Control-Allow-Origin'] = '*';
  else if (origin && allowed.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}
function toB64(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function fromB64(b64) {
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
