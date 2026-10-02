(()=>{
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const page=document.body.dataset.page||''; const role=document.body.dataset.registerRole||'';
  const menuBtn=qs('#menuBtn'), mobileMenu=qs('#mobileMenu'), topbar=qs('.topbar');
  menuBtn?.addEventListener('click',()=>{const opened=mobileMenu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(opened));});
  qsa('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{mobileMenu?.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false');}));
  const syncHeader=()=>topbar?.classList.toggle('scrolled',window.scrollY>18); syncHeader(); addEventListener('scroll',syncHeader,{passive:true});
  qsa('.nav-links a[href^="#"], .mobile-menu a[href^="#"], .brand[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(a.getAttribute('href')==='#become-tutor'){location.href='./register-tutor.html';return;}showToast('Liên kết này sẽ trỏ về section tương ứng của homepage khi tích hợp React.');}));
  qsa('[data-modal="login"]').forEach(btn=>btn.addEventListener('click',()=>{location.href='./login.html';}));
  qsa('[data-modal="register"]').forEach(btn=>btn.addEventListener('click',()=>{location.href='./register-learner.html';}));
  qsa('[data-password-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const input=document.getElementById(btn.dataset.passwordToggle);if(!input)return;const show=input.type==='password';input.type=show?'text':'password';btn.textContent=show?'Ẩn':'Hiện';btn.setAttribute('aria-pressed',String(show));}));
  function setAlert(form,type,msg){const box=qs('.form-alert',form);if(!box)return;box.className=`form-alert ${type} show`;box.textContent=msg;}
  let toastTimer; function showToast(msg){const t=qs('#toast');if(!t)return;clearTimeout(toastTimer);t.textContent=msg;t.classList.add('show');toastTimer=setTimeout(()=>t.classList.remove('show'),3600);}

  const fieldMap={learner:{name:'#learnerName',email:'#learnerEmail',phone:'#learnerPhone'},tutor:{name:'#tutorName',email:'#tutorEmail',phone:'#tutorPhone'}};
  const verified={email:null,phone:null};
  function statusNode(type){return qs(`[data-verified-status="${type}"]`)}
  function markVerified(type,input,source){if(!input)return;verified[type]=input.value.trim();input.dataset.verifiedValue=verified[type];const s=statusNode(type);if(s){s.hidden=false;s.className='verification-status is-verified';s.textContent=`✓ Đã xác minh qua ${source}`;}}
  function syncVerification(type,input){const s=statusNode(type);if(!s||!input.dataset.verifiedValue)return;const same=input.value.trim()===input.dataset.verifiedValue;if(same){s.className='verification-status is-verified';s.textContent='✓ Giá trị đã xác minh';}else{s.className='verification-status is-changed';s.textContent='! Bạn đã thay đổi giá trị — cần xác minh lại';}}
  if(page==='register'&&role){const m=fieldMap[role];['email','phone'].forEach(type=>{const input=qs(m[type]);input?.addEventListener('input',()=>syncVerification(type,input));});}

  const providerData={
    google:{name:'Nguyễn Minh Anh',email:'minhanh.demo@gmail.com',phone:'',label:'Google'},
    facebook:{name:'Minh Anh Nguyễn',email:'',phone:'',label:'Facebook'},
  };
  function hideQuickRegister(){const quick=qs('[data-quick-register]');if(quick)quick.hidden=true;}
  function providerPrefillSummary(info){const fields=[];if(info.name)fields.push('họ tên');if(info.email)fields.push('email');if(info.phone)fields.push('số điện thoại');return fields.length?fields.join(', '):'dữ liệu tài khoản';}
  qsa('[data-provider]').forEach(btn=>btn.addEventListener('click',()=>{
    const provider=btn.dataset.provider, info=providerData[provider]; btn.disabled=true; const original=btn.innerHTML;
    btn.querySelector('span:last-child').textContent=`Đang kết nối ${info.label}...`;
    setTimeout(()=>{
      btn.disabled=false;btn.innerHTML=original;
      if(page==='register'&&role){
        const m=fieldMap[role],n=qs(m.name),e=qs(m.email),p=qs(m.phone);
        if(n&&info.name)n.value=info.name;
        if(e&&info.email){e.value=info.email;markVerified('email',e,info.label);}
        if(p&&info.phone){p.value=info.phone;markVerified('phone',p,info.label);}
        hideQuickRegister();
        const st=qs('[data-provider-state]');
        if(st){st.hidden=false;st.innerHTML=`<b>Đã kết nối ${info.label}.</b> Đã pre-fill ${providerPrefillSummary(info)} mà provider cung cấp. Các trường còn thiếu để bạn tự nhập; mật khẩu TutorNearMe vẫn bắt buộc.`;}
        qs(role==='learner'?'#learnerUsername':'#tutorUsername')?.focus();
        showToast(`Đã kết nối ${info.label} và pre-fill dữ liệu provider hiện có.`);
      }else{
        const form=qs('form[data-demo-form="login"]');
        setAlert(form,'success',`Đã mô phỏng xác thực ${info.label}. Với backend thật: account tồn tại → đăng nhập và redirect theo quyền; account mới → đi tới form đăng ký phù hợp.`);
      }
    },360);
  }));

  const modal=qs('#phoneAuthModal'), phoneInput=qs('#phoneAuthNumber'), phoneMsg=qs('[data-phone-message]'), otpMsg=qs('[data-otp-message]'), numberStep=qs('[data-phone-step="number"]'), otpStep=qs('[data-phone-step="otp"]'), otpInputs=qsa('[data-otp-index]'); let resendTimer=null,lastPhone='';
  const digits=s=>String(s||'').replace(/\D/g,'');
  function normalizePhone(raw){let d=digits(raw);if(d.startsWith('84'))d='0'+d.slice(2);if(!d.startsWith('0'))d='0'+d;return d.slice(0,11)}
  function prettyPhone(d){const p=normalizePhone(d);return p.replace(/(\d{4})(\d{3})(\d{0,4})/,'$1 $2 $3').trim()}
  function resetModal(){numberStep.hidden=false;otpStep.hidden=true;phoneMsg.textContent='';phoneMsg.className='modal-message';otpMsg.textContent='';otpMsg.className='modal-message';otpInputs.forEach(i=>i.value='');clearInterval(resendTimer);}
  function openModal(){resetModal();modal.hidden=false;modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');setTimeout(()=>phoneInput?.focus(),30)}
  function closeModal(){modal.hidden=true;modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');clearInterval(resendTimer)}
  qsa('[data-phone-auth]').forEach(b=>b.addEventListener('click',openModal)); qsa('[data-phone-modal-close]').forEach(b=>b.addEventListener('click',closeModal)); addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal?.hidden)closeModal();});
  function startCountdown(){const btn=qs('[data-phone-resend]'),count=qs('[data-resend-count]');let n=30;btn.disabled=true;count.textContent=n;clearInterval(resendTimer);resendTimer=setInterval(()=>{n--;count.textContent=n;if(n<=0){clearInterval(resendTimer);btn.disabled=false;btn.textContent='Gửi lại mã';}},1000)}
  qs('[data-phone-next]')?.addEventListener('click',()=>{const d=normalizePhone(phoneInput.value);phoneMsg.className='modal-message';if(d.length<10||d.length>11){phoneMsg.textContent='Vui lòng nhập số điện thoại Việt Nam hợp lệ.';phoneMsg.classList.add('is-error');phoneInput.focus();return;}lastPhone=d;numberStep.hidden=true;otpStep.hidden=false;qs('[data-phone-preview]').textContent=prettyPhone(d);startCountdown();setTimeout(()=>otpInputs[0]?.focus(),30)});
  otpInputs.forEach((input,idx)=>{input.addEventListener('input',()=>{input.value=digits(input.value).slice(-1);if(input.value&&idx<5)otpInputs[idx+1].focus();});input.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!input.value&&idx>0)otpInputs[idx-1].focus();});input.addEventListener('paste',e=>{const d=digits(e.clipboardData.getData('text')).slice(0,6);if(d.length){e.preventDefault();otpInputs.forEach((x,i)=>x.value=d[i]||'');otpInputs[Math.min(d.length,6)-1].focus();}})});
  qs('[data-phone-change]')?.addEventListener('click',()=>{numberStep.hidden=false;otpStep.hidden=true;otpInputs.forEach(i=>i.value='');phoneInput.focus();clearInterval(resendTimer)});
  qs('[data-phone-resend]')?.addEventListener('click',e=>{if(e.currentTarget.disabled)return;showToast('Đã mô phỏng gửi lại OTP. Mã demo vẫn là 123456.');e.currentTarget.innerHTML='Gửi lại mã sau <span data-resend-count>30</span>s';startCountdown();});
  qs('[data-phone-verify]')?.addEventListener('click',()=>{const code=otpInputs.map(i=>i.value).join('');otpMsg.className='modal-message';if(code!=='123456'){otpMsg.textContent='Mã OTP chưa đúng. Với prototype QA, hãy dùng 123456.';otpMsg.classList.add('is-error');otpInputs[0]?.focus();return;}otpMsg.textContent='Xác minh thành công.';otpMsg.classList.add('is-success');if(page==='register'&&role){const input=qs(fieldMap[role].phone);input.value=lastPhone;markVerified('phone',input,'OTP');hideQuickRegister();const st=qs('[data-provider-state]');if(st){st.hidden=false;st.innerHTML='<b>Số điện thoại đã được xác minh bằng OTP.</b> Form đã pre-fill số điện thoại; bạn bổ sung các thông tin còn thiếu và vẫn phải tạo mật khẩu.';}setTimeout(()=>{closeModal();input.focus();showToast('SĐT đã được pre-fill vào form và đánh dấu đã xác minh.')},450);}else{const form=qs('form[data-demo-form="login"]');setTimeout(()=>{closeModal();setAlert(form,'success','SĐT đã được xác minh demo. Backend thật sẽ kiểm tra account, đọc role và redirect; nếu chưa có account sẽ đưa tới đăng ký.');},450);}});

  const otherToggle=qs('[data-other-subject-toggle]'),otherField=qs('#otherSubjectField'),otherInput=qs('#otherSubject');function syncOther(){if(!otherToggle)return;otherField.hidden=!otherToggle.checked;otherInput.required=otherToggle.checked;if(!otherToggle.checked)otherInput.value='';}otherToggle?.addEventListener('change',syncOther);syncOther();
  qsa('form[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const req=qsa('[required]',form);const invalid=req.find(el=>el.type==='checkbox'?!el.checked:!String(el.value).trim());if(invalid){setAlert(form,'error','Vui lòng điền đầy đủ các thông tin bắt buộc.');invalid.focus();return;}const username=qs('input[name="username"]',form);if(username&&!/^[A-Za-z0-9._-]{4,30}$/.test(username.value)){setAlert(form,'error','Username cần 4–30 ký tự và chỉ dùng chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.');username.focus();return;}const email=qs('input[name="email"]',form);if(email&&!email.checkValidity()){setAlert(form,'error','Email chưa đúng định dạng.');email.focus();return;}const phone=qs('input[name="phone"]',form);if(phone){const d=normalizePhone(phone.value);if(d.length<10||d.length>11){setAlert(form,'error','Số điện thoại chưa hợp lệ.');phone.focus();return;}}if(form.dataset.demoForm==='tutor'){if(!qs('input[name="subjects"]:checked',form)){setAlert(form,'error','Vui lòng chọn ít nhất một môn có thể dạy.');qs('input[name="subjects"]',form)?.focus();return;}if(!qs('input[name="availability"]:checked',form)){setAlert(form,'error','Vui lòng chọn ít nhất một khung giờ thường rảnh.');qs('input[name="availability"]',form)?.focus();return;}const fee=qs('#tutorFee');if(Number(fee.value)<10000){setAlert(form,'error','Mức phí cần lớn hơn hoặc bằng 10.000đ / buổi.');fee.focus();return;}}const pw=qs('input[name="password"]',form),cf=qs('input[name="confirmPassword"]',form);if(pw&&pw.value.length<8){setAlert(form,'error','Mật khẩu cần có ít nhất 8 ký tự.');pw.focus();return;}if(pw&&cf&&pw.value!==cf.value){setAlert(form,'error','Mật khẩu xác nhận chưa khớp.');cf.focus();return;}const msg=form.dataset.demoForm==='login'?'Đăng nhập demo hợp lệ. Backend thật sẽ tự xác định role và điều hướng.':form.dataset.demoForm==='tutor'?'Form đăng ký gia sư hợp lệ. Có thể gửi payload tới backend.':'Form đăng ký người học hợp lệ. Có thể gửi payload tới backend.';setAlert(form,'success',msg);}));
})();
