/* ═══════════════════════════════════════════
   FITMATCH — main.js  v4
   트레이너 데이터 확장 (추천이유·후기·뱃지·잔여석)
   스크롤 애니메이션 (IntersectionObserver)
   슬라이드 스토리 (홈 히어로)
   팝업 / 플로팅 배너
════════════════════════════════════════════ */

/* ─── TRAINER DATA (확장) ─── */
const TRAINERS = [
  {
    id:1, name:'이민준', spec:'다이어트 & 체형교정',
    tags:['다이어트','체형교정','초보환영'],
    price:60000, rating:4.9, rev:127, exp:'7년',
    img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=75',
    badge:'인기',                          // 인기 뱃지
    slots:2,                               // 남은 자리
    matchScore:97,                         // AI 매칭 점수
    reason:'초보자 맞춤 커리큘럼 전문가. 6개월 내 체중 감량 성공률 94%.',
    review:{ text:'"3개월 만에 -8kg, 체형까지 바뀌었어요!"', author:'김지연' },
    strengths:['식단 코칭 포함','초보 맞춤','체형 분석'],
  },
  {
    id:2, name:'김수아', spec:'근력 강화 & 바디프로필',
    tags:['근력','바디프로필','여성전문'],
    price:80000, rating:4.8, rev:94, exp:'5년',
    img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=75',
    badge:'추천',
    slots:3,
    matchScore:91,
    reason:'바디프로필 전문 촬영 경험 50회 이상. 여성 근력 증가 특화.',
    review:{ text:'"바디프로필 촬영 성공! 인생 사진 찍었어요."', author:'박소연' },
    strengths:['바디프로필 전문','여성 특화','근육량 증가'],
  },
  {
    id:3, name:'박정호', spec:'재활 & 기능성 운동',
    tags:['재활','필라테스','부상회복'],
    price:70000, rating:4.9, rev:156, exp:'9년',
    img:'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=75',
    badge:'전문가',
    slots:1,
    matchScore:88,
    reason:'물리치료사 자격증 보유. 무릎·허리 부상 재활 성공률 1위.',
    review:{ text:'"무릎 부상 후 포기했는데 다시 뛸 수 있게 됐어요."', author:'이성민' },
    strengths:['물리치료사 자격','부상 재활','통증 케어'],
  },
  {
    id:4, name:'최은지', spec:'다이어트 & 필라테스',
    tags:['다이어트','필라테스','여성전문'],
    price:55000, rating:4.7, rev:83, exp:'4년',
    img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=75',
    badge:null,
    slots:4,
    matchScore:83,
    reason:'가성비 최상. 필라테스와 유산소를 결합한 독자적 다이어트 프로그램.',
    review:{ text:'"가격 대비 최고예요. 체형이 예뻐졌어요."', author:'오유진' },
    strengths:['합리적 가격','필라테스 결합','체형 교정'],
  },
  {
    id:5, name:'정태양', spec:'근력 & 파워리프팅',
    tags:['근력','파워리프팅','고급자'],
    price:90000, rating:4.8, rev:61, exp:'6년',
    img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=75',
    badge:'마감임박',
    slots:1,
    matchScore:79,
    reason:'전국 파워리프팅 대회 입상자. 고급자 근력 향상 특화 프로그램.',
    review:{ text:'"데드리프트 100kg 돌파! 전문적인 코칭이에요."', author:'최동현' },
    strengths:['파워리프팅 전문','고급자 특화','대회 준비'],
  },
  {
    id:6, name:'한소희', spec:'바디프로필 & 다이어트',
    tags:['바디프로필','다이어트','식단관리'],
    price:75000, rating:5.0, rev:42, exp:'3년',
    img:'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&q=75',
    badge:'평점1위',
    slots:2,
    matchScore:94,
    reason:'평점 5.0 유지 중. 식단·운동·멘탈 케어 통합 관리로 완성도 최상.',
    review:{ text:'"식단부터 멘탈까지 다 잡아주셨어요. 완벽해요!"', author:'김지혜' },
    strengths:['평점 5.0','식단 통합 관리','멘탈 코칭'],
  },
];

const FMAP = {
  '다이어트':  ['다이어트','식단관리'],
  '근력':      ['근력','파워리프팅'],
  '재활':      ['재활','필라테스','부상회복'],
  '바디프로필':['바디프로필'],
};

