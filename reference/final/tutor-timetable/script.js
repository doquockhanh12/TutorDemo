const START = 360;   // 06:00
const END = 1440;    // 24:00
const MAX_START = 1320; // 22:00 — không cho bắt đầu từ 22:05 trở đi
const COLLAPSED_HOUR = 72;
const EXPANDED_HOUR = 240; // 12 * 20px => 5-minute precision is easy to see
const EXPANDED_SNAP = 5;
const COLLAPSED_SNAP = 10;

const cols = [...document.querySelectorAll('.day-col')];
const axis = document.getElementById('timeAxis');
const calendar = document.getElementById('calendar');
const calendarScroll = document.getElementById('calendarScroll');
const duration = document.getElementById('duration');
const customWrap = document.getElementById('customWrap');
const customDuration = document.getElementById('customDuration');
const durationLabel = document.getElementById('durationLabel');
const statusTitle = document.getElementById('statusTitle');
const statusText = document.getElementById('statusText');
const statusDot = document.getElementById('statusDot');
const dialog = document.getElementById('lessonDialog');
const quickAdd = document.getElementById('quickAdd');
const quickTime = document.getElementById('quickTime');
const quickSummary = document.getElementById('quickSummary');

let expandedHour = null; // hour index from START: 0 = 06:00-07:00
let availability = [
  {id:'a1', day:0, start:370, end:460, saved:true},
  {id:'a2', day:3, start:1080, end:1170, saved:true}
];
let lessons = [
  {id:'lesson-1', day:2, start:540, end:630, subject:'Toán', learner:'Minh Anh', format:'Tại nhà', location:'Bình Thạnh, TP.HCM', status:'confirmed'}
];
let drag = null;
let preview = null;
let quickDraft = null;

function hourCount(){ return (END - START) / 60; }
function hourHeight(index){ return index === expandedHour ? EXPANDED_HOUR : COLLAPSED_HOUR; }
function totalHeight(){
  let total = 0;
  for(let i=0;i<hourCount();i++) total += hourHeight(i);
  return total;
}
function setTimelineHeight(){
  const px = `${totalHeight()}px`;
  document.documentElement.style.setProperty('--timeline', px);
  axis.style.height = px;
  cols.forEach(c => c.style.height = px);
}
function hourIndexForMinute(minute){
  return Math.max(0, Math.min(hourCount()-1, Math.floor((minute - START) / 60)));
}
function y(minute){
  if(minute <= START) return 0;
  if(minute >= END) return totalHeight();
  const index = hourIndexForMinute(minute);
  let top = 0;
  for(let i=0;i<index;i++) top += hourHeight(i);
  const within = (minute - (START + index*60)) / 60;
  return top + within * hourHeight(index);
}
function minuteFromY(px){
  let cursor = 0;
  for(let i=0;i<hourCount();i++){
    const hh = hourHeight(i);
    if(px <= cursor + hh){
      const ratio = Math.max(0, Math.min(1, (px - cursor) / hh));
      return START + i*60 + ratio*60;
    }
    cursor += hh;
  }
  return END;
}
function blockHeight(start,end){ return Math.max(28, y(end) - y(start)); }
function snapMinutes(value){
  const idx = hourIndexForMinute(value);
  const step = idx === expandedHour ? EXPANDED_SNAP : COLLAPSED_SNAP;
  return Math.round(value / step) * step;
}
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function tm(n){ return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; }
function dur(){ return duration.value==='custom' ? clamp(Number(customDuration.value)||75,15,240) : Number(duration.value); }
function setDirty(title,text){ statusTitle.textContent=title;statusText.textContent=text;statusDot.style.background='#f0bd3c'; }
function setSaved(){ statusTitle.textContent='Đã lưu lịch';statusText.textContent='Các khung rảnh hiện tại đã được ghi nhận trong prototype.';statusDot.style.background='#15936a'; }
function durationUI(){ customWrap.classList.toggle('hidden',duration.value!=='custom');durationLabel.textContent=`${dur()} phút / buổi`; }
function dayLabel(day){ return ['T2','T3','T4','T5','T6','T7','CN'][day]; }

