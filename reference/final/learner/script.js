const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn?.addEventListener('click', () => {
  const opened = mobileMenu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(opened));
});
mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded', 'false');
}));

const topbar = document.querySelector('.topbar');
const syncHeaderState = () => topbar?.classList.toggle('scrolled', window.scrollY > 18);
syncHeaderState();
window.addEventListener('scroll', syncHeaderState, { passive: true });

const subject = document.getElementById('subject');
const district = document.getElementById('district');
const schedule = document.getElementById('schedule');
const budget = document.getElementById('budget');
const finderBtn = document.getElementById('finderBtn');
const finderResult = document.getElementById('finderResult');

function showFinderSelection() {
  const budgetLabel = budget.value === 'all' ? 'Không giới hạn học phí' : budget.options[budget.selectedIndex].text;
  finderResult.textContent = `Đã ghi nhận: ${subject.value} · ${district.value} · ${schedule.value} · ${budgetLabel}. Kết quả sẽ được nối với dữ liệu gia sư TutorNearMe khi có hồ sơ hệ thống.`;
}

finderBtn?.addEventListener('click', showFinderSelection);
[subject,district,schedule,budget].forEach(el => el?.addEventListener('change', () => {
  finderResult.textContent = `Đã chọn: ${subject.value} · ${district.value} · ${schedule.value}. Nhấn “Tìm gia sư” để ghi nhận tiêu chí.`;
}));

document.querySelectorAll('.v2-need-card').forEach(btn => btn.addEventListener('click', () => {
  subject.value = btn.dataset.subject;
  showFinderSelection();
  document.getElementById('finder')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}));

document.querySelectorAll('.v2-pin').forEach(pin => pin.addEventListener('click', () => {
  document.querySelectorAll('.v2-pin').forEach(p => p.classList.remove('active'));
  pin.classList.add('active');
  const [name, ...detail] = pin.dataset.map.split(' · ');
  document.getElementById('mapTooltip').innerHTML = `<strong>${name}</strong><span>${detail.join(' · ')}</span>`;
}));

const backdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalEyebrow = document.getElementById('modalEyebrow');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalPrimary = document.getElementById('modalPrimary');
const modalContent = {
  login:['TÀI KHOẢN','Đăng nhập TutorNearMe','Prototype hiện chỉ minh họa. Khi chuyển sang React, nút này sẽ nối tới /login.'],
  register:['BẮT ĐẦU','Tạo tài khoản người học / phụ huynh','Luồng đăng ký thật sẽ nối tới /register và giữ vai trò Learner/Parent.'],
  profile:['HỒ SƠ GIA SƯ','Xem hồ sơ gia sư','Màn chi tiết sẽ phát triển theo reference Tutor Detail + Request và route /tutors/:id.'],
  tutor:['CỔNG GIA SƯ','Khu vực dành cho gia sư','Homepage người học không chứa section tuyển gia sư. Nút header này sẽ dẫn sang luồng Tutor riêng khi Codex triển khai.']
};
let lastTrigger = null;
function openModal(type, trigger) {
  lastTrigger = trigger || null;
  const [eyebrow,title,text] = modalContent[type] || modalContent.profile;
  modalEyebrow.textContent = eyebrow; modalTitle.textContent = title; modalText.textContent = text;
  if (type === 'profile' && trigger?.dataset.name) modalTitle.textContent = trigger.dataset.name;
  backdrop.classList.add('show'); backdrop.setAttribute('aria-hidden','false'); modalClose.focus();
}
function closeModal(){backdrop.classList.remove('show');backdrop.setAttribute('aria-hidden','true');lastTrigger?.focus?.();}
document.querySelectorAll('[data-modal]').forEach(el => el.addEventListener('click', () => openModal(el.dataset.modal, el)));
document.querySelectorAll('.tutor-link-cta, .mobile-menu a[href="#become-tutor"]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); openModal('tutor', el); }));
modalClose?.addEventListener('click', closeModal); modalCancel?.addEventListener('click', closeModal); modalPrimary?.addEventListener('click', closeModal);
backdrop?.addEventListener('click', e => { if(e.target === backdrop) closeModal(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && backdrop.classList.contains('show')) closeModal(); });