/* ─── BADGE CONFIG ─── */
const BADGE_STYLE = {
  '인기':    { bg:'#FF385C', color:'#fff' },
  '추천':    { bg:'#1D9E75', color:'#fff' },
  '전문가':  { bg:'#185FA5', color:'#fff' },
  '평점1위': { bg:'#EF9F27', color:'#fff' },
  '마감임박':{ bg:'#111',    color:'#fff' },
};

/* ─── STATE ─── */
let liked   = new Set();
let curList = TRAINERS;

/* ─────────────────────────
   BOOKING PERSISTENCE
───────────────────────── */
function loadBookings() {
  try { const r = localStorage.getItem('fm_bookings'); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
function saveBookings() {
  try { localStorage.setItem('fm_bookings', JSON.stringify(bookings)); } catch {}
}
function addBooking(b) { bookings.unshift(b); saveBookings(); updateBookingBadge(); }

let bookings = loadBookings();

function updateBookingBadge() {
  const n = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'done').length;
  document.querySelectorAll('.nav-badge').forEach(el => {
    el.textContent = n; el.style.display = n > 0 ? 'flex' : 'none';
  });
}

/* ─────────────────────────
   NAV & HAMBURGER
───────────────────────── */
const mainNav       = document.getElementById('main-nav');
const hamburger     = document.getElementById('hamburger');
const mobileDrawer  = document.getElementById('mobile-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');

window.addEventListener('scroll', () => mainNav.classList.toggle('scrolled', scrollY > 10));
hamburger.addEventListener('click', toggleDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

function toggleDrawer() { mobileDrawer.classList.contains('open') ? closeDrawer() : openDrawer(); }
function openDrawer()  { hamburger.classList.add('open'); mobileDrawer.classList.add('open'); drawerOverlay.classList.add('open'); document.body.style.overflow='hidden'; }
function closeDrawer() { hamburger.classList.remove('open'); mobileDrawer.classList.remove('open'); drawerOverlay.classList.remove('open'); document.body.style.overflow=''; }

/* ─────────────────────────
   PAGE ROUTING
───────────────────────── */
const PAGE_IDS = ['home','ai','trainers','mypage'];

function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link, .drawer-link').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  const idx = PAGE_IDS.indexOf(name);
  document.querySelectorAll('.nav-link')[idx]?.classList.add('active');
  document.querySelectorAll('.drawer-link')[idx]?.classList.add('active');
  closeDrawer(); window.scrollTo(0,0);
  if (name === 'trainers') renderTrainers(TRAINERS);
  if (name === 'mypage')   renderMyPage();
  if (name === 'ai')       setTimeout(animateAIScore, 600);
  // 페이지 전환 후 스크롤 애니메이션 재실행
  setTimeout(initScrollAnims, 100);
}

function goHome()   { showPage('home', document.querySelectorAll('.nav-link')[0]); }
function goFilter(filter) {
  showPage('trainers', document.querySelectorAll('.nav-link')[2]);
  const idx = ['전체','다이어트','근력','재활','바디프로필'].indexOf(filter);
  const pills = document.querySelectorAll('.f-pill');
  if (pills[idx]) filterT(filter, pills[idx]);
}

/* ─────────────────────────
   TRAINER CARDS (개선)
───────────────────────── */
function renderTrainers(list) {
  curList = list;
  const g = document.getElementById('tgrid-main');
  if (!list.length) {
    g.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--gray3)">조건에 맞는 트레이너가 없어요</div>`;
    return;
  }

  g.innerHTML = list.map(t => {
    const badgeHtml = t.badge
      ? `<span class="t-badge-top" style="background:${BADGE_STYLE[t.badge]?.bg||'#111'};color:${BADGE_STYLE[t.badge]?.color||'#fff'}">${t.badge}</span>`
      : '';
    const slotsHtml = t.slots <= 2
      ? `<span class="t-slots-warn">잔여 ${t.slots}자리</span>`
      : `<span class="t-slots-ok">잔여 ${t.slots}자리</span>`;
    const starsHtml = '★'.repeat(Math.round(t.rating)) + '☆'.repeat(5 - Math.round(t.rating));

    return `
    <div class="t-card reveal" data-id="${t.id}">
      <div class="t-card-img">
        <img class="t-card-img-inner" src="${t.img}" alt="${t.name}" loading="lazy"/>
        ${badgeHtml}
        <button class="t-fav${liked.has(t.id)?' liked':''}" onclick="toggleLike(event,${t.id})" aria-label="찜하기">♥</button>
        <!-- AI 매칭 점수 오버레이 -->
        <div class="t-match-score">
          <span class="t-match-label">AI 매칭</span>
          <span class="t-match-num">${t.matchScore}%</span>
        </div>
      </div>

      <!-- 카드 기본 정보 -->
      <div class="t-card-body">
        <div class="t-card-header">
          <div>
            <div class="t-name">${t.name} 트레이너</div>
            <div class="t-spec">${t.spec}</div>
          </div>
          <div class="t-card-meta">
            <div class="t-price">${Math.round(t.price/10000)}만원 <span>/ 회</span></div>
            ${slotsHtml}
          </div>
        </div>

        <!-- 별점 + 리뷰 수 -->
        <div class="t-rating-row">
          <span class="t-stars">${starsHtml}</span>
          <span class="t-rating-num">${t.rating}</span>
          <span class="t-rev">(${t.rev}명 후기)</span>
          <span class="t-exp-badge">경력 ${t.exp}</span>
        </div>

        <!-- 태그 -->
        <div class="t-tags">${t.tags.map(tg=>`<span class="t-tag">${tg}</span>`).join('')}</div>

        <!-- AI 추천 이유 박스 -->
        <div class="t-reason-box">
          <span class="t-reason-label">✦ AI 추천 이유</span>
          <p class="t-reason-text">${t.reason}</p>
        </div>

        <!-- 대표 후기 -->
        <div class="t-review-quote">
          <span class="t-quote-mark">"</span>
          <span class="t-quote-text">${t.review.text.replace(/"/g,'')}</span>
          <span class="t-quote-author">— ${t.review.author}</span>
        </div>

        <!-- 강점 태그 -->
        <div class="t-strengths">
          ${t.strengths.map(s=>`<span class="t-strength-tag">✓ ${s}</span>`).join('')}
        </div>

        <button class="t-book-btn" onclick="openSheet(${t.id})">예약하기</button>
      </div>

      <!-- 호버 오버레이: 예상 결과 -->
      <div class="t-hover-overlay">
        <div class="t-hover-title">예상 결과</div>
        <div class="t-hover-result">
          ${t.spec.includes('다이어트') ? '3개월 내 -5~10kg 감량 가능' :
            t.spec.includes('근력')     ? '3개월 내 근력 30% 향상 가능' :
            t.spec.includes('재활')     ? '2~3개월 내 통증 완화 기대' :
                                          '맞춤 목표 달성 프로그램 제공'}
        </div>
        <button class="t-hover-btn" onclick="openSheet(${t.id})">지금 예약하기 →</button>
      </div>
    </div>`;
  }).join('');

  // 카드 렌더 후 스크롤 애니메이션 등록
  setTimeout(initScrollAnims, 50);
}

