/* Эльбрус — общие скрипты для всех страниц. Подключается в конце <body>. */

/* ---------- Окна «Согласие на обработку ПД» и «Политика конфиденциальности» ---------- */
(function(){
  var popups={};
  [].forEach.call(document.querySelectorAll('.pdc-overlay[data-pdc-hash]'),function(o){popups[o.getAttribute('data-pdc-hash')]=o;});
  var current=null,lastFocus=null;
  function open(o){
    if(current) close();
    lastFocus=document.activeElement;
    current=o;
    o.classList.add('is-open');
    o.setAttribute('aria-hidden','false');
    document.body.classList.add('pdc-lock');
    o.scrollTop=0;
    o.querySelector('.pdc-modal').focus();
  }
  function close(){
    if(!current) return;
    current.classList.remove('is-open');
    current.setAttribute('aria-hidden','true');
    current=null;
    document.body.classList.remove('pdc-lock');
    if(lastFocus&&lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('click',function(e){
    var link=e.target.closest&&e.target.closest('a[href^="#"]');
    if(link&&popups[link.getAttribute('href')]){e.preventDefault();e.stopPropagation();open(popups[link.getAttribute('href')]);return;}
    if(!current) return;
    if(e.target===current||(e.target.closest&&e.target.closest('[data-pdc-close]'))) close();
  },true);
  /* Escape закрывает окно; Tab и Shift+Tab не выходят за пределы открытого окна. */
  document.addEventListener('keydown',function(e){
    if(!current) return;
    if(e.key==='Escape'||e.key==='Esc'){ close(); return; }
    if(e.key!=='Tab') return;
    var modal=current.querySelector('.pdc-modal');
    var f=[].filter.call(modal.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'),function(el){
      return !!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);
    });
    var a=document.activeElement;
    if(!f.length){ e.preventDefault(); modal.focus(); return; }
    var first=f[0], last=f[f.length-1];
    if(e.shiftKey&&(a===first||a===modal||!modal.contains(a))){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey&&(a===last||!modal.contains(a))){ e.preventDefault(); first.focus(); }
  });
  if(popups[location.hash]) open(popups[location.hash]);
})();

