/* ═══════════════════════════════════
   FITMATCH — booking.js  v2
   개선사항:
   1. 예약자 정보 localStorage 기억 + 자동완성
   2. 3단계 → 2단계 (정보 입력 + 날짜/시간 통합)
   3. 예약 완료 화면 (예약번호 + 복사)
   4. 고유 예약번호 자동 생성
═══════════════════════════════════ */

const SLOTS   = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
const UNAVAIL = [2, 5, 9];
const LS_USER = 'fm_user_info'; // localStorage key for user info

/* ── STATE ── */
let selT    = null;
let selSlot = null;
let curStep = 1;  // 1: 정보+날짜 | 2: 확인

/* ─────────────────────────────────
   OPEN / CLOSE
───────────────────────────────── */
function openSheet(id) {
  selT    = TRAINERS.find(t => t.id === id);
  selSlot = null;
  curStep = 1;

  document.getElementById('sh-name').textContent  = selT.name + ' 트레이너 예약';
  document.getElementById('sh-price').textContent = `1회 ${Math.round(selT.price/10000)}만원 · 수수료 0원`;

  // 날짜 초기화
  const dateEl = document.getElementById('bdate');
  dateEl.value = '';
  dateEl.min   = new Date().toISOString().split('T')[0];

  // 시간 그리드 초기화
  document.getElementById('time-grid').innerHTML =
    `<span style="font-size:12px;color:var(--gray3);grid-column:1/-1">날짜를 먼저 선택해주세요</span>`;

  // 에러 초기화
  document.querySelectorAll('.sh-error').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('.sh-input').forEach(e => e.classList.remove('error'));

  // 저장된 사용자 정보 자동완성
  prefillUserInfo();

  goStep(1);

  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('overlay')) closeSheet();
});

/* ─────────────────────────────────
   사용자 정보 기억 (localStorage)
───────────────────────────────── */
function prefillUserInfo() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_USER) || '{}');
    if (saved.name)  document.getElementById('u-name').value  = saved.name;
    if (saved.phone) document.getElementById('u-phone').value = saved.phone;
    if (saved.email) document.getElementById('u-email').value = saved.email;

    // 저장된 정보가 있으면 자동완성 배너 표시
    if (saved.name || saved.phone) {
      document.getElementById('autofill-banner').style.display = 'flex';
    } else {
      document.getElementById('autofill-banner').style.display = 'none';
    }
  } catch {}
}

function saveUserInfo() {
  try {
    const info = {
      name:  document.getElementById('u-name').value.trim(),
      phone: document.getElementById('u-phone').value.trim(),
      email: document.getElementById('u-email').value.trim(),
    };
    if (document.getElementById('u-save-info')?.checked) {
      localStorage.setItem(LS_USER, JSON.stringify(info));
    }
  } catch {}
}

function clearSavedInfo() {
  localStorage.removeItem(LS_USER);
  ['u-name','u-phone','u-email'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('autofill-banner').style.display = 'none';
  document.getElementById('u-save-info').checked = false;
  showToast('저장된 정보를 삭제했어요');
}

/* ─────────────────────────────────
   STEP 이동
───────────────────────────────── */
function goStep(n) {
  curStep = n;
  document.querySelectorAll('.step-item').forEach((el, i) => {
    el.classList.remove('active','done');
    if (i+1 === n)    el.classList.add('active');
    else if (i+1 < n) el.classList.add('done');
    const dot = el.querySelector('.step-dot');
    dot.textContent = i+1 < n ? '✓' : i+1;
  });
  document.querySelectorAll('.step-panel').forEach((p,i) => {
    p.classList.toggle('active', i+1 === n);
  });
  document.querySelector('.sheet').scrollTo({ top:0, behavior:'smooth' });
}

/* ─────────────────────────────────
   STEP 1 → 2: 정보 + 날짜/시간 검증
───────────────────────────────── */
function nextToStep2() {
  const name  = document.getElementById('u-name').value.trim();
  const phone = document.getElementById('u-phone').value.trim();
  const email = document.getElementById('u-email').value.trim();
  const date  = document.getElementById('bdate').value;
  let valid = true;

  // 이름
  if (!name) { showFieldError('u-name','err-name','이름을 입력해주세요'); valid=false; }
  else clearFieldError('u-name','err-name');

  // 연락처
  const phoneReg = /^01[0-9]-?\d{3,4}-?\d{4}$/;
  if (!phone) { showFieldError('u-phone','err-phone','연락처를 입력해주세요'); valid=false; }
  else if (!phoneReg.test(phone.replace(/\s/g,''))) { showFieldError('u-phone','err-phone','예: 010-1234-5678'); valid=false; }
  else clearFieldError('u-phone','err-phone');

  // 이메일 (선택)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('u-email','err-email','올바른 이메일 형식을 입력해주세요'); valid=false;
  } else clearFieldError('u-email','err-email');

  // 날짜
  if (!date) { showFieldError('bdate','err-date','날짜를 선택해주세요'); valid=false; }
  else clearFieldError('bdate','err-date');

  // 시간
  if (!selSlot) { showToast('시간을 선택해주세요'); valid=false; }

  if (!valid) return;

  buildSummary();
  goStep(2);
}