function toggleLike(e, id) {
  e.stopPropagation();
  liked.has(id) ? liked.delete(id) : liked.add(id);
  renderTrainers(curList);
}

/* ─────────────────────────
   FILTER
───────────────────────── */
function filterT(filter, btn) {
  document.querySelectorAll('.f-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const list = filter==='전체' ? TRAINERS
    : TRAINERS.filter(t => { const kw=FMAP[filter]||[filter]; return t.tags.some(tg=>kw.some(k=>tg.includes(k))); });
  renderTrainers(list);
}

/* ─────────────────────────
   CHIP TOGGLE
───────────────────────── */
document.addEventListener('click', e => {
  if (!e.target.classList.contains('chip')) return;
  const g = e.target.dataset.g; if (!g) return;
  document.querySelectorAll(`.chip[data-g="${g}"]`).forEach(c => c.classList.remove('on'));
  e.target.classList.add('on');
});

/* ─────────────────────────
   MY PAGE
───────────────────────── */
function renderMyPage() {
  const c = document.getElementById('booking-list');
  const active = bookings.filter(b => b.status !== 'cancelled');
  if (!active.length) {
    c.innerHTML = `<div class="empty-wrap"><div class="empty-big">NO<br>SESSIONS</div><div class="empty-sub">아직 예약된 세션이 없어요.<br>AI 매칭으로 첫 PT를 시작해보세요!</div><button class="empty-cta" onclick="showPage('ai',document.querySelectorAll('.nav-link')[1])">AI 매칭 시작하기 →</button></div>`;
    return;
  }
  const SL = {new:'신규 예약', upcoming:'예정', done:'완료'};
  const SC = {new:'b-new', upcoming:'b-upcoming', done:'b-done'};
  c.innerHTML = active.map(b => {
    const ri = bookings.indexOf(b), st = b.status||'upcoming';
    return `<div class="b-item"><img class="b-thumb" src="${b.trainer.img}" alt="${b.trainer.name}" loading="lazy"/><div class="b-info"><div class="b-name">${b.trainer.name} 트레이너</div><div class="b-time">${b.date} · ${b.time}</div><div class="b-price">${Math.round(b.trainer.price/10000)}만원</div><div class="b-user">예약자: ${b.user.name} · ${b.user.phone}</div><div class="b-booking-id">예약번호 ${b.id}</div></div><div class="b-right"><span class="b-status ${SC[st]||'b-upcoming'}">${SL[st]||'예정'}</span>${st!=='done'?`<button class="b-cancel-btn" onclick="confirmCancel(${ri})">취소</button>`:''}</div></div>`;
  }).join('');
}

function confirmCancel(idx) {
  const b = bookings[idx]; if (!b) return;
  if (!confirm(`${b.trainer.name} 트레이너\n${b.date} ${b.time} 예약을 취소하시겠어요?`)) return;
  bookings[idx].status = 'cancelled';
  saveBookings(); updateBookingBadge(); renderMyPage();
  showToast('예약이 취소되었습니다');
}

/* ─────────────────────────
   TOAST
───────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 3200);
}

/* ═══════════════════════════════════════
   스크롤 등장 애니메이션 (IntersectionObserver)
════════════════════════════════════════ */
let scrollObserver = null;

function initScrollAnims() {
  if (scrollObserver) scrollObserver.disconnect();

  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.classList.add('revealed');
        scrollObserver.unobserve(el.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
    scrollObserver.observe(el);
  });
}

