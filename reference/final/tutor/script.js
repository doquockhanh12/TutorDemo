const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const topbar = $('.topbar');
const syncHeaderState = () => topbar?.classList.toggle('scrolled', window.scrollY > 18);
syncHeaderState();
window.addEventListener('scroll', syncHeaderState, { passive: true });

const menuBtn = $('#menuBtn');
const mobileMenu = $('#mobileMenu');
menuBtn?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? '×' : '☰';
});
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuBtn.setAttribute('aria-expanded','false');
  menuBtn.textContent='☰';
}));

const cards = $$('.request-card');
const subject = $('#teachSubject');
const area = $('#teachArea');
const time = $('#teachTime');
const fee = $('#teachFee');
const count = $('#requestCount');
const status = $('#setupStatus');
const empty = $('#emptyState');
const sort = $('#sortRequests');
const grid = $('#requestGrid');

function matches(card){
  const s = subject.value, a = area.value, t = time.value, f = fee.value;
  return (s === 'all' || card.dataset.subject === s)
    && (a === 'all' || card.dataset.area === a)
    && (t === 'all' || card.dataset.time === t)
    && (f === 'all' || Number(card.dataset.fee) >= Number(f));
}
function applyFilters(scroll=false){
  let visible = 0;
  cards.forEach(card => { const ok = matches(card); card.hidden = !ok; if(ok) visible++; });
  count.textContent = `${visible} yêu cầu phù hợp`;
  empty.hidden = visible !== 0;
  const picked = [subject.value !== 'all' ? subject.value : null, area.value !== 'all' ? area.value : null, time.value !== 'all' ? time.value : null, fee.value !== 'all' ? `từ ${Number(fee.value).toLocaleString('vi-VN')}đ` : null].filter(Boolean);
  status.textContent = picked.length ? `Đang lọc theo: ${picked.join(' · ')}.` : 'Chọn tiêu chí để xem các yêu cầu học phù hợp bên dưới.';
  if(scroll) document.querySelector('#opportunities')?.scrollIntoView({behavior:'smooth',block:'start'});
}
$('#matchBtn')?.addEventListener('click', () => applyFilters(true));
[subject,area,time,fee].forEach(el => el?.addEventListener('change', () => applyFilters(false)));
$('#resetFilters')?.addEventListener('click', () => { subject.value=area.value=time.value=fee.value='all'; applyFilters(false); });

function sortCards(){
  const mode = sort.value;
  const ordered = [...cards].sort((a,b) => {
    if(mode === 'fee') return Number(b.dataset.fee)-Number(a.dataset.fee);
    if(mode === 'recent') return Number(b.dataset.recent)-Number(a.dataset.recent);
    return Number(b.dataset.fit)-Number(a.dataset.fit);
  });
  ordered.forEach(c => grid.appendChild(c));
}
sort?.addEventListener('change',sortCards);

$$('.slot').forEach(btn => btn.addEventListener('click', () => btn.classList.toggle('active')));

const feeRange=$('#feeRange'), sessionRange=$('#sessionRange');
function updateEstimate(){
  const f=Number(feeRange.value), s=Number(sessionRange.value);
  $('#feeValue').textContent=`${f.toLocaleString('vi-VN')}đ`;
  $('#sessionValue').textContent=`${s} buổi`;
  $('#incomeValue').textContent=`${(f*s*4).toLocaleString('vi-VN')}đ`;
  $('#incomeFormula').textContent=`${f.toLocaleString('vi-VN')}đ × ${s} buổi × 4 tuần`;
}
feeRange?.addEventListener('input',updateEstimate);sessionRange?.addEventListener('input',updateEstimate);updateEstimate();

const backdrop=$('#modalBackdrop'), title=$('#modalTitle'), text=$('#modalText'), eyebrow=$('#modalEyebrow');
let lastFocus=null;
function openModal(type, detail=''){
  lastFocus=document.activeElement;
  const content = type === 'login'
    ? ['ĐĂNG NHẬP GIA SƯ','Chào mừng bạn quay lại','Bản prototype sẽ nối nút này với route đăng nhập của Tutor workspace.']
    : type === 'request'
      ? ['CHI TIẾT YÊU CẦU',detail || 'Yêu cầu học','Ở sản phẩm hoàn chỉnh, đây sẽ mở màn chi tiết để xem thông tin người học, lịch, khu vực và quyết định nhận hoặc từ chối.']
      : ['TẠO HỒ SƠ GIA SƯ','Bắt đầu từ thông tin của bạn','Luồng tiếp theo sẽ thu thập môn dạy, mức phí, khu vực, lịch rảnh và phần giới thiệu hồ sơ.'];
  eyebrow.textContent=content[0]; title.textContent=content[1]; text.textContent=content[2];
  backdrop.classList.add('show');backdrop.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');$('#modalClose').focus();
}
function closeModal(){backdrop.classList.remove('show');backdrop.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');lastFocus?.focus?.();}
$$('[data-modal]').forEach(el=>el.addEventListener('click',()=>openModal(el.dataset.modal)));
$$('[data-request]').forEach(el=>el.addEventListener('click',()=>openModal('request',el.dataset.request)));
$('#modalClose')?.addEventListener('click',closeModal);$('#modalCancel')?.addEventListener('click',closeModal);$('#modalContinue')?.addEventListener('click',closeModal);
backdrop?.addEventListener('mousedown',e=>{if(e.target===backdrop)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&backdrop.classList.contains('show'))closeModal();});

document.querySelector('a[href="#learner"]')?.addEventListener('click', e => { e.preventDefault(); alert('Prototype: liên kết này sẽ dẫn về homepage dành cho Người học / Phụ huynh.'); });