/* ─────────────────────────────────
   STEP 2: 확인 요약 빌드
───────────────────────────────── */
function buildSummary() {
  const name  = document.getElementById('u-name').value.trim();
  const phone = document.getElementById('u-phone').value.trim();
  const email = document.getElementById('u-email').value.trim();
  const memo  = document.getElementById('u-memo').value.trim();
  const date  = document.getElementById('bdate').value;
  const price = Math.round(selT.price/10000) + '만원';

  document.getElementById('cs-img').src                    = selT.img;
  document.getElementById('cs-trainer-name').textContent   = selT.name + ' 트레이너';
  document.getElementById('cs-trainer-spec').textContent   = selT.spec;
  document.getElementById('cs-date').textContent           = date;
  document.getElementById('cs-time').textContent           = selSlot;
  document.getElementById('cs-price').textContent          = price;
  document.getElementById('cs-total').textContent          = price;
  document.getElementById('cs-u-name').textContent         = name;
  document.getElementById('cs-u-phone').textContent        = phone;
  document.getElementById('cs-u-email').textContent        = email || '—';
  document.getElementById('cs-u-memo').textContent         = memo  || '없음';
}

/* ─────────────────────────────────
   TIME SLOTS
───────────────────────────────── */
function genSlots() {
  clearFieldError('bdate','err-date');
  selSlot = null;
  document.getElementById('time-grid').innerHTML = SLOTS.map((s,i) => {
    const na = UNAVAIL.includes(i);
    return `<button class="t-slot${na?' na':''}"${na?'':` onclick="pickSlot(this,'${s}')"`}>${s}</button>`;
  }).join('');
}

function pickSlot(el, time) {
  document.querySelectorAll('.t-slot').forEach(s => s.classList.remove('picked'));
  el.classList.add('picked');
  selSlot = time;
}

/* ─────────────────────────────────
   예약 확정
───────────────────────────────── */
function confirmBook() {
  const name  = document.getElementById('u-name').value.trim();
  const phone = document.getElementById('u-phone').value.trim();
  const email = document.getElementById('u-email').value.trim();
  const memo  = document.getElementById('u-memo').value.trim();
  const date  = document.getElementById('bdate').value;
  if (!date || !selSlot) return;

  // 사용자 정보 저장 (체크 시)
  saveUserInfo();

  // 고유 예약번호 생성 (FM + 8자리 랜덤)
  const bookingId = 'FM' + Math.random().toString(36).substring(2,10).toUpperCase();

  const newBooking = {
    id:      bookingId,
    trainer: { id:selT.id, name:selT.name, spec:selT.spec, price:selT.price, img:selT.img },
    user:    { name, phone, email, memo },
    date,
    time:    selSlot,
    status:  'new',
    createdAt: new Date().toISOString(),
  };

  addBooking(newBooking);
  closeSheet();
  showBookingComplete(newBooking);
}

/* ─────────────────────────────────
   예약 완료 화면
───────────────────────────────── */
function showBookingComplete(b) {
  document.getElementById('bc-id').textContent           = b.id;
  document.getElementById('bc-trainer').textContent      = b.trainer.name + ' 트레이너';
  document.getElementById('bc-datetime').textContent     = `${b.date} · ${b.time}`;
  document.getElementById('bc-price').textContent        = Math.round(b.trainer.price/10000) + '만원';
  document.getElementById('bc-user').textContent         = `${b.user.name} · ${b.user.phone}`;
  document.getElementById('booking-complete').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBookingComplete() {
  document.getElementById('booking-complete').classList.remove('open');
  document.body.style.overflow = '';
  showPage('mypage', document.querySelectorAll('.nav-link')[3]);
}

function copyBookingId() {
  const id = document.getElementById('bc-id').textContent;
  navigator.clipboard.writeText(id).then(() => showToast('예약번호가 복사되었습니다 ✓'))
    .catch(() => showToast('예약번호: ' + id));
}

/* ─────────────────────────────────
   VALIDATION HELPERS
───────────────────────────────── */
function showFieldError(inputId, errorId, msg) {
  document.getElementById(inputId)?.classList.add('error');
  const e = document.getElementById(errorId);
  if (e) { e.textContent = msg; e.classList.add('show'); }
}
function clearFieldError(inputId, errorId) {
  document.getElementById(inputId)?.classList.remove('error');
  document.getElementById(errorId)?.classList.remove('show');
}

/* 연락처 자동 하이픈 */
document.getElementById('u-phone')?.addEventListener('input', function() {
  let v = this.value.replace(/\D/g,'');
  if (v.length<=3)      this.value = v;
  else if (v.length<=7) this.value = v.slice(0,3)+'-'+v.slice(3);
  else                  this.value = v.slice(0,3)+'-'+v.slice(3,7)+'-'+v.slice(7,11);
});