/* ═══════════════════════════════════════
   홈 히어로 스토리 슬라이드
════════════════════════════════════════ */
const SLIDES = [
  {
    img:  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80',
    tag:  '다이어트 성공 스토리',
    head: 'FIND<br>YOUR<br><em>TRAINER</em>',
    sub:  '목표, 예산, 스타일에 딱 맞는 트레이너를<br>AI가 투명하게 연결해드립니다.',
  },
  {
    img:  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
    tag:  '근력 강화 스토리',
    head: '3개월<br>만에<br><em>+15KG</em>',
    sub:  '파워리프팅 전문 트레이너와 함께<br>원하는 몸을 만들어보세요.',
  },
  {
    img:  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=1400&q=80',
    tag:  '바디프로필 스토리',
    head: '인생<br>사진을<br><em>찍다</em>',
    sub:  '바디프로필 전문 트레이너와 함께<br>6개월 변화를 경험하세요.',
  },
  {
    img:  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400&q=80',
    tag:  '재활 성공 스토리',
    head: '부상<br>없이<br><em>더 강하게</em>',
    sub:  '재활 전문 트레이너가 안전하게<br>회복을 도와드립니다.',
  },
];

let slideIdx  = 0;
let slideTimer = null;

function initSlider() {
  const bg   = document.getElementById('hero-slide-bg');
  const tag  = document.getElementById('slide-tag');
  const head = document.getElementById('slide-head');
  const sub  = document.getElementById('slide-sub');
  const dots = document.querySelectorAll('.slide-dot');
  if (!bg) return;

  function goSlide(n) {
    slideIdx = (n + SLIDES.length) % SLIDES.length;
    const s = SLIDES[slideIdx];

    // 크로스페이드
    bg.style.opacity = '0';
    setTimeout(() => {
      bg.style.backgroundImage = `url('${s.img}')`;
      bg.style.opacity = '1';
    }, 300);

    // 텍스트 전환
    [tag, head, sub].forEach(el => { el.style.opacity='0'; el.style.transform='translateY(12px)'; });
    setTimeout(() => {
      tag.textContent   = s.tag;
      head.innerHTML    = s.head;
      sub.innerHTML     = s.sub;
      [tag, head, sub].forEach(el => { el.style.opacity='1'; el.style.transform='translateY(0)'; });
    }, 250);

    // 도트
    dots.forEach((d,i) => d.classList.toggle('active', i === slideIdx));
  }

  function nextSlide() { goSlide(slideIdx + 1); }
  function prevSlide() { goSlide(slideIdx - 1); }

  // 자동 재생
  function startAuto() {
    stopAuto();
    slideTimer = setInterval(nextSlide, 5000);
  }
  function stopAuto() { if (slideTimer) { clearInterval(slideTimer); slideTimer = null; } }

  // 이벤트 연결
  document.getElementById('slide-prev')?.addEventListener('click', () => { prevSlide(); startAuto(); });
  document.getElementById('slide-next')?.addEventListener('click', () => { nextSlide(); startAuto(); });
  dots.forEach((d,i) => d.addEventListener('click', () => { goSlide(i); startAuto(); }));

  // 터치 스와이프
  let touchX = 0;
  const heroEl = document.querySelector('.hero');
  heroEl?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, {passive:true});
  heroEl?.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { dx < 0 ? nextSlide() : prevSlide(); startAuto(); }
  }, {passive:true});

  goSlide(0);
  startAuto();
}