function latestAllowedStart(durationMinutes){
  return Math.min(MAX_START, END-durationMinutes);
}
function overlaps(aStart,aEnd,bStart,bEnd){
  return aStart < bEnd && aEnd > bStart;
}
function hasConflict(day,start,end,excludeAvailabilityId=null){
  const availabilityConflict = availability.some(item =>
    item.day===day &&
    item.id!==excludeAvailabilityId &&
    overlaps(start,end,item.start,item.end)
  );
  const lessonConflict = lessons.some(item =>
    item.day===day &&
    overlaps(start,end,item.start,item.end)
  );
  return availabilityConflict || lessonConflict;
}
function showConflictStatus(day,start,end){
  statusTitle.textContent='Không thể đặt lịch bị trùng';
  statusText.textContent=`${dayLabel(day)} · ${tm(start)}–${tm(end)} đang đè lên một lịch khác. Vị trí mới không được lưu.`;
  statusDot.style.background='#dc3545';
}
function flashConflict(day,start,end){
  const col=cols[day];
  if(!col)return;
  const el=document.createElement('div');
  el.className='block conflict';
  el.style.top=`${y(start)}px`;
  el.style.height=`${blockHeight(start,end)}px`;
  el.innerHTML=`<span class="start">${tm(start)}</span><strong class="title">TRÙNG LỊCH</strong><span class="end">${tm(end)}</span>`;
  col.appendChild(el);
  setTimeout(()=>el.remove(),1200);
}
function firstFreeStart(day,durationMinutes,preferredStart=null){
  const minStart=START;
  const maxStart=latestAllowedStart(durationMinutes);
  if(preferredStart!==null){
    const p=clamp(snapMinutes(preferredStart),minStart,maxStart);
    if(!hasConflict(day,p,p+durationMinutes)) return p;
  }
  for(let s=Math.max(minStart,8*60);s<=maxStart;s+=5){
    if(!hasConflict(day,s,s+durationMinutes)) return s;
  }
  for(let s=minStart;s<Math.max(minStart,8*60);s+=5){
    if(!hasConflict(day,s,s+durationMinutes)) return s;
  }
  return null;
}

function toggleHour(index){
  hideQuickAdd();
  expandedHour = expandedHour === index ? null : index;
  setTimelineHeight();
  renderAxis();
  render();
  if(expandedHour !== null){
    const start = START + expandedHour*60;
    statusTitle.textContent = `${tm(start)}–${tm(start+60)} đang mở chi tiết`;
    statusText.textContent = 'Mỗi vạch là 5 phút. Click vào cột ngày để thêm nhanh hoặc kéo một khung rảnh hiện có tới đúng mốc.';
    statusDot.style.background = '#275fe5';
  } else {
    statusTitle.textContent = 'Đã thu gọn timeline';
    statusText.textContent = 'Bấm + ở mốc giờ khác khi cần chỉnh chính xác.';
    statusDot.style.background = '#a8b0bf';
  }
}

function renderAxis(){
  axis.innerHTML='';
  let top = 0;
  for(let i=0;i<hourCount();i++){
    const start = START + i*60;
    const band = document.createElement('div');
    band.className = 'hour-axis-band';
    band.style.top = `${top}px`;
    band.style.height = `${hourHeight(i)}px`;

    const main = document.createElement('div');
    main.className = 'hour-axis-main';
    main.innerHTML = `<span>${tm(start)}</span><button class="hour-toggle" type="button" title="${expandedHour===i?'Thu gọn':'Mở chi tiết 5 phút'}">${expandedHour===i?'−':'+'}</button>`;
    main.querySelector('button').onclick = () => toggleHour(i);
    band.appendChild(main);

    if(expandedHour===i){
      for(let m=5;m<60;m+=5){
        const label=document.createElement('span');
        label.className='minor-axis-label';
        label.style.top=`${(m/60)*EXPANDED_HOUR}px`;
        label.textContent=tm(start+m);
        band.appendChild(label);
      }
    }
    axis.appendChild(band);
    top += hourHeight(i);
  }
  const end=document.createElement('span');
  end.className='end-axis-label';
  end.style.top=`${totalHeight()}px`;
  end.textContent=tm(END);
  axis.appendChild(end);
}

