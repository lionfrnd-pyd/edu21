(function () {
  'use strict';

  var STORAGE_KEY = 'teamDinnerParticipations';
  var START_HOUR = 12;   // 12:00:00 이상
  var END_HOUR = 17;     // 17:00:00 미만
  var TIME_MSG = '참여 등록은 당일 낮 12시부터 오후 5시까지만 가능합니다.';

  var MOODS = [
    { k: 'happy', e: '😄', t: '행복' },
    { k: 'excited', e: '🤩', t: '설렘' },
    { k: 'good', e: '😊', t: '좋음' },
    { k: 'calm', e: '😌', t: '평온' },
    { k: 'hungry', e: '🤤', t: '배고픔' },
    { k: 'tired', e: '😴', t: '피곤' },
    { k: 'stressed', e: '😫', t: '스트레스' },
    { k: 'sad', e: '😢', t: '우울' },
    { k: 'angry', e: '😠', t: '화남' },
    { k: 'worried', e: '😰', t: '걱정' }
  ];
  var MENUS = {
    happy: ['삼겹살·고기구이', '치킨 + 맥주', '기분 좋은 날엔 다 같이 푸짐하게!'],
    excited: ['곱창·막창', '무한리필 뷔페', '들뜬 분위기를 이어갈 화끈한 메뉴'],
    good: ['한식 정식', '족발·보쌈', '누구나 무난하게 즐길 수 있는 메뉴'],
    calm: ['샤브샤브', '전골·칼국수', '편안하게 대화하기 좋은 메뉴'],
    hungry: ['고기 무한리필', '대왕 돈까스·덮밥 세트', '배불리 먹을 수 있는 든든한 메뉴'],
    tired: ['삼계탕·장어구이', '갈비탕', '지친 몸을 달래 줄 보양식'],
    stressed: ['마라탕·마라샹궈', '닭발·매운 갈비찜', '매운맛으로 스트레스 날리기'],
    sad: ['부대찌개·김치찌개', '따뜻한 국물 요리 + 디저트', '따뜻한 국물과 달콤한 위로'],
    angry: ['불닭·매운 닭볶음탕', '매운 낙지볶음', '화는 매운 음식으로 풀기!'],
    worried: ['따뜻한 전골', '수제비·칼국수', '속 편하고 따뜻한 메뉴로 마음 놓기']
  };

  function renderMenuReco(list) {
    var box = $('menuReco');
    var counts = {}, total = 0;
    list.forEach(function (r) {
      if (moodOf(r.mood)) { counts[r.mood] = (counts[r.mood] || 0) + 1; total++; }
    });
    if (!total) { box.hidden = true; box.innerHTML = ''; return; }

    var ranked = MOODS.filter(function (m) { return counts[m.k]; })
      .sort(function (a, b) { return counts[b.k] - counts[a.k]; });
    var top = ranked.filter(function (m) { return counts[m.k] === counts[ranked[0].k]; }).slice(0, 2);

    box.innerHTML = '';
    var h = document.createElement('h3');
    h.textContent = '🍽️ 기분 맞춤 메뉴 추천';
    var tally = document.createElement('p');
    tally.className = 'tally';
    tally.textContent = ranked.map(function (m) { return m.e + ' ' + m.t + ' ' + counts[m.k]; }).join('  ');
    var head = document.createElement('p');
    head.className = 'headline';
    head.textContent = '오늘은 ' + top.map(function (m) { return m.e + ' ' + m.t; }).join(' · ') + ' 팀이 우세!';
    box.appendChild(h);
    box.appendChild(head);
    box.appendChild(tally);
    top.forEach(function (m) {
      var menu = MENUS[m.k];
      var p = document.createElement('p');
      p.className = 'pick';
      var b = document.createElement('b');
      b.textContent = menu[0] + ' / ' + menu[1];
      p.appendChild(document.createTextNode(m.e + ' ' + m.t + ' 인원이 가장 많아요 → '));
      p.appendChild(b);
      p.appendChild(document.createTextNode(' (' + menu[2] + ')'));
      box.appendChild(p);
    });
    box.hidden = false;
  }

  function moodOf(k) { return MOODS.filter(function (m) { return m.k === k; })[0]; }

  // 공휴일(대체공휴일 포함). 음력 공휴일이 있어 2026~2027년을 직접 입력함 — 이후 연도는 추가 필요.
  var HOLIDAYS = {
    '2026-01-01': '신정',
    '2026-02-16': '설날 연휴', '2026-02-17': '설날', '2026-02-18': '설날 연휴',
    '2026-03-01': '삼일절', '2026-03-02': '대체공휴일',
    '2026-05-05': '어린이날',
    '2026-05-24': '부처님오신날', '2026-05-25': '대체공휴일',
    '2026-06-03': '지방선거', '2026-06-06': '현충일',
    '2026-08-15': '광복절', '2026-08-17': '대체공휴일',
    '2026-09-24': '추석 연휴', '2026-09-25': '추석', '2026-09-26': '추석 연휴', '2026-09-28': '대체공휴일',
    '2026-10-03': '개천절', '2026-10-05': '대체공휴일',
    '2026-10-09': '한글날',
    '2026-12-25': '성탄절',
    '2027-01-01': '신정',
    '2027-02-05': '설날 연휴', '2027-02-06': '설날', '2027-02-07': '설날 연휴', '2027-02-08': '대체공휴일',
    '2027-03-01': '삼일절',
    '2027-05-05': '어린이날',
    '2027-05-13': '부처님오신날',
    '2027-06-06': '현충일',
    '2027-08-15': '광복절', '2027-08-16': '대체공휴일',
    '2027-09-14': '추석 연휴', '2027-09-15': '추석', '2027-09-16': '추석 연휴',
    '2027-10-03': '개천절', '2027-10-04': '대체공휴일',
    '2027-10-09': '한글날', '2027-10-11': '대체공휴일',
    '2027-12-25': '성탄절', '2027-12-27': '대체공휴일'
  };

  var $ = function (id) { return document.getElementById(id); };
  var records = [];
  var storageOk = true;
  var viewYear, viewMonth;
  var selectedDate = null;
  var lastFocus = null;

  /* ---------- 서버 연동 (GitHub JSON 저장) ---------- */
  // config.js의 API_URL이 있으면 서버 함수 경유로 GitHub 저장소의 data/*.json에 저장하고,
  // 비어 있으면 기존처럼 localStorage만 사용한다.
  var API = ((window.APP_CONFIG && window.APP_CONFIG.API_URL) || '').replace(/\/+$/, '');
  var REMOTE = !!API;
  var pending = 0;                       // 서버로 보내는 중인 변경 수
  var queue = Promise.resolve();         // 변경 요청은 순서대로 직렬 처리

  function request(path, opts) {
    return fetch(API + path, opts).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (j) {
        if (!res.ok) throw new Error(j.error || '서버 요청에 실패했습니다.');
        return j;
      });
    });
  }

  function applyState(s) {
    records = Array.isArray(s.records) ? s.records : [];
    comments = Array.isArray(s.comments) ? s.comments : [];
    votes = s.votes && typeof s.votes === 'object' && !Array.isArray(s.votes) ? s.votes : {};
    render();
    renderComments();
    if (!$('listModal').hidden && selectedDate) fillList(selectedDate);
  }

  // 서버 없이 쓰는 모드에서 처음 방문한 브라우저에는 저장소의 data/*.json을 초기 데이터로 불러온다.
  function loadSampleFiles() {
    var names = ['participations', 'comments', 'votes'];
    Promise.all(names.map(function (n) {
      return fetch('data/' + n + '.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; });
    })).then(function (res) {
      if (!Array.isArray(res[0]) || !res[0].length) return;
      if (records.length || comments.length) return;      // 그 사이 직접 입력했다면 덮어쓰지 않음
      applyState({ records: res[0], comments: res[1] || [], votes: res[2] || {} });
      save(); saveComments(); saveVotes();
    }).catch(function () {});
  }

  function pull() {
    if (!REMOTE || pending > 0) return Promise.resolve();
    return request('/api/state', { cache: 'no-store' }).then(function (s) {
      if (pending === 0) applyState(s);
      $('storageNotice').hidden = true;
    }).catch(function (e) {
      showStorageNotice('서버에 연결하지 못했습니다: ' + e.message);
    });
  }

  // 화면은 먼저 낙관적으로 바꾸고, 서버 저장에 실패하면 서버의 실제 상태로 되돌린다.
  function sync(op, payload) {
    if (!REMOTE) return;
    pending++;
    var body = JSON.stringify(Object.assign({ op: op }, payload));
    queue = queue.then(function () {
      return request('/api/op', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body })
        .then(function (s) { pending--; if (pending === 0) applyState(s); })
        .catch(function (e) {
          pending--;
          toast('저장 실패: ' + e.message);
          return pull();
        });
    });
  }

  /* ---------- 저장소 ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error('invalid');
      return data.filter(function (r) {
        return r && r.id && r.date && r.department && r.name;
      });
    } catch (e) {
      if (e && e.message === 'invalid' || e instanceof SyntaxError) {
        try { localStorage.setItem(STORAGE_KEY, '[]'); } catch (_) {}
        showStorageNotice('저장된 데이터가 손상되어 초기화했습니다.');
      } else {
        storageOk = false;
        showStorageNotice('로컬 저장소를 사용할 수 없습니다. 브라우저 설정 또는 개인정보 보호 모드를 확인해 주세요. 새로고침하면 데이터가 사라집니다.');
      }
      return [];
    }
  }

  function save() {
    if (REMOTE) return true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    } catch (e) {
      storageOk = false;
      showStorageNotice('로컬 저장소에 저장하지 못했습니다. 브라우저 설정 또는 개인정보 보호 모드를 확인해 주세요.');
      return false;
    }
  }

  function showStorageNotice(msg) {
    var el = $('storageNotice');
    el.textContent = msg;
    el.hidden = false;
  }

  /* ---------- 유틸 ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dateKey(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }
  function todayKey() { var t = new Date(); return dateKey(t.getFullYear(), t.getMonth(), t.getDate()); }
  function isOpenNow() { var h = new Date().getHours(); return h >= START_HOUR && h < END_HOUR; }
  function genId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }
  function labelDate(key) {
    var p = key.split('-').map(Number);
    var wd = ['일', '월', '화', '수', '목', '금', '토'][new Date(p[0], p[1] - 1, p[2]).getDay()];
    return p[0] + '년 ' + p[1] + '월 ' + p[2] + '일 (' + wd + ')';
  }
  function norm(s) { return s.trim().replace(/\s+/g, ' '); }
  function forDate(key) {
    return records.filter(function (r) { return r.date === key; }).sort(function (a, b) {
      return a.department.localeCompare(b.department, 'ko') || a.name.localeCompare(b.name, 'ko');
    });
  }

  var toastTimer;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  /* ---------- 시간 안내 ---------- */
  function updateTimeNotice() {
    var el = $('timeNotice');
    var open = isOpenNow();
    el.className = 'notice' + (open ? ' open' : '');
    el.textContent = open ? '지금은 참여 등록이 가능한 시간입니다. (낮 12시 ~ 오후 5시)' : TIME_MSG;
  }

  /* ---------- 캘린더 ---------- */
  function render() {
    $('monthLabel').textContent = viewYear + '년 ' + (viewMonth + 1) + '월';
    var grid = $('grid');
    grid.innerHTML = '';
    var first = new Date(viewYear, viewMonth, 1).getDay();
    var days = new Date(viewYear, viewMonth + 1, 0).getDate();
    var today = todayKey();

    var counts = {};
    records.forEach(function (r) { counts[r.date] = (counts[r.date] || 0) + 1; });

    // 이번 달 1위 날짜 계산 (2명 이상일 때만 👑)
    var maxN = 0, leaders = [];
    for (var q = 1; q <= days; q++) {
      var qc = counts[dateKey(viewYear, viewMonth, q)] || 0;
      if (qc > maxN) { maxN = qc; leaders = [q]; }
      else if (qc === maxN && qc > 0) leaders.push(q);
    }
    var crownOn = maxN >= 2;

    for (var i = 0; i < first; i++) {
      var blank = document.createElement('div');
      blank.className = 'day empty';
      grid.appendChild(blank);
    }
    for (var d = 1; d <= days; d++) {
      var key = dateKey(viewYear, viewMonth, d);
      var cell = document.createElement('button');
      cell.type = 'button';
      var hol = HOLIDAYS[key];
      cell.className = 'day' + (key === today ? ' today' : '') + (hol ? ' holiday' : '');
      cell.dataset.date = key;
      var n = counts[key] || 0;
      var isLeader = crownOn && n === maxN;
      if (isLeader) cell.className += ' leader';
      var marks = (isLeader ? '👑' : '') + (n >= 10 ? '🔥' : n >= 5 ? '🎉' : '');
      cell.setAttribute('aria-label', labelDate(key) + (hol ? ', ' + hol : '') + (n ? ', 참여자 ' + n + '명' : '') + (isLeader ? ', 이번 달 1위' : ''));
      cell.innerHTML = '<span class="num">' + d + '</span>' + (hol ? '<span class="hname">' + hol + '</span>' : '') + (marks ? '<span class="marks" aria-hidden="true">' + marks + '</span>' : '') + (n ?'<span class="badge lv' + (n >= 10 ? 4 : n >= 6 ? 3 : n >= 3 ? 2 : 1) + '">' + n + '</span>' : '');
      grid.appendChild(cell);
    }
    var rest = (7 - (first + days) % 7) % 7;
    for (var j = 0; j < rest; j++) {
      var b = document.createElement('div');
      b.className = 'day empty';
      grid.appendChild(b);
    }
    renderBanner(leaders, maxN);
    renderBattle();
  }

  function moveMonth(delta) {
    var d = new Date(viewYear, viewMonth + delta, 1);
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
    render();
  }

  /* ---------- 모달 ---------- */
  function openModal(el, focusEl) {
    lastFocus = document.activeElement;
    el.hidden = false;
    if (focusEl) focusEl.focus();
  }
  function closeModals() {
    $('registerModal').hidden = true;
    $('listModal').hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openRegister(key) {
    if (!isOpenNow()) { toast(TIME_MSG); return; }
    selectedDate = key;
    $('registerDate').textContent = labelDate(key) + ' 회식 참여';
    $('formError').textContent = '';
    $('registerForm').reset();
    $('listModal').hidden = true;
    openModal($('registerModal'), $('deptInput'));
  }

  function openList(key) {
    fillList(key);
    $('rouletteResult').textContent = '';
    $('registerModal').hidden = true;
    openModal($('listModal'), $('addBtn'));
  }

  // 목록 내용만 다시 그린다 (서버에서 새 데이터가 와도 포커스·모달 상태는 유지)
  function fillList(key) {
    selectedDate = key;
    var list = forDate(key);
    $('listSummary').textContent = labelDate(key) + ' · 참여자 ' + list.length + '명';
    var ul = $('participantList');
    ul.innerHTML = '';
    if (!list.length) {
      var li = document.createElement('li');
      li.className = 'empty-msg';
      li.textContent = '아직 참여자가 없습니다.';
      ul.appendChild(li);
    }
    list.forEach(function (r) {
      var li = document.createElement('li');
      var info = document.createElement('div');
      var who = document.createElement('div');
      who.className = 'who';
      var mood = moodOf(r.mood);
      who.textContent = (mood ? mood.e + ' ' : '') + r.department + ' · ' + r.name;   // textContent로 XSS 방지
      if (mood) who.title = '기분: ' + mood.t;
      var meta = document.createElement('div');
      meta.className = 'meta';
      var t = new Date(r.createdAt);
      meta.textContent = '등록 ' + (isNaN(t) ? '-' : (t.getMonth() + 1) + '/' + t.getDate() + ' ' + pad(t.getHours()) + ':' + pad(t.getMinutes()));
      info.appendChild(who);
      info.appendChild(meta);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cancel-btn';
      btn.textContent = '참여 취소';
      btn.dataset.id = r.id;
      var avatar = document.createElement('span');
      avatar.className = 'avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = avatarOf(r.department + '|' + r.name);
      var person = document.createElement('div');
      person.className = 'person';
      person.appendChild(avatar);
      person.appendChild(info);
      li.appendChild(person);
      li.appendChild(btn);
      ul.appendChild(li);
    });
    renderMenuReco(list);
    renderVote(list);
  }

  /* ---------- 등록 / 취소 ---------- */
  function submitRegister(e) {
    e.preventDefault();
    var err = $('formError');
    var dept = norm($('deptInput').value);
    var name = norm($('nameInput').value);

    if (!isOpenNow()) { err.textContent = TIME_MSG; updateTimeNotice(); return; }
    if (!dept) { err.textContent = '부서명을 입력해 주세요.'; $('deptInput').focus(); return; }
    if (!name) { err.textContent = '이름을 입력해 주세요.'; $('nameInput').focus(); return; }

    var dup = records.some(function (r) {
      return r.date === selectedDate && r.department === dept && r.name === name;
    });
    if (dup) { err.textContent = '이미 해당 날짜에 등록된 참여자입니다.'; return; }

    var picked = document.querySelector('input[name="mood"]:checked');
    var before = forDate(selectedDate).length;
    var rec = { id: genId(), date: selectedDate, department: dept, name: name, mood: picked ? picked.value : '', createdAt: new Date().toISOString() };
    records.push(rec);
    if (!save()) records.pop();
    else {
      sync('addRecord', { record: rec });
      var after = before + 1;
      if (before < 10 && after >= 10) { toast('🔥 10명 돌파! 대박 날짜 탄생!'); confetti(120); }
      else if (before < 5 && after >= 5) { toast('🎉 5명 돌파! 분위기 달아오른다!'); confetti(70); }
      else toast('참여 등록이 완료되었습니다.');
    }
    render();
    var key = selectedDate;
    $('registerModal').hidden = true;
    lastFocus = null;
    openList(key);
  }

  function cancelRecord(id) {
    if (!isOpenNow()) { toast(TIME_MSG.replace('등록', '등록 및 취소')); return; }
    if (!window.confirm('이 참여 기록을 취소하시겠습니까?')) return;
    var before = records;
    records = records.filter(function (r) { return r.id !== id; });
    if (!save()) { records = before; return; }
    removeVotesFor(id);
    sync('removeRecord', { id: id });
    render();
    openList(selectedDate);
    toast('참여가 취소되었습니다.');
  }

  /* ---------- 자유 코멘트 ---------- */
  var COMMENT_KEY = 'teamDinnerComments';
  var comments = [];

  function loadComments() {
    try {
      var data = JSON.parse(localStorage.getItem(COMMENT_KEY) || '[]');
      if (!Array.isArray(data)) return [];
      return data.filter(function (c) { return c && c.id && c.text; });
    } catch (e) { return []; }
  }
  function saveComments() {
    if (REMOTE) return true;
    try { localStorage.setItem(COMMENT_KEY, JSON.stringify(comments)); return true; }
    catch (e) { showStorageNotice('로컬 저장소에 저장하지 못했습니다. 브라우저 설정 또는 개인정보 보호 모드를 확인해 주세요.'); return false; }
  }

  function renderComments() {
    $('commentCount').textContent = comments.length ? '(' + comments.length + ')' : '';
    var ul = $('commentList');
    ul.innerHTML = '';
    if (!comments.length) {
      var li = document.createElement('li');
      li.className = 'empty-msg';
      li.textContent = '아직 코멘트가 없습니다.';
      ul.appendChild(li);
      return;
    }
    comments.slice().reverse().forEach(function (c) {
      var li = document.createElement('li');
      var head = document.createElement('div');
      head.className = 'comment-head';
      var left = document.createElement('div');
      var a = document.createElement('span');
      a.className = 'author';
      a.textContent = c.author || '익명';
      var t = new Date(c.createdAt);
      var tm = document.createElement('span');
      tm.className = 'time';
      tm.textContent = isNaN(t) ? '' : (t.getMonth() + 1) + '/' + t.getDate() + ' ' + pad(t.getHours()) + ':' + pad(t.getMinutes());
      left.appendChild(avatarSpan(c.author));
      left.appendChild(a);
      left.appendChild(tm);
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'cancel-btn';
      del.textContent = '삭제';
      del.dataset.id = c.id;
      head.appendChild(left);
      head.appendChild(del);
      var body = document.createElement('p');
      body.className = 'comment-body';
      body.textContent = c.text;
      li.appendChild(head);
      li.appendChild(body);
      var rx = document.createElement('div');
      rx.className = 'reactions';
      REACTIONS.forEach(function (emoji) {
        var cnt = (c.reactions && c.reactions[emoji]) || 0;
        var rb = document.createElement('button');
        rb.type = 'button';
        rb.className = 'react-btn' + ((myReact[c.id] || []).indexOf(emoji) >= 0 ? ' on' : '');
        rb.dataset.id = c.id;
        rb.dataset.emoji = emoji;
        rb.textContent = emoji + (cnt ? ' ' + cnt : '');
        rx.appendChild(rb);
      });
      li.appendChild(rx);
      ul.appendChild(li);
    });
  }

  function submitComment(e) {
    e.preventDefault();
    var text = $('commentText').value.trim();
    var err = $('commentError');
    if (!text) { err.textContent = '코멘트 내용을 입력해 주세요.'; return; }
    err.textContent = '';
    var newComment = {
      id: genId(),
      author: norm($('commentAuthor').value),
      text: text,
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    if (!saveComments()) { comments.pop(); return; }
    sync('addComment', { comment: newComment });
    $('commentText').value = '';
    renderComments();
    toast('코멘트가 등록되었습니다.');
  }

  /* ---------- 재미 요소: 아바타 / 컨페티 / 순위 / 대항전 ---------- */
  var AVATARS = ['🐶', '🐱', '🐻', '🦊', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐰', '🐧', '🦄', '🐙', '🍕', '🍔', '🍣', '🍩', '🍉', '🥑', '🍜', '🌮', '🍓', '🥟'];
  function avatarOf(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return AVATARS[h % AVATARS.length];
  }
  function avatarSpan(author) {
    var a = document.createElement('span');
    a.className = 'avatar sm';
    a.setAttribute('aria-hidden', 'true');
    a.textContent = author ? avatarOf(author) : '👤';
    return a;
  }

  function confetti(n) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var box = document.createElement('div');
    box.className = 'confetti';
    box.setAttribute('aria-hidden', 'true');
    var colors = ['#f5c542', '#e55d4f', '#3b6ea8', '#2f8f5b', '#d9622b', '#9b59b6'];
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = Math.random() * 0.5 + 's';
      s.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 3800);
  }

  function renderBanner(leaders, maxN) {
    var el = $('rankBanner');
    if (maxN < 2) { el.hidden = true; el.textContent = ''; return; }
    var names = leaders.slice(0, 3).map(function (d) { return (viewMonth + 1) + '월 ' + d + '일'; }).join(', ') +
      (leaders.length > 3 ? ' 외 ' + (leaders.length - 3) + '일' : '');
    el.textContent = '👑 ' + (leaders.length > 1 ? '이번 달 공동 1위: ' : '이번 달 1위: ') + names + ' (' + maxN + '명)';
    el.hidden = false;
  }

  function renderBattle() {
    var prefix = viewYear + '-' + pad(viewMonth + 1) + '-';
    var by = {};
    records.forEach(function (r) {
      if (r.date.indexOf(prefix) !== 0) return;
      (by[r.department] = by[r.department] || {})[r.name] = 1;   // 부서별 중복 없는 인원
    });
    var rows = Object.keys(by).map(function (d) { return { d: d, n: Object.keys(by[d]).length }; })
      .sort(function (a, b) { return b.n - a.n || a.d.localeCompare(b.d, 'ko'); })
      .slice(0, 5);
    var sec = $('deptBattle');
    if (!rows.length) { sec.hidden = true; return; }
    $('battleMonth').textContent = '(' + (viewMonth + 1) + '월 참여 인원 기준)';
    var ol = $('battleList');
    ol.innerHTML = '';
    var medals = ['🥇', '🥈', '🥉'];
    rows.forEach(function (row, i) {
      var li = document.createElement('li');
      var rank = document.createElement('span');
      rank.textContent = medals[i] || (i + 1) + '위';
      var dept = document.createElement('span');
      dept.className = 'dept';
      dept.textContent = row.d;
      var wrap = document.createElement('span');
      wrap.className = 'bar-wrap';
      var bar = document.createElement('span');
      bar.className = 'bar';
      bar.style.display = 'block';
      bar.style.width = Math.round(row.n / rows[0].n * 100) + '%';
      wrap.appendChild(bar);
      var n = document.createElement('span');
      n.className = 'n';
      n.textContent = row.n + '명';
      li.appendChild(rank); li.appendChild(dept); li.appendChild(wrap); li.appendChild(n);
      ol.appendChild(li);
    });
    sec.hidden = false;
  }

  /* ---------- 코멘트 반응 ---------- */
  var REACTIONS = ['👍', '😂', '🍺', '🔥'];
  var MY_REACT_KEY = 'teamDinnerMyReactions';
  var myReact = {};
  function loadMyReact() {
    try { var d = JSON.parse(localStorage.getItem(MY_REACT_KEY) || '{}'); return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; }
    catch (e) { return {}; }
  }
  function toggleReaction(id, emoji) {
    var c = comments.filter(function (x) { return x.id === id; })[0];
    if (!c || REACTIONS.indexOf(emoji) < 0) return;
    c.reactions = c.reactions || {};
    var mine = myReact[id] = myReact[id] || [];
    var i = mine.indexOf(emoji);
    if (i >= 0) { mine.splice(i, 1); c.reactions[emoji] = Math.max(0, (c.reactions[emoji] || 0) - 1); }
    else { mine.push(emoji); c.reactions[emoji] = (c.reactions[emoji] || 0) + 1; }
    saveComments();
    sync('react', { id: id, emoji: emoji, delta: i >= 0 ? -1 : 1 });
    try { localStorage.setItem(MY_REACT_KEY, JSON.stringify(myReact)); } catch (e) {}
    renderComments();
  }

  /* ---------- 메뉴 투표 / 룰렛 ---------- */
  var VOTE_KEY = 'teamDinnerVotes';          // { 날짜: { 참여기록id: 메뉴 } }
  var DEFAULT_MENUS = ['삼겹살·고기구이', '치킨 + 맥주', '샤브샤브', '마라탕·마라샹궈'];
  var votes = {};
  var spinning = false;

  function loadVotes() {
    try { var d = JSON.parse(localStorage.getItem(VOTE_KEY) || '{}'); return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; }
    catch (e) { return {}; }
  }
  function saveVotes() {
    if (REMOTE) return;
    try { localStorage.setItem(VOTE_KEY, JSON.stringify(votes)); } catch (e) { showStorageNotice('로컬 저장소에 저장하지 못했습니다.'); }
  }
  function removeVotesFor(id) {
    var changed = false;
    Object.keys(votes).forEach(function (d) { if (votes[d] && votes[d][id]) { delete votes[d][id]; changed = true; } });
    if (changed) saveVotes();
  }

  // 기분 상위 2개의 추천 메뉴 + 부족하면 기본 메뉴로 채워 최대 4개
  function menuCandidates(list) {
    var counts = {};
    list.forEach(function (r) { if (moodOf(r.mood)) counts[r.mood] = (counts[r.mood] || 0) + 1; });
    var ranked = MOODS.filter(function (m) { return counts[m.k]; })
      .sort(function (a, b) { return counts[b.k] - counts[a.k]; });
    var out = [];
    ranked.slice(0, 2).forEach(function (m) {
      MENUS[m.k].slice(0, 2).forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); });
    });
    DEFAULT_MENUS.forEach(function (x) { if (out.length < 4 && out.indexOf(x) < 0) out.push(x); });
    return out;
  }
  function tallyVotes(key, list, cands) {
    var alive = {};
    list.forEach(function (r) { alive[r.id] = 1; });   // 취소한 참여자의 표는 제외
    var t = {};
    cands.forEach(function (c) { t[c] = 0; });
    var v = votes[key] || {};
    Object.keys(v).forEach(function (id) { if (alive[id] && t.hasOwnProperty(v[id])) t[v[id]]++; });
    return t;
  }

  function renderVote(list) {
    var box = $('voteBox');
    if (!list.length) { box.hidden = true; return; }
    var sel = $('voterSelect');
    var prev = sel.value;
    sel.innerHTML = '';
    list.forEach(function (r) {
      var o = document.createElement('option');
      o.value = r.id;
      o.textContent = r.department + ' · ' + r.name;
      sel.appendChild(o);
    });
    if (prev && list.some(function (r) { return r.id === prev; })) sel.value = prev;
    renderVoteList();
    box.hidden = false;
  }

  function renderVoteList() {
    var key = selectedDate, list = forDate(key);
    var cands = menuCandidates(list), t = tallyVotes(key, list, cands);
    var mine = (votes[key] || {})[$('voterSelect').value];
    var max = Math.max.apply(null, cands.map(function (c) { return t[c]; }).concat(1));
    var ul = $('voteList');
    ul.innerHTML = '';
    cands.forEach(function (c) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'vote-btn' + (mine === c ? ' mine' : '');
      b.dataset.menu = c;
      var bar = document.createElement('span');
      bar.className = 'bar';
      bar.style.width = Math.round(t[c] / max * 100) + '%';
      var lbl = document.createElement('span');
      lbl.className = 'lbl';
      lbl.textContent = (mine === c ? '✅ ' : '') + c;
      var cnt = document.createElement('span');
      cnt.className = 'cnt';
      cnt.textContent = t[c] + '표';
      b.appendChild(bar); b.appendChild(lbl); b.appendChild(cnt);
      li.appendChild(b);
      ul.appendChild(li);
    });
  }

  function castVote(menu) {
    var voter = $('voterSelect').value;
    if (!voter) return;
    var v = votes[selectedDate] = votes[selectedDate] || {};
    var cancelled = v[voter] === menu;
    if (cancelled) { delete v[voter]; toast('투표를 취소했습니다.'); }
    else { v[voter] = menu; toast('🗳️ 투표 완료!'); }
    saveVotes();
    sync('vote', { date: selectedDate, voterId: voter, menu: cancelled ? null : menu });
    renderVoteList();
  }

  function spinRoulette() {
    if (spinning) return;
    var key = selectedDate, list = forDate(key);
    var cands = menuCandidates(list), t = tallyVotes(key, list, cands);
    var max = Math.max.apply(null, cands.map(function (c) { return t[c]; }));
    var pool = cands, note = '후보 전체에서 뽑아요!';
    if (max > 0) {
      pool = cands.filter(function (c) { return t[c] === max; });
      note = '동점 메뉴 중에서 뽑아요!';
    }
    var res = $('rouletteResult');
    if (pool.length === 1) {
      res.className = 'roulette-result done';
      res.textContent = '🏆 투표 1위: ' + pool[0] + ' (룰렛 없이 확정!)';
      return;
    }
    var finalMenu = pool[Math.floor(Math.random() * pool.length)];
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      res.className = 'roulette-result done';
      res.textContent = '🎯 오늘의 메뉴: ' + finalMenu;
      return;
    }
    spinning = true;
    $('rouletteBtn').disabled = true;
    var i = 0, steps = 24;
    res.className = 'roulette-result spin';
    (function tick() {
      if (i < steps) {
        res.textContent = '🎰 ' + pool[i % pool.length] + ' … (' + note + ')';
        var delay = 60 + i * i * 0.5;
        i++;
        setTimeout(tick, delay);
      } else {
        res.className = 'roulette-result done';
        res.textContent = '🎯 오늘의 메뉴: ' + finalMenu;
        spinning = false;
        $('rouletteBtn').disabled = false;
        if (selectedDate === key) confetti(50);
      }
    })();
  }

  /* ---------- 날짜 hover 툴팁 ---------- */
  var TIP_MAX = 8;
  function showDayTip(cell) {
    var key = cell.dataset.date;
    var list = forDate(key);
    var tip = $('dayTip');
    if (!list.length) { tip.hidden = true; return; }
    tip.innerHTML = '';
    var title = document.createElement('div');
    title.className = 'tip-title';
    title.textContent = labelDate(key) + ' · ' + list.length + '명';
    tip.appendChild(title);
    var ul = document.createElement('ul');
    list.slice(0, TIP_MAX).forEach(function (r) {
      var li = document.createElement('li');
      var mood = moodOf(r.mood);
      li.textContent = avatarOf(r.department + '|' + r.name) + ' ' + r.department + ' · ' + r.name + (mood ? ' ' + mood.e : '');
      ul.appendChild(li);
    });
    if (list.length > TIP_MAX) {
      var more = document.createElement('li');
      more.className = 'more';
      more.textContent = '… 외 ' + (list.length - TIP_MAX) + '명';
      ul.appendChild(more);
    }
    tip.appendChild(ul);
    tip.hidden = false;
    var rc = cell.getBoundingClientRect();
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = Math.min(Math.max(8, rc.left + rc.width / 2 - tw / 2), window.innerWidth - tw - 8);
    var top = rc.top - th - 8;
    if (top < 8) top = rc.bottom + 8;   // 위 공간이 부족하면 아래에 표시
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function hideDayTip() { $('dayTip').hidden = true; }

  /* ---------- 이벤트 ---------- */
  function init() {
    var gridEl = $('grid');
    gridEl.addEventListener('mouseover', function (e) {
      var cell = e.target.closest('.day[data-date]');
      if (cell) showDayTip(cell); else hideDayTip();
    });
    gridEl.addEventListener('mouseleave', hideDayTip);
    gridEl.addEventListener('focusin', function (e) {
      var cell = e.target.closest('.day[data-date]');
      if (cell) showDayTip(cell);
    });
    gridEl.addEventListener('focusout', hideDayTip);
    gridEl.addEventListener('click', hideDayTip);
    window.addEventListener('scroll', hideDayTip, true);

    var now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    records = REMOTE ? [] : load();
    comments = REMOTE ? [] : loadComments();
    votes = REMOTE ? {} : loadVotes();
    myReact = loadMyReact();
    try { if (!REMOTE && localStorage.getItem(STORAGE_KEY) === null) loadSampleFiles(); } catch (e) {}

    $('voterSelect').addEventListener('change', renderVoteList);
    $('voteList').addEventListener('click', function (e) {
      var b = e.target.closest('.vote-btn');
      if (b) castVote(b.dataset.menu);
    });
    $('rouletteBtn').addEventListener('click', spinRoulette);

    $('moodGroup').innerHTML = MOODS.map(function (m) {
      return '<label class="mood-opt"><input type="radio" name="mood" value="' + m.k + '">' +
        '<span><span class="emoji">' + m.e + '</span>' + m.t + '</span></label>';
    }).join('');

    $('commentForm').addEventListener('submit', submitComment);
    $('commentList').addEventListener('click', function (e) {
      var rbtn = e.target.closest('.react-btn');
      if (rbtn) { toggleReaction(rbtn.dataset.id, rbtn.dataset.emoji); return; }
      var btn = e.target.closest('.cancel-btn');
      if (!btn || !window.confirm('이 코멘트를 삭제하시겠습니까?')) return;
      var before = comments;
      comments = comments.filter(function (c) { return c.id !== btn.dataset.id; });
      if (!saveComments()) { comments = before; return; }
      sync('deleteComment', { id: btn.dataset.id });
      renderComments();
    });
    renderComments();

    $('prevBtn').addEventListener('click', function () { moveMonth(-1); });
    $('nextBtn').addEventListener('click', function () { moveMonth(1); });
    $('todayBtn').addEventListener('click', function () {
      var t = new Date(); viewYear = t.getFullYear(); viewMonth = t.getMonth(); render();
    });

    $('grid').addEventListener('click', function (e) {
      var cell = e.target.closest('.day[data-date]');
      if (!cell) return;
      var key = cell.dataset.date;
      if (forDate(key).length) openList(key); else openRegister(key);
    });

    $('addBtn').addEventListener('click', function () { openRegister(selectedDate); });
    $('registerForm').addEventListener('submit', submitRegister);
    $('participantList').addEventListener('click', function (e) {
      var btn = e.target.closest('.cancel-btn');
      if (btn) cancelRecord(btn.dataset.id);
    });

    document.querySelectorAll('.modal').forEach(function (m) {
      m.addEventListener('click', function (e) {
        if (e.target === m || e.target.hasAttribute('data-close')) closeModals();
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModals();
    });

    updateTimeNotice();
    setInterval(updateTimeNotice, 30000);
    render();

    if (REMOTE) {
      pull();
      setInterval(function () { if (!document.hidden) pull(); }, 30000);   // 다른 사람의 변경 반영
      document.addEventListener('visibilitychange', function () { if (!document.hidden) pull(); });
    }
  }

  init();
})();