/* ---------- Уведомление cookie ---------- */
(function(){
  /* Версия текста уведомления. Если условия изменятся и нужно новое
     подтверждение от всех посетителей — увеличьте номер. */
  var VERSION='1';
  var NAME='elbrus_cookie_consent';
  var MAX_AGE=180*24*60*60; /* 180 дней, в секундах */

  var banner=document.getElementById('ckc-banner');
  var overlay=document.getElementById('ckc-overlay');
  if(!banner||!overlay) return;
  var dialog=overlay.querySelector('.ckc-modal');
  var accepted=false, isOpen=false, lastFocus=null, downOnBackdrop=false;

  /* ---- чтение / запись cookie (любая ошибка браузера не ломает сайт) ---- */
  function readCookie(){
    var raw; try{ raw=document.cookie||''; }catch(e){ return false; }
    var parts=raw.split(';');
    for(var i=0;i<parts.length;i++){
      var p=parts[i].replace(/^\s+/,'');
      if(p.indexOf(NAME+'=')!==0) continue;
      if(isValid(p.slice(NAME.length+1))) return true;
    }
    return false;
  }
  function isValid(value){
    try{
      var f=decodeURIComponent(value).split('|'); /* accepted|<версия>|<дата нажатия ISO> */
      if(f.length!==3||f[0]!=='accepted'||f[1]!==VERSION) return false;
      var t=Date.parse(f[2]); if(isNaN(t)) return false;
      var age=Date.now()-t;
      return age>-864e5 && age<MAX_AGE*1000; /* допуск сутки на расхождение часов */
    }catch(e){ return false; }
  }
  function writeCookie(){
    try{
      var now=new Date();
      var value=encodeURIComponent('accepted|'+VERSION+'|'+now.toISOString());
      var c=NAME+'='+value+'; Max-Age='+MAX_AGE+'; Expires='+new Date(now.getTime()+MAX_AGE*1000).toUTCString()+'; Path=/; SameSite=Lax';
      if(/(^|\.)elbrus-fish\.ru$/i.test(location.hostname)) c+='; Domain=elbrus-fish.ru';
      if(location.protocol==='https:') c+='; Secure';
      document.cookie=c;
    }catch(e){}
  }

  /* ---- маленькое уведомление ---- */
  function showBanner(){ if(!accepted) banner.hidden=false; }
  function hideBanner(){ banner.hidden=true; }

  /* ---- большое окно ---- */
  function isVisible(el){ return !!(el&&el.isConnected!==false&&el.focus&&(el.offsetWidth||el.offsetHeight||el.getClientRects().length)); }
  function pdcOpen(){ return !!document.querySelector('.pdc-overlay.is-open'); }
  function lock(){
    var sbw=window.innerWidth-document.documentElement.clientWidth;
    if(sbw>0) document.body.style.paddingRight=sbw+'px';
    document.body.classList.add('ckc-lock');
  }
  function unlock(){
    document.body.classList.remove('ckc-lock');
    document.body.style.paddingRight='';
  }
  function openModal(trigger){
    if(isOpen) return;
    lastFocus=trigger||document.activeElement;
    isOpen=true;
    hideBanner();
    overlay.hidden=false;
    lock();
    overlay.querySelector('.ckc-modal__body').scrollTop=0;
    dialog.focus();
  }
  function closeModal(){
    if(!isOpen) return;
    isOpen=false;
    overlay.hidden=true;
    unlock();
    showBanner(); /* без сохранения согласия маленькое уведомление возвращается */
    if(isVisible(lastFocus)) lastFocus.focus();
    else if(!banner.hidden) banner.querySelector('[data-ckc-accept]').focus();
    lastFocus=null;
  }

  /* ---- единый обработчик обеих кнопок «Согласен» ---- */
  function accept(){
    writeCookie();
    accepted=true; /* если браузер запретил cookie — уведомление не вернётся хотя бы до перехода на другую страницу */
    var back=lastFocus;
    hideBanner();
    if(isOpen){
      isOpen=false;
      overlay.hidden=true;
      unlock();
      lastFocus=null;
      if(isVisible(back)) back.focus();
    }
  }

  document.addEventListener('click',function(e){
    var t=e.target;
    if(!t||!t.closest) return;
    var opener=t.closest('[data-ckc-open]');
    if(opener){ e.preventDefault(); openModal(opener); return; }
    if(t.closest('[data-ckc-accept]')){ e.preventDefault(); accept(); return; }
    if(isOpen&&t.closest('[data-ckc-close]')){ e.preventDefault(); closeModal(); }
  });
  /* закрытие по клику на затемнённый фон (нажатие и отпускание — на самом фоне) */
  overlay.addEventListener('mousedown',function(e){ downOnBackdrop=(e.target===overlay); });
  overlay.addEventListener('click',function(e){
    if(e.target===overlay&&downOnBackdrop) closeModal();
    downOnBackdrop=false;
  });
  /* Escape и удержание фокуса внутри окна. Слушатель на этапе перехвата:
     если поверх открыта Политика конфиденциальности, Escape закрывает только её. */
  window.addEventListener('keydown',function(e){
    if(!isOpen||pdcOpen()) return;
    if(e.key==='Escape'||e.key==='Esc'){ e.preventDefault(); closeModal(); return; }
    if(e.key!=='Tab') return;
    var f=[].filter.call(dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'),isVisible);
    if(!f.length) return;
    var first=f[0], last=f[f.length-1], a=document.activeElement;
    if(e.shiftKey&&(a===first||a===dialog)){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey&&a===last){ e.preventDefault(); first.focus(); }
    else if(!dialog.contains(a)){ e.preventDefault(); first.focus(); }
  },true);

  /* Проверка записи до первого показа: уведомление скрыто в разметке
     и появляется только если действующего согласия нет — без мигания. */
  accepted=readCookie();
  if(location.hash==='#cookie-policy') openModal(null);
  else showBanner();
  window.addEventListener('hashchange',function(){ if(location.hash==='#cookie-policy') openModal(null); });
})();

/* ---------- Видео первого экрана: пауза, остановка вне экрана, уменьшение движения ---------- */
(function(){
  var v=document.getElementById('heroVideo'), btn=document.getElementById('heroPause');
  if(!v||!btn) return;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var userPaused=reduce, inView=true;
  var icoPause='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';
  var icoPlay='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  function sync(){
    var playing=!v.paused&&!v.ended;
    btn.innerHTML=playing?icoPause:icoPlay;
    btn.setAttribute('aria-label',playing?'Остановить видео':'Воспроизвести видео');
  }
  function tryPlay(){
    if(v.preload!=='auto') v.preload='auto';
    var p=v.play(); if(p&&p.catch) p.catch(function(){ sync(); });
  }
  btn.hidden=false; sync();
  v.addEventListener('play',sync); v.addEventListener('pause',sync);
  btn.addEventListener('click',function(){
    if(v.paused){ userPaused=false; tryPlay(); } else { userPaused=true; v.pause(); }
  });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      inView=es[0].isIntersecting;
      if(!inView){ if(!v.paused) v.pause(); }
      else if(!userPaused&&v.paused) tryPlay();
    },{threshold:0.05}).observe(v);
  }
})();