function renderGrid(col){
  const frag=document.createDocumentFragment();
  if(expandedHour!==null){
    const zone=document.createElement('div');
    zone.className='expanded-zone';
    const zoneStart=START+expandedHour*60;
    zone.style.top=`${y(zoneStart)}px`;
    zone.style.height=`${hourHeight(expandedHour)}px`;
    frag.appendChild(zone);
  }
  for(let i=0;i<hourCount();i++){
    const start=START+i*60;
    const major=document.createElement('div');
    major.className='grid-major';
    major.style.top=`${y(start)}px`;
    frag.appendChild(major);
    if(expandedHour===i){
      for(let m=5;m<60;m+=5){
        const minor=document.createElement('div');
        minor.className='grid-minor';
        minor.style.top=`${y(start+m)}px`;
        frag.appendChild(minor);
      }
    }
  }
  const end=document.createElement('div');
  end.className='grid-major';
  end.style.top=`${totalHeight()}px`;
  frag.appendChild(end);
  col.appendChild(frag);
}

function block(item,type){
  const el=document.createElement('div');
  el.className=`block ${type}${type==='available'&&!item.saved?' draft':''}${type==='lesson'&&item.status==='completed'?' completed':''}`;
  el.dataset.id=item.id;
  el.style.top=`${y(item.start)}px`;
  el.style.height=`${blockHeight(item.start,item.end)}px`;
  el.innerHTML=`<span class="start">${tm(item.start)}</span><strong class="title">${type==='available'?'RẢNH':item.subject}</strong><span class="end">${tm(item.end)}</span>${type==='available'?'<button class="remove" aria-label="Xóa khung rảnh">×</button>':''}`;
  if(type==='available'){
    el.querySelector('.remove').onclick=e=>{e.stopPropagation();availability=availability.filter(x=>x.id!==item.id);setDirty('Đã xóa khung rảnh',`${tm(item.start)}–${tm(item.end)} đã bị xóa khỏi lịch nháp.`);render()};
    el.onpointerdown=startDrag;
  } else el.onclick=()=>openLesson(item);
  return el;
}

function render(){
  setTimelineHeight();
  cols.forEach(c=>{ c.innerHTML=''; renderGrid(c); });
  availability.forEach(a=>cols[a.day]?.appendChild(block(a,'available')));
  lessons.forEach(l=>cols[l.day]?.appendChild(block(l,'lesson')));
}

function add(day,start,source='quick'){
  const d=dur();
  const s=snapMinutes(start);
  const latest=latestAllowedStart(d);

  if(s > latest){
    statusTitle.textContent='Không thể bắt đầu sau 22:00';
    statusText.textContent=`Giờ bắt đầu tối đa là ${tm(MAX_START)}. Khung ${d} phút cũng phải kết thúc không muộn hơn ${tm(END)}.`;
    statusDot.style.background='#dc3545';
    return false;
  }

  const end=s+d;
  if(hasConflict(day,s,end)){
    showConflictStatus(day,s,end);
    flashConflict(day,s,end);
    return false;
  }
  availability.push({id:`a-${Date.now()}-${Math.random().toString(16).slice(2)}`,day,start:s,end,saved:false});
  setDirty(source==='quick'?'Đã thêm nhanh lịch rảnh':'Đã tạo lịch rảnh',`${dayLabel(day)} · ${tm(s)}–${tm(end)} · ${d} phút.`);
  render();
  return true;
}


