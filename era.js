/* =============================================================
   すむら酒店 ── 時間旅行
   1995 / 2005 / 2010 / 現在 の4つのレイアウトを切り替えます
   ============================================================= */
(function () {
  'use strict';

  var ERAS = ['1995', '2005', '2010', 'now'];

  function get() {
    try {
      var e = localStorage.getItem('era');
      if (e === '2000') { e = '2005'; localStorage.setItem('era', e); }
      return ERAS.indexOf(e) >= 0 ? e : '1995';
    } catch (x) { return '1995'; }
  }
  document.documentElement.setAttribute('data-era', get());

  var T = {
    jp: { t:'時間旅行', a:'1990年代へ', b:'2000年代へ', c:'2010年代へ', d:'2020年代（現代）へ戻る',
          priv:'非公開在庫', ask:'こちらは非公開のページです。パスワードをご入力ください。', back:'← 戻る', enter:'入店する',
          leave:'退店', bye:'またのお越しをお待ちしております。', again:'入口へ戻る', drop:'時をおすそわけ',
          sub:'山口・宇部　フランス銘醸ワインの店' },
    en: { t:'TIME TRAVEL', a:'To the 1990s', b:'To the 2000s', c:'To the 2010s', d:'Back to the 2020s',
          priv:'Private Cellar', ask:'This page is private. Please enter the password.', back:'← Back', enter:'Enter',
          leave:'LEAVE', bye:'We look forward to welcoming you again.', again:'Back to the entrance', drop:'Sharing a Little Time',
          sub:'Fine French wines · Ube, Yamaguchi' },
    fr: { t:'VOYAGE TEMPOREL', a:'Vers les 1990s', b:'Vers les 2000s', c:'Vers les 2010s', d:'Retour aux 2020s',
          priv:'Cave privée', ask:'Cette page est privée. Merci de saisir le mot de passe.', back:'← Retour', enter:'Entrer',
          leave:'SORTIE', bye:'Au plaisir de vous revoir.', again:'Retour à l’entrée', drop:'Un peu de temps partagé',
          sub:'Grands vins de France · Ube, Yamaguchi' },
    zh: { t:'时光旅行', a:'回到 1990s', b:'回到 2000s', c:'回到 2010s', d:'回到 2020s（现代）',
          priv:'非公开库存', ask:'此页面为非公开页面。请输入密码。', back:'← 返回', enter:'进入',
          leave:'离店', bye:'期待您的再次光临。', again:'返回入口', drop:'与您分享时光',
          sub:'法国名酿葡萄酒 · 山口宇部' },
    ko: { t:'시간 여행', a:'1990s 로', b:'2000s 로', c:'2010s 로', d:'2020s(현재)로 돌아가기',
          priv:'비공개 재고', ask:'이 페이지는 비공개입니다. 비밀번호를 입력해 주세요.', back:'← 돌아가기', enter:'입장하기',
          leave:'퇴점', bye:'다음에 또 방문해 주시기를 기다리겠습니다.', again:'입구로 돌아가기', drop:'시간을 나눠 드립니다',
          sub:'프랑스 명양조 와인 · 야마구치 우베' }
  };
  function L() { try { return localStorage.getItem('lang') || 'jp'; } catch (x) { return 'jp'; } }
  function t(k) { return (T[L()] || T.jp)[k]; }

  function set(era) {
    try { localStorage.setItem('era', era); } catch (x) {}
    document.documentElement.setAttribute('data-era', era);
    location.reload();
  }

  function panel() {
    if (document.getElementById('timewarp')) return;
    var cur = get();
    var box = document.createElement('div');
    box.id = 'timewarp';
    var labels = [['1995', t('a')], ['2005', t('b')], ['2010', t('c')], ['now', t('d')]];
    var html = '<button type="button" class="tw-toggle" aria-label="toggle">−</button>' +
               '<span class="tw-t">⏳ ' + t('t') + '</span><div class="tw-body">';
    labels.forEach(function (p) {
      html += '<button type="button" data-era="' + p[0] + '"' + (p[0] === cur ? ' class="on"' : '') + '>' + p[1] + '</button>';
    });
    html += '</div>';
    box.innerHTML = html;
    document.body.appendChild(box);
    [].forEach.call(box.querySelectorAll('button[data-era]'), function (b) {
      b.addEventListener('click', function () { set(b.getAttribute('data-era')); });
    });
    var tg = box.querySelector('.tw-toggle');
    tg.addEventListener('click', function () {
      box.classList.toggle('tw-closed');
      tg.textContent = box.classList.contains('tw-closed') ? '+' : '−';
    });
    if (window.matchMedia && window.matchMedia('(max-width:900px)').matches) {
      box.classList.add('tw-closed'); tg.textContent = '+';
    }
  }

  /* ---------- 2005：GIFを盛る ---------- */
  function g(src, w, h, st) {
    return '<img src="gif/' + src + '?v=2" width="' + w + '" height="' + h + '" alt="" style="' + (st || '') + '">';
  }
  function decorate2005() {
    var wrap = document.querySelector('.wrap');
    if (wrap) {
      var top = document.createElement('div');
      top.className = 'tw-deco';
      top.innerHTML = g('const.gif',104,22,'vertical-align:middle;margin:0 5px') +
                      g('wine.gif',22,32,'vertical-align:middle;margin:0 5px') +
                      g('new.gif',40,16,'vertical-align:middle;margin:0 5px') +
                      g('heart.gif',16,14,'vertical-align:middle;margin:0 5px') +
                      g('star.gif',18,18,'vertical-align:middle;margin:0 5px') +
                      g('heart.gif',16,14,'vertical-align:middle;margin:0 5px');
      wrap.insertBefore(top, wrap.firstChild);
    }
    var nav = document.querySelector('.nav');
    if (nav) nav.insertAdjacentHTML('beforeend', ' ' + g('new.gif',40,16,'vertical-align:middle'));
    [].forEach.call(document.querySelectorAll('a[href^="contact.html"]'), function (a) {
      if (a.querySelector('img')) return;
      a.insertAdjacentHTML('afterbegin', g('mail.gif',28,20,'vertical-align:middle;margin-right:4px'));
    });
    [].forEach.call(document.querySelectorAll('hr.rainbow'), function (h) {
      h.insertAdjacentHTML('afterend', '<div class="tw-deco">' +
        g('star.gif',18,18,'margin:0 5px') + g('heart.gif',16,14,'margin:0 5px') +
        g('wine.gif',22,32,'margin:0 5px') + g('heart.gif',16,14,'margin:0 5px') +
        g('star.gif',18,18,'margin:0 5px') + '</div>');
    });
    if (!document.getElementById('tw-ticker')) {
      var mq = document.querySelector('.marquee b');
      var msg = mq ? mq.textContent : 'すむら酒店';
      var tk = document.createElement('div');
      tk.id = 'tw-ticker';
      tk.innerHTML = '<b>☆*:.｡. ' + msg + ' .｡.:*☆</b>';
      document.body.appendChild(tk);
    }
  }

  /* ---------- 2010 / 現在：ドット絵ロゴをテキストに ---------- */
  function textLogo(era) {
    function swap(sel, cls, style) {
      [].forEach.call(document.querySelectorAll(sel), function (im) {
        if (im.closest && im.closest('#pixtitle')) return;
        im.style.display = 'none';
        if (im.parentNode.querySelector('.' + cls)) return;
        im.insertAdjacentHTML('afterend', '<span class="' + cls + '" style="' + style + '">' + im.getAttribute('alt') + '</span>');
      });
    }
    if (era === 'now') {
      swap('img[alt="すむら酒店"]', 'tw-logo', 'display:block;font-size:44px;font-weight:700;letter-spacing:-.04em;color:#1d1d1f;padding:34px 0 4px;line-height:1.05');
      swap('img[alt="Liquor Shop Sumura"]', 'tw-logo-en', 'display:block;font-size:12px;letter-spacing:.32em;color:#86868b;text-transform:uppercase;padding-bottom:10px');
    } else {
      swap('img[alt="すむら酒店"]', 'tw-logo', 'display:block;font-size:30px;font-weight:bold;color:#222;padding:16px 0 0');
      swap('img[alt="Liquor Shop Sumura"]', 'tw-logo-en', 'display:block;font-size:12px;letter-spacing:.14em;color:#888;padding-bottom:8px');
    }
  }

  /* ---------- 2010 / 現在：飾り文字を落とし、扉まわりの言い回しを変える ---------- */
  var EDGE = /^[\s■◆▒▼▲★☆▶◀◁｜|・･]+|[\s■◆▒▼▲★☆▶◀◁｜|・･]+$/g;
  function clean(el, opts) {
    if (!el || el.getAttribute('data-tw-done') === '1') return;
    if (el.querySelector && el.querySelector('img,svg,canvas,input,select,button')) return;
    var s = el.innerHTML;
    if (opts && opts.mid) s = s.replace(/[★☆]/g, '·');
    var v = s.replace(/[［］]/g, '').replace(EDGE, '').replace(/\s{2,}/g, ' ').trim();
    v = v.replace(/^(·\s*)+/, '').replace(/(\s*·)+$/, '');
    if (v && v !== s) el.innerHTML = v;
    el.setAttribute('data-tw-done', '1');
  }
  function tidy() {
    var era = get();
    if (era !== '2010' && era !== 'now') return;
    [].forEach.call(document.querySelectorAll('.pixhead'), function (e) { clean(e); });
    [].forEach.call(document.querySelectorAll('.sub'), function (e) { clean(e, { mid: 1 }); });
    [].forEach.call(document.querySelectorAll('.btn'), function (e) { if (e.id !== 'stock-btn') clean(e); });
    [].forEach.call(document.querySelectorAll('#catalogue > div[style]'), function (e) { clean(e); });

    /* 秘密の部屋 → 非公開在庫 */
    [].forEach.call(document.querySelectorAll('a[href="secret.html"]'), function (a) {
      if (!a.querySelector('img')) a.textContent = t('priv');
    });
    var h = document.querySelector('[data-i18n="sc-head"]');
    if (h) { h.textContent = t('priv'); h.setAttribute('data-tw-done', '1'); }
    var ask = document.querySelector('[data-i18n="sc-ask"]');
    if (ask) ask.textContent = t('ask');
    [].forEach.call(document.querySelectorAll('[data-i18n="rm-back"]'), function (e) { e.textContent = t('back'); });
  }
  window.__twTidy = tidy;

  /* ---------- 入口ページ ---------- */
  function entrance(era) {
    var box = document.getElementById('modern-entrance');
    if (!box) return;
    var jp = box.querySelector('.me-jp'), sub = box.querySelector('.me-sub'), btn = box.querySelector('.me-btn');
    if (sub) sub.textContent = t('sub');
    if (btn) btn.textContent = t('enter');
  }


  /* ---------- 退店 ---------- */
  function thud() {
    try {
      var a = new (window.AudioContext || window.webkitAudioContext)();
      var o = a.createOscillator(), gn = a.createGain(), f = a.createBiquadFilter();
      o.type = 'sine'; o.frequency.setValueAtTime(150, a.currentTime);
      o.frequency.exponentialRampToValueAtTime(48, a.currentTime + 0.4);
      f.type = 'lowpass'; f.frequency.value = 700;
      gn.gain.setValueAtTime(0.26, a.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.0008, a.currentTime + 0.45);
      o.connect(f); f.connect(gn); gn.connect(a.destination);
      o.start(); o.stop(a.currentTime + 0.5);
    } catch (e) {}
  }
  function leave(e) {
    if (e) e.preventDefault();
    if (document.getElementById('tw-leave-ov')) return;
    var era = get();
    var ov = document.createElement('div');
    ov.id = 'tw-leave-ov';
    ov.innerHTML = '<div class="tw-door tw-door-l"></div><div class="tw-door tw-door-r"></div>' +
                   '<div class="tw-bye"><div class="tw-bye-t"></div><a class="tw-bye-a" href="index.html"></a></div>';
    document.body.appendChild(ov);
    ov.querySelector('.tw-bye-t').textContent = t('bye');
    ov.querySelector('.tw-bye-a').textContent = t('again');
    requestAnimationFrame(function () {
      ov.classList.add('go');
      if (era === '1995' || era === '2005') setTimeout(thud, 900);
    });
  }
  function leaveButton() {
    var nav = document.querySelector('.nav');
    if (!nav || document.getElementById('tw-leave')) return;
    var a = document.createElement('a');
    a.id = 'tw-leave'; a.href = '#'; a.textContent = t('leave');
    a.addEventListener('click', leave);
    nav.appendChild(a);
  }

  /* ---------- ヘッダーの見出しから一部を落とす（2010 / 現在） ---------- */
  function trimHeader() {
    var era = get();
    if (era !== '2010' && era !== 'now') return;
    var d = document.querySelector('div.sub');
    if (!d) return;
    var drop = t('drop');
    var parts = d.textContent.split(/[☆★·]/).map(function (s) { return s.trim(); })
                 .filter(function (s) { return s && s.indexOf(drop) < 0; });
    var v = parts.join(' · ');
    if (v && v !== d.textContent) d.textContent = v;
  }

  function boot() {
    panel();
    leaveButton();
    var era = get();
    if (era === '2005') decorate2005();
    if (era === '2010' || era === 'now') {
      textLogo(era); entrance(era); tidy(); trimHeader();
      setTimeout(tidy, 400); setTimeout(tidy, 1500);
    }
    if (window.sumuraOnLang) window.sumuraOnLang(function () {
      [].forEach.call(document.querySelectorAll('[data-tw-done]'), function (e) { e.removeAttribute('data-tw-done'); });
      setTimeout(function () { tidy(); trimHeader(); entrance(get()); var lb = document.getElementById('tw-leave'); if (lb) lb.textContent = t('leave'); }, 60);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
