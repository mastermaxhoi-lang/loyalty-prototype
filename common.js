/* ==========================================================================
   ОБЩИЕ СКРИПТЫ · единый прототип Лояльности
   Все хелперы устойчивы к отсутствию элементов (null-guard), поэтому один
   файл обслуживает все 3 страницы. Данные, специфичные для страницы
   (выгода по нишам, офферы), задаются в inline-скрипте самой страницы.
   ========================================================================== */
(function(){
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- reveal on scroll ---- */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.1});
  function observeReveals(root){ (root||document).querySelectorAll('.reveal:not(.in)').forEach(function(el){ io.observe(el); }); }
  window.observeReveals = observeReveals;
  observeReveals();

  /* ---- бургер-меню ---- */
  window.menu = function(){
    var l = document.querySelector('.nav-links'); if(!l) return;
    var open = l.style.display === 'flex';
    l.style.cssText = open ? '' : 'display:flex;position:absolute;top:64px;left:0;right:0;flex-direction:column;background:#000;padding:18px var(--pad);gap:16px;border-bottom:1px solid #1c1c1c';
  };

  /* ---- модалка-заявка (по CTA в шапке) ---- */
  window.openModal = function(){ var m=document.getElementById('modal'); if(m){ m.classList.add('show'); var f=m.querySelector('input'); if(f) setTimeout(function(){f.focus();},80); } };
  window.closeModal = function(){ var m=document.getElementById('modal'); if(m) m.classList.remove('show'); };
  document.addEventListener('click', function(e){ if(e.target && e.target.id==='modal') closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });

  /* ---- прокрутка к анкете на странице (если есть), иначе модалка ---- */
  window.goForm = function(){
    var start = document.getElementById('start');
    if(start){ start.scrollIntoView({behavior:'smooth'}); var n=document.getElementById('f-name'); if(n) setTimeout(function(){n.focus();},550); }
    else openModal();
  };
  window.to = function(sel){ var el=document.querySelector(sel); if(el) el.scrollIntoView({behavior:'smooth'}); };

  /* ---- демо-отправка формы с лёгкой валидацией + согласие на ПД ---- */
  window.submitF = function(formId, okId){
    var form = document.getElementById(formId||'form-main');
    var ok = document.getElementById(okId||'ok');
    var bad = false;
    if(form){
      form.querySelectorAll('input[required], input[data-req]').forEach(function(inp){
        if(!inp.value.trim()){ inp.classList.add('bad'); bad=true; } else inp.classList.remove('bad');
      });
      var consent = form.querySelector('.consent input');
      if(consent){
        var row = consent.closest('.consent');
        if(!consent.checked){ row.classList.add('bad'); bad=true; } else row.classList.remove('bad');
      }
    }
    if(bad) return false;
    if(ok) ok.classList.add('show');
    return false;
  };

  /* ---- инициализация: липкая CTA + галка согласия во все формы ---- */
  document.addEventListener('DOMContentLoaded', function(){
    // липкая плавающая CTA-кнопка (все страницы) — показывается после прокрутки
    if(!document.querySelector('.sticky-cta')){
      var s = document.createElement('div');
      s.className = 'sticky-cta';
      s.innerHTML = '<button class="btn btn-red btn-lg" onclick="goForm()">Открыть счёт →</button>';
      document.body.appendChild(s);
      var toggleCta = function(){ s.classList.toggle('show', window.scrollY > 440); };
      window.addEventListener('scroll', toggleCta, {passive:true});
      toggleCta();
    }
    // согласие на обработку ПД перед кнопкой отправки в каждой форме
    document.querySelectorAll('form').forEach(function(form, i){
      if(form.querySelector('.consent')) return;
      var btn = form.querySelector('button[type=submit], .btn');
      if(!btn) return;
      var row = document.createElement('label');
      row.className = 'consent';
      row.innerHTML = '<input type="checkbox" id="consent-'+i+'"><span>Согласен на обработку персональных данных и звонок банка. <a href="#" onclick="return false">Политика обработки ПД</a> · <span style="opacity:.7">демо-ссылка</span></span>';
      form.insertBefore(row, btn);
    });
  });

  /* ---- FAQ-аккордеон ---- */
  window.tq = function(btn){
    var q = btn.parentElement, a = q.querySelector('.a'), open = q.classList.contains('open');
    document.querySelectorAll('.q.open').forEach(function(x){ x.classList.remove('open'); var xa=x.querySelector('.a'); if(xa) xa.style.maxHeight=null; });
    if(!open){ q.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
  };
  window.renderFAQ = function(listId, items){
    var el = document.getElementById(listId); if(!el) return;
    el.innerHTML = items.map(function(it){
      return '<div class="q reveal"><button onclick="tq(this)">'+it[0]+'<span class="s">+</span></button><div class="a"><p>'+it[1]+'</p></div></div>';
    }).join('');
    observeReveals(el);
  };

  /* ---- формат рублей ---- */
  window.fmtRub = function(n){ return n.toLocaleString('ru-RU') + ' ₽'; };

  /* ---- обратный отсчёт до конца недели акции ----
     Обновляет: #d-d/#d-h/#d-m/#d-s (крупные ячейки) и любые .mt / #ftimer (строкой). */
  var secLeft = 1*86400 + 12*3600; // демо-старт: 1д 12ч
  function pad(x){ return String(x).padStart(2,'0'); }
  function tickTimer(){
    secLeft = Math.max(0, secLeft-1);
    var dd=Math.floor(secLeft/86400), hh=Math.floor(secLeft%86400/3600), mm=Math.floor(secLeft%3600/60), ss=secLeft%60;
    var setT=function(id,v){ var e=document.getElementById(id); if(e) e.textContent=v; };
    setT('d-d', dd); setT('d-h', pad(hh)); setT('d-m', pad(mm)); setT('d-s', pad(ss));
    var str = dd+'д '+pad(hh)+':'+pad(mm)+':'+pad(ss);
    var ft=document.getElementById('ftimer'); if(ft) ft.textContent=str;
    document.querySelectorAll('.mt').forEach(function(e){ e.textContent=str; });
  }
  tickTimer();
  if(!reduce) setInterval(tickTimer, 1000);

  /* ---- «живые» счётчики: любой [data-live] с data-start и data-step ---- */
  document.querySelectorAll('[data-live]').forEach(function(el){
    var val = parseInt(el.dataset.start||'0', 10);
    var money = el.dataset.money === '1';
    el.textContent = money ? fmtRub(val) : val;
    if(reduce || document.body.classList.contains('noanim')) return;
    var every = parseInt(el.dataset.every||'2200', 10);
    var step = parseInt(el.dataset.step||'1', 10);
    var prob = parseFloat(el.dataset.prob||'0.6');
    setInterval(function(){
      if(money){ val += Math.floor(step*(0.5+Math.random())); el.textContent=fmtRub(val); }
      else if(Math.random() < prob){ val += step; el.textContent=val; }
    }, every);
  });

  window.__reduce = reduce;
})();