function showQuickAdd(day,minute,clientX,clientY){
  if(expandedHour===null) return;
  const expandedStart=START+expandedHour*60;
  const expandedEnd=expandedStart+60;
  let start=Math.round(minute/5)*5;
  start=clamp(start,expandedStart,expandedEnd-5);
  const latest=latestAllowedStart(dur());
  if(start > latest){
    hideQuickAdd();
    statusTitle.textContent='Không thể thêm lịch tại mốc này';
    statusText.textContent=`Giờ bắt đầu tối đa là ${tm(MAX_START)}. Mốc ${tm(start)} không được phép đặt lịch mới.`;
    statusDot.style.background='#dc3545';
    return;
  }
  quickDraft={day,start};
  quickTime.textContent=`${dayLabel(day)} · ${tm(start)}`;
  quickSummary.textContent=`${dur()} phút · kết thúc ${tm(start+dur())}`;
  quickAdd.style.left=`${Math.min(window.innerWidth-260,clientX+12)}px`;
  quickAdd.style.top=`${Math.min(window.innerHeight-150,clientY+12)}px`;
  quickAdd.classList.remove('hidden');
}
function hideQuickAdd(){ quickDraft=null;quickAdd.classList.add('hidden'); }

document.getElementById('quickCancel').onclick=hideQuickAdd;
document.getElementById('quickConfirm').onclick=()=>{ if(quickDraft && add(quickDraft.day,quickDraft.start,'quick')) hideQuickAdd(); };

document.querySelectorAll('.day-add').forEach(btn=>{
  btn.addEventListener('click',()=>{
    hideQuickAdd();
    const day=Number(btn.dataset.day);
    const d=dur();
    const preferred = expandedHour!==null ? START+expandedHour*60 : 8*60;
    const start=firstFreeStart(day,d,preferred);
    if(start===null){
      statusTitle.textContent='Không còn khoảng trống phù hợp';
      statusText.textContent=`${dayLabel(day)} không còn khoảng trống ${d} phút phù hợp trong timeline 06:00–24:00 (giờ bắt đầu tối đa 22:00).`;
      statusDot.style.background='#dc3545';
      return;
    }
    add(day,start,'day-plus');
  });
});

document.addEventListener('pointerdown',e=>{
  if(!quickAdd.classList.contains('hidden') && !quickAdd.contains(e.target) && !e.target.closest('.day-col')) hideQuickAdd();
});

cols.forEach((c,day)=>{
  c.addEventListener('click',e=>{
    if(e.target.closest('.block') || expandedHour===null) return;
    const rect=c.getBoundingClientRect();
    const minute=minuteFromY(e.clientY-rect.top);
    const idx=hourIndexForMinute(minute);
    if(idx!==expandedHour) return;
    showQuickAdd(day,minute,e.clientX,e.clientY);
  });
});

