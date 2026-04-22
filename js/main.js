/* ═══════════════════════════════════
   FITMATCH — main.js  v2
   + localStorage 예약 영속화
   + 예약 뱃지 카운트
   + 예약 취소
═══════════════════════════════════ */

const TRAINERS = [
  { id:1, name:'이민준', spec:'다이어트 & 체형교정',    tags:['다이어트','체형교정','초보환영'], price:60000, rating:4.9, rev:127, exp:'7년', img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=75' },
  { id:2, name:'김수아', spec:'근력 강화 & 바디프로필', tags:['근력','바디프로필','여성전문'],   price:80000, rating:4.8, rev:94,  exp:'5년', img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=75' },
  { id:3, name:'박정호', spec:'재활 & 기능성 운동',    tags:['재활','필라테스','부상회복'],     price:70000, rating:4.9, rev:156, exp:'9년', img:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=75' },
  { id:4, name:'최은지', spec:'다이어트 & 필라테스',   tags:['다이어트','필라테스','여성전문'],  price:55000, rating:4.7, rev:83,  exp:'4년', img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=75' },
  { id:5, name:'정태양', spec:'근력 & 파워리프팅',     tags:['근력','파워리프팅','고급자'],     price:90000, rating:4.8, rev:61,  exp:'6년', img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=75' },
  { id:6, name:'한소희', spec:'바디프로필 & 다이어트', tags:['바디프로필','다이어트','식단관리'],price:75000, rating:5.0, rev:42,  exp:'3년', img:'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&q=75' },
];

const FMAP = {
  '다이어트':  ['다이어트','식단관리'],
  '근력':      ['근력','파워리프팅'],
  '재활':      ['재활','필라테스','부상회복'],
  '바디프로필':['바디프로필'],
};

/* ── STATE ── */
let liked   = new Set();
let curList = TRAINERS;

/* ─────────────────────────────────
   BOOKING PERSISTENCE
   localStorage key: "fm_bookings"
   구조: { id, trainer, user, date, time, status }
   status: 'new' | 'upcoming' | 'done' | 'cancelled'
───────────────────────────────── */
function loadBookings() {
  try { const r = localStorage.getItem('fm_bookings'); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
function saveBookings() {
  try { localStorage.setItem('fm_bookings', JSON.stringify(bookings)); } catch {}
}
function addBooking(b) {
  bookings.unshift(b);
  saveBookings();
  updateBookingBadge();
}

let bookings = loadBookings();

/* ── 뱃지: 활성 예약 수 표시 ── */
function updateBookingBadge() {
  const n = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'done').length;
  document.querySelectorAll('.nav-badge').forEach(el => {
    el.textContent   = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  });
}

/* ─────────────────────────────────
   NAV & HAMBURGER
───────────────────────────────── */
const mainNav       = document.getElementById('main-nav');
const hamburger     = document.getElementById('hamburger');
const mobileDrawer  = document.getElementById('mobile-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');

window.addEventListener('scroll', () =>
  mainNav.classList.toggle('scrolled', scrollY > 10));

hamburger.addEventListener('click', toggleDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

function toggleDrawer() {
  mobileDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
}
function openDrawer() {
  hamburger.classList.add('open');
  mobileDrawer.classList.add('open');
  drawerOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  hamburger.classList.remove('open');
  mobileDrawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────
   PAGE ROUTING
───────────────────────────────── */
const PAGE_IDS = ['home','ai','trainers','mypage'];

function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link, .drawer-link').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');

  const idx = PAGE_IDS.indexOf(name);
  document.querySelectorAll('.nav-link')[idx]?.classList.add('active');
  document.querySelectorAll('.drawer-link')[idx]?.classList.add('active');

  closeDrawer();
  window.scrollTo(0, 0);

  if (name === 'trainers') renderTrainers(TRAINERS);
  if (name === 'mypage')   renderMyPage();
}

function goHome() { showPage('home', document.querySelectorAll('.nav-link')[0]); }
function goFilter(filter) {
  showPage('trainers', document.querySelectorAll('.nav-link')[2]);
  const idx = ['전체','다이어트','근력','재활','바디프로필'].indexOf(filter);
  const pills = document.querySelectorAll('.f-pill');
  if (pills[idx]) filterT(filter, pills[idx]);
}

/* ─────────────────────────────────
   TRAINER CARDS
───────────────────────────────── */
function renderTrainers(list) {
  curList = list;
  const g = document.getElementById('tgrid-main');
  if (!list.length) {
    g.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--gray3)">조건에 맞는 트레이너가 없어요</div>`;
    return;
  }
  g.innerHTML = list.map(t => `
    <div class="t-card">
      <div class="t-card-img">
        <img class="t-card-img-inner" src="${t.img}" alt="${t.name}" loading="lazy"/>
        <span class="t-badge">경력 ${t.exp}</span>
        <button class="t-fav${liked.has(t.id)?' liked':''}" onclick="toggleLike(event,${t.id})" aria-label="찜하기">♥</button>
      </div>
      <div class="t-name">${t.name} 트레이너</div>
      <div class="t-spec">${t.spec}</div>
      <div class="t-tags">${t.tags.map(tg=>`<span class="t-tag">${tg}</span>`).join('')}</div>
      <div class="t-row">
        <div class="t-rating"><span class="t-star">★</span>${t.rating}<span class="t-rev">(${t.rev})</span></div>
        <div class="t-price">${Math.round(t.price/10000)}만원 <span>/ 1회</span></div>
      </div>
      <button class="t-book-btn" onclick="openSheet(${t.id})">예약하기</button>
    </div>`).join('');
}

function toggleLike(e, id) {
  e.stopPropagation();
  liked.has(id) ? liked.delete(id) : liked.add(id);
  renderTrainers(curList);
}

/* ─────────────────────────────────
   FILTER
───────────────────────────────── */
function filterT(filter, btn) {
  document.querySelectorAll('.f-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const list = filter==='전체' ? TRAINERS
    : TRAINERS.filter(t => { const kw=FMAP[filter]||[filter]; return t.tags.some(tg=>kw.some(k=>tg.includes(k))); });
  renderTrainers(list);
}

/* ─────────────────────────────────
   CHIP TOGGLE (AI page)
───────────────────────────────── */
document.addEventListener('click', e => {
  if (!e.target.classList.contains('chip')) return;
  const g = e.target.dataset.g; if (!g) return;
  document.querySelectorAll(`.chip[data-g="${g}"]`).forEach(c => c.classList.remove('on'));
  e.target.classList.add('on');
});

/* ─────────────────────────────────
   MY PAGE
───────────────────────────────── */
function renderMyPage() {
  const c = document.getElementById('booking-list');
  const active = bookings.filter(b => b.status !== 'cancelled');

  if (!active.length) {
    c.innerHTML = `
      <div class="empty-wrap">
        <div class="empty-big">NO<br>SESSIONS</div>
        <div class="empty-sub">아직 예약된 세션이 없어요.<br>AI 매칭으로 첫 PT를 시작해보세요!</div>
        <button class="empty-cta" onclick="showPage('ai',document.querySelectorAll('.nav-link')[1])">AI 매칭 시작하기 →</button>
      </div>`;
    return;
  }

  const STATUS_LABEL = { new:'신규 예약', upcoming:'예정', done:'완료' };
  const STATUS_CLS   = { new:'b-new',     upcoming:'b-upcoming', done:'b-done' };

  c.innerHTML = active.map(b => {
    const realIdx = bookings.indexOf(b);
    const st = b.status || 'upcoming';
    return `
      <div class="b-item">
        <img class="b-thumb" src="${b.trainer.img}" alt="${b.trainer.name}" loading="lazy"/>
        <div class="b-info">
          <div class="b-name">${b.trainer.name} 트레이너</div>
          <div class="b-time">${b.date} · ${b.time}</div>
          <div class="b-price">${Math.round(b.trainer.price/10000)}만원</div>
          <div class="b-user">예약자: ${b.user.name} · ${b.user.phone}</div>
          <div class="b-booking-id">예약번호 ${b.id}</div>
        </div>
        <div class="b-right">
          <span class="b-status ${STATUS_CLS[st]||'b-upcoming'}">${STATUS_LABEL[st]||'예정'}</span>
          ${st!=='done' ? `<button class="b-cancel-btn" onclick="confirmCancel(${realIdx})">취소</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

function confirmCancel(idx) {
  const b = bookings[idx]; if (!b) return;
  if (!confirm(`${b.trainer.name} 트레이너\n${b.date} ${b.time} 예약을 취소하시겠어요?`)) return;
  bookings[idx].status = 'cancelled';
  saveBookings();
  updateBookingBadge();
  renderMyPage();
  showToast('예약이 취소되었습니다');
}

/* ─────────────────────────────────
   TOAST
───────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 3200);
}

/* ── INIT ── */
renderTrainers(TRAINERS);
updateBookingBadge();

/* ═══════════════════════════════════
   웰컴 팝업 & 플로팅 배너 로직
   - 팝업: 첫 방문 또는 24시간 후 재표시
   - 배너: 팝업 닫은 후 2.5초 딜레이로 표시
═══════════════════════════════════ */
const POPUP_KEY  = 'fm_promo_seen';
const BANNER_KEY = 'fm_banner_closed';

function initPromo() {
  const lastSeen = localStorage.getItem(POPUP_KEY);
  const now      = Date.now();
  // 24시간(ms) 이후에 다시 표시
  const INTERVAL = 24 * 60 * 60 * 1000;

  if (!lastSeen || now - parseInt(lastSeen) > INTERVAL) {
    // 페이지 로드 후 1.2초 딜레이로 팝업 표시
    setTimeout(() => {
      document.getElementById('promo-overlay')?.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      startPromoTimer();
    }, 1200);
  } else {
    // 팝업 없이 배너만
    showFloatBanner();
  }
}

function closePromo(goAI = false) {
  localStorage.setItem(POPUP_KEY, Date.now().toString());
  const overlay = document.getElementById('promo-overlay');
  overlay.style.animation = 'none';
  overlay.style.opacity   = '0';
  overlay.style.transition = 'opacity .2s';
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.style.opacity = '';
  }, 200);
  document.body.style.overflow = '';
  stopPromoTimer();

  // 배너 표시 (2.5s 딜레이는 CSS animation-delay로 처리)
  showFloatBanner();

  if (goAI) showPage('ai', document.querySelectorAll('.nav-link')[1]);
}

function closeFloatBanner() {
  localStorage.setItem(BANNER_KEY, '1');
  const b = document.getElementById('float-banner');
  if (b) { b.style.transition = 'opacity .2s'; b.style.opacity = '0'; setTimeout(() => b.classList.add('hidden'), 200); }
}

function showFloatBanner() {
  if (localStorage.getItem(BANNER_KEY)) return;
  const b = document.getElementById('float-banner');
  if (b) b.classList.remove('hidden');
}

/* 카운트다운 타이머 (23:59:59 부터 감소) */
let timerInterval = null;
function startPromoTimer() {
  let total = 23 * 3600 + 59 * 60 + 59;
  function render() {
    const h = String(Math.floor(total/3600)).padStart(2,'0');
    const m = String(Math.floor((total%3600)/60)).padStart(2,'0');
    const s = String(total%60).padStart(2,'0');
    const hEl = document.getElementById('timer-h');
    const mEl = document.getElementById('timer-m');
    const sEl = document.getElementById('timer-s');
    if (hEl) hEl.textContent = h;
    if (mEl) mEl.textContent = m;
    if (sEl) sEl.textContent = s;
  }
  render();
  timerInterval = setInterval(() => { total = Math.max(0, total-1); render(); }, 1000);
}
function stopPromoTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

/* 초기화 */
initPromo();