/* ═══════════════════════════════════════
   AI 히어로 매칭 스코어 애니메이션
════════════════════════════════════════ */
function animateAIScore() {
  // 스코어 카운터 애니메이션
  document.querySelectorAll('.ai-score-num').forEach(el => {
    const target = parseInt(el.dataset.target || el.textContent);
    let current = 0;
    const step  = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + (el.dataset.suffix || '');
      if (current >= target) clearInterval(timer);
    }, 30);
  });

  // 스캔 라인 애니메이션 트리거
  document.querySelectorAll('.ai-scan-card').forEach((el, i) => {
    setTimeout(() => el.classList.add('scanned'), 400 + i * 300);
  });

  // 매칭 바 채우기
  document.querySelectorAll('.ai-match-bar-fill').forEach(el => {
    setTimeout(() => { el.style.width = el.dataset.width; }, 600);
  });
}

/* ═══════════════════════════════════════
   팝업 & 플로팅 배너
════════════════════════════════════════ */
const POPUP_KEY  = 'fm_promo_seen';
const BANNER_KEY = 'fm_banner_closed';

function initPromo() {
  const lastSeen = localStorage.getItem(POPUP_KEY);
  const INTERVAL = 24 * 60 * 60 * 1000;
  if (!lastSeen || Date.now() - parseInt(lastSeen) > INTERVAL) {
    setTimeout(() => {
      document.getElementById('promo-overlay')?.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      startPromoTimer();
    }, 1200);
  } else {
    showFloatBanner();
  }
}

function closePromo(goAI = false) {
  localStorage.setItem(POPUP_KEY, Date.now().toString());
  const ov = document.getElementById('promo-overlay');
  ov.style.transition='opacity .2s'; ov.style.opacity='0';
  setTimeout(() => { ov.classList.add('hidden'); ov.style.opacity=''; }, 200);
  document.body.style.overflow = '';
  stopPromoTimer();
  showFloatBanner();
  if (goAI) showPage('ai', document.querySelectorAll('.nav-link')[1]);
}

function closeFloatBanner() {
  localStorage.setItem(BANNER_KEY, '1');
  const b = document.getElementById('float-banner');
  if (b) { b.style.transition='opacity .2s'; b.style.opacity='0'; setTimeout(()=>b.classList.add('hidden'),200); }
}

function showFloatBanner() {
  if (localStorage.getItem(BANNER_KEY)) return;
  const b = document.getElementById('float-banner');
  if (b) b.classList.remove('hidden');
}

let timerInterval = null;
function startPromoTimer() {
  let total = 23*3600 + 59*60 + 59;
  function render() {
    const h=String(Math.floor(total/3600)).padStart(2,'0');
    const m=String(Math.floor((total%3600)/60)).padStart(2,'0');
    const s=String(total%60).padStart(2,'0');
    const hEl=document.getElementById('timer-h');
    const mEl=document.getElementById('timer-m');
    const sEl=document.getElementById('timer-s');
    if(hEl)hEl.textContent=h; if(mEl)mEl.textContent=m; if(sEl)sEl.textContent=s;
  }
  render();
  timerInterval = setInterval(()=>{ total=Math.max(0,total-1); render(); }, 1000);
}
function stopPromoTimer() { if(timerInterval){clearInterval(timerInterval);timerInterval=null;} }

/* ── INIT ── */
renderTrainers(TRAINERS);
updateBookingBadge();
initPromo();

// DOM 준비 후 슬라이더 + 스크롤 애니메이션 시작
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initScrollAnims();
});
// DOMContentLoaded 이미 지난 경우 대비
if (document.readyState !== 'loading') {
  initSlider();
  initScrollAnims();
}