function startDrag(e){
  if(e.target.closest('.remove'))return;
  const el=e.currentTarget,item=availability.find(x=>x.id===el.dataset.id);if(!item)return;
  e.preventDefault();
  el.classList.add('dragging');
  drag={id:item.id,duration:item.end-item.start,offset:e.clientY-el.getBoundingClientRect().top,sourceEl:el,originalDay:item.day,originalStart:item.start,originalEnd:item.end,valid:true};
  preview=document.createElement('div');preview.className='preview';preview.style.height=`${blockHeight(item.start,item.end)}px`;
  document.addEventListener('pointermove',move);
  document.addEventListener('pointerup',endDrag,{once:true});
}
function dayAt(x){return cols.findIndex(c=>{const r=c.getBoundingClientRect();return x>=r.left&&x<=r.right})}
function move(e){
  if(!drag)return;
  const day=dayAt(e.clientX);if(day<0)return;
  const c=cols[day],r=c.getBoundingClientRect();
  const rawStart=snapMinutes(minuteFromY(e.clientY-r.top-drag.offset));
  const latest=latestAllowedStart(drag.duration);
  const s=clamp(rawStart,START,latest);
  const end=s+drag.duration;
  const beyondStartLimit=rawStart>latest;
  const conflict=beyondStartLimit || hasConflict(day,s,end,drag.id);
  if(preview.parentElement!==c)c.appendChild(preview);
  preview.style.top=`${y(s)}px`;
  preview.style.height=`${blockHeight(s,end)}px`;
  preview.classList.toggle('invalid',conflict);
  drag.day=day;
  drag.start=s;
  drag.rawStart=rawStart;
  drag.valid=!conflict;
}
function endDrag(){
  if(!drag)return;
  drag.sourceEl?.classList.remove('dragging');
  const item=availability.find(x=>x.id===drag.id);
  if(item&&Number.isInteger(drag.day)){
    const end=drag.start+drag.duration;
    const conflict=hasConflict(drag.day,drag.start,end,drag.id);
    if(drag.rawStart>latestAllowedStart(drag.duration)){
      statusTitle.textContent='Không thể bắt đầu sau 22:00';
      statusText.textContent=`Giờ bắt đầu mới tối đa là ${tm(MAX_START)}; block cũ được giữ nguyên vị trí.`;
      statusDot.style.background='#dc3545';
    }else if(conflict || drag.valid===false){
      showConflictStatus(drag.day,drag.start,end);
      flashConflict(drag.day,drag.start,end);
    }else{
      item.day=drag.day;
      item.start=drag.start;
      item.end=end;
      item.saved=false;
      setDirty('Đã di chuyển khung rảnh',`${dayLabel(item.day)} · ${tm(item.start)}–${tm(item.end)}`);
    }
  }
  preview?.remove();
  preview=null;
  drag=null;
  document.removeEventListener('pointermove',move);
  render();
}

function openLesson(l){
  lessonSubject.textContent=l.subject;lessonLearner.textContent=l.learner;
  lessonDay.textContent=['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'][l.day];
  lessonTime.textContent=`${tm(l.start)}–${tm(l.end)}`;lessonFormat.textContent=l.format;lessonLocation.textContent=l.location;
  dialog.dataset.id=l.id;dialog.showModal();
}
closeDialog.onclick=()=>dialog.close();
fakeDetail.onclick=()=>alert(`Prototype: sẽ mở /tutor/lessons/${dialog.dataset.id}`);
complete.onclick=()=>{const l=lessons.find(x=>x.id===dialog.dataset.id);if(l)l.status='completed';dialog.close();statusTitle.textContent='Buổi học đã hoàn tất';statusText.textContent=`${l.subject} · ${tm(l.start)}–${tm(l.end)}`;statusDot.style.background='#275fe5';render()};

duration.onchange=()=>{durationUI();hideQuickAdd()};customDuration.oninput=()=>{durationUI();hideQuickAdd()};
save.onclick=()=>{availability.forEach(a=>a.saved=true);setSaved();render()};
reset.onclick=()=>{
  expandedHour=null;
  availability=[{id:'a1',day:0,start:370,end:460,saved:true},{id:'a2',day:3,start:1080,end:1170,saved:true}];
  lessons=[{id:'lesson-1',day:2,start:540,end:630,subject:'Toán',learner:'Minh Anh',format:'Tại nhà',location:'Bình Thạnh, TP.HCM',status:'confirmed'}];
  duration.value='90';durationUI();hideQuickAdd();setTimelineHeight();renderAxis();render();
  statusTitle.textContent='Đã khôi phục demo';statusText.textContent='Bấm + cạnh một mốc giờ để thử lại.';statusDot.style.background='#a8b0bf';
};

setTimelineHeight();durationUI();renderAxis();render();