/* ---------- Отложенная загрузка iframe (карта): при приближении к блоку ---------- */
(function(){
  var els=[].slice.call(document.querySelectorAll('iframe[data-lazy-src]'));
  if(!els.length) return;
  function show(el){ var s=el.getAttribute('data-lazy-src'); if(!s) return; el.removeAttribute('data-lazy-src'); el.src=s; }
  if(!('IntersectionObserver' in window)){ els.forEach(show); return; }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ io.unobserve(e.target); show(e.target); } });
  },{rootMargin:'400px 0px'});
  els.forEach(function(el){ io.observe(el); });
})();

/* ---------- Видео Rutube: плеер загружается только по нажатию на обложку ---------- */
(function(){
  [].forEach.call(document.querySelectorAll('[data-video-embed]'),function(box){
    var btn=box.querySelector('.video-facade');
    if(!btn) return;
    btn.addEventListener('click',function(){
      var f=document.createElement('iframe');
      f.src=box.getAttribute('data-video-embed');
      f.title=box.getAttribute('data-video-title')||'Видео';
      f.setAttribute('allow','clipboard-write; autoplay');
      f.setAttribute('allowfullscreen','');
      box.replaceChild(f,btn);
      f.focus();
    });
  });
})();

/* ---------- Яндекс SmartCaptcha: скрипт подгружается при приближении к форме ---------- */
(function(){
  var boxes=[].slice.call(document.querySelectorAll('.js-captcha[data-sitekey]'));
  if(!boxes.length) return;
  var started=false;
  window.elbrusCaptchaReady=function(){
    boxes.forEach(function(b){
      if(b.getAttribute('data-widget-id')!==null||!window.smartCaptcha) return;
      try{ b.setAttribute('data-widget-id',String(window.smartCaptcha.render(b,{sitekey:b.getAttribute('data-sitekey'),hl:'ru'}))); }catch(e){}
    });
  };
  function load(){
    if(started) return; started=true;
    var s=document.createElement('script');
    s.src='https://smartcaptcha.yandexcloud.net/captcha.js?render=onload&onload=elbrusCaptchaReady';
    s.async=true;
    document.head.appendChild(s);
  }
  boxes.forEach(function(b){ var f=b.closest('form'); if(f) f.addEventListener('focusin',load); });
  if(!('IntersectionObserver' in window)){ load(); return; }
  var io=new IntersectionObserver(function(es){
    if(es.some(function(e){ return e.isIntersecting; })){ io.disconnect(); load(); }
  },{rootMargin:'600px 0px'});
  boxes.forEach(function(b){ io.observe(b.closest('form')||b); });
})();

/* ---------- Формы заявок: отправка без перезагрузки, защита от двойного нажатия ---------- */
(function(){
  [].forEach.call(document.querySelectorAll('form[data-ajax-form]'),function(form){
    var result=form.querySelector('.result'), btn=form.querySelector('[type="submit"]');
    var okText=form.getAttribute('data-ok')||'Заявка успешно отправлена';
    var errText=form.getAttribute('data-err')||'Ошибка отправки заявки, попробуйте еще раз';
    var busy=false;
    function say(t){ if(result) result.textContent=t; }
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(busy) return;
      busy=true;
      if(btn){ btn.disabled=true; btn.setAttribute('aria-busy','true'); }
      say('Отправка...');
      var data=new FormData(form), cap=form.querySelector('.js-captcha');
      var wid=cap?cap.getAttribute('data-widget-id'):null;
      if(!data.get('smart-token')&&wid!==null&&window.smartCaptcha&&window.smartCaptcha.getResponse){
        try{ var t=window.smartCaptcha.getResponse(+wid); if(t) data.set('smart-token',t); }catch(_){}
      }
      fetch(form.getAttribute('action'),{method:'POST',body:data,headers:{'Accept':'application/json'}})
        .then(function(r){ return r.text(); })
        .then(function(txt){
          var res=null; try{ res=JSON.parse(txt); }catch(_){}
          if(res&&res.success){ say(okText); form.reset(); }
          else if(res&&res.errors){ say(Object.keys(res.errors).map(function(k){ return res.errors[k]; }).join(' ')); }
          else say(errText);
        })
        .catch(function(){ say(errText); })
        .then(function(){
          busy=false;
          if(btn){ btn.disabled=false; btn.removeAttribute('aria-busy'); }
          if(wid!==null&&window.smartCaptcha){ try{ window.smartCaptcha.reset(+wid); }catch(_){} }
        });
    });
  });
})();
