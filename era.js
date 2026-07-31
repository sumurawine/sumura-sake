/* =============================================================
   すむら酒店 ── タイムスリップ装置
   1995 / 2000 / 2010 / 現在 の4つのレイアウトを切り替えます
   ============================================================= */
(function () {
  'use strict';

  var ERAS = ['1995', '2000', '2010', 'now'];

  function get() {
    try { var e = localStorage.getItem('era'); return ERAS.indexOf(e) >= 0 ? e : '1995'; }
    catch (x) { return '1995'; }
  }

  /* 描画前に適用してチラつきを防ぐ */
  document.documentElement.setAttribute('data-era', get());

  var T = {
    jp: { t:'タイムスリップ', a:'1995年へ', b:'2000年へ', c:'2010年へ', d:'現在に戻る' },
    en: { t:'TIME TRAVEL',   a:'To 1995',  b:'To 2000',  c:'To 2010',  d:'Back to now' },
    fr: { t:'VOYAGE TEMPOREL', a:'Vers 1995', b:'Vers 2000', c:'Vers 2010', d:'Retour au présent' },
    zh: { t:'时光旅行',       a:'回到1995年', b:'回到2000年', c:'回到2010年', d:'回到现在' },
    ko: { t:'타임슬립',       a:'1995년으로', b:'2000년으로', c:'2010년으로', d:'현재로 돌아가기' }
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
    var labels = [['1995', t('a')], ['2000', t('b')], ['2010', t('c')], ['now', t('d')]];
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
    if (window.matchMedia && window.matchMedia('(max-width:760px)').matches) {
      box.classList.add('tw-closed');
      tg.textContent = '+';
    }
  }

  /* ---------- 時代ごとの細かい仕上げ ---------- */
  function gif(src, w, h, style) {
    return '<img src="' + src + '" width="' + w + '" height="' + h + '" alt="" style="' + (style || '') + '">';
  }

  function decorate2000() {
    var wrap = document.querySelector('.wrap');
    if (wrap) {
      var top = document.createElement('div');
      top.className = 'tw-deco';
      top.innerHTML = gif('gif/const.gif', 104, 22, 'vertical-align:middle;margin:0 6px') +
                      gif('gif/wine.gif', 22, 30, 'vertical-align:middle;margin:0 6px') +
                      gif('gif/new.gif', 40, 16, 'vertical-align:middle;margin:0 6px') +
                      gif('gif/star.gif', 17, 17, 'vertical-align:middle;margin:0 6px');
      wrap.insertBefore(top, wrap.firstChild);
    }
    var nav = document.querySelector('.nav');
    if (nav) nav.insertAdjacentHTML('beforeend', ' ' + gif('gif/new.gif', 40, 16, 'vertical-align:middle'));
    [].forEach.call(document.querySelectorAll('a[href^="contact.html"]'), function (a) {
      if (a.querySelector('img')) return;
      a.insertAdjacentHTML('afterbegin', gif('gif/mail.gif', 28, 20, 'vertical-align:middle;margin-right:4px'));
    });
    [].forEach.call(document.querySelectorAll('hr.rainbow'), function (h) {
      h.insertAdjacentHTML('afterend', '<div class="tw-deco">' +
        gif('gif/star.gif', 17, 17, 'margin:0 4px') + gif('gif/wine.gif', 22, 30, 'margin:0 4px') +
        gif('gif/star.gif', 17, 17, 'margin:0 4px') + '</div>');
    });
  }

  function textLogo(era) {
    var jp = document.querySelectorAll('img[alt="すむら酒店"]');
    var en = document.querySelectorAll('img[alt="Liquor Shop Sumura"]');
    var jpStyle, enStyle;
    if (era === 'now') {
      jpStyle = 'display:block;font-size:40px;font-weight:600;letter-spacing:-.02em;color:#1d1d1f;padding:26px 0 2px';
      enStyle = 'display:block;font-size:13px;letter-spacing:.16em;color:#86868b;text-transform:uppercase;padding-bottom:6px';
    } else {
      jpStyle = 'display:block;font-size:30px;font-weight:bold;color:#222;padding:14px 0 0';
      enStyle = 'display:block;font-size:12px;letter-spacing:.12em;color:#888;padding-bottom:6px';
    }
    [].forEach.call(jp, function (im) {
      im.style.display = 'none';
      if (im.parentNode.querySelector('.tw-logo')) return;
      im.insertAdjacentHTML('afterend', '<span class="tw-logo" style="' + jpStyle + '">すむら酒店</span>');
    });
    [].forEach.call(en, function (im) {
      im.style.display = 'none';
      if (im.parentNode.querySelector('.tw-logo-en')) return;
      im.insertAdjacentHTML('afterend', '<span class="tw-logo-en" style="' + enStyle + '">Liquor Shop Sumura</span>');
    });
  }


  /* ---------- 2010 / 現在 では飾り文字を落として上品にする ---------- */
  var EDGE = /^[\s■◆▒▼▲★☆▶◀▶◁［］\[\]｜|・･]+|[\s■◆▒▼▲★☆▶◀▶◁［］\[\]｜|・･]+$/g;
  function clean(el, opts) {
    if (!el || el.getAttribute('data-tw-done') === '1') return;
    if (el.querySelector && el.querySelector('img,svg,canvas,input,select,button')) return;
    var s = el.innerHTML;
    if (opts && opts.mid) s = s.replace(/[★☆]/g, '·');
    var t = s.replace(EDGE, '').replace(/\s{2,}/g, ' ').trim();
    t = t.replace(/^(·\s*)+/, '').replace(/(\s*·)+$/, '');
    if (t && t !== s) { el.innerHTML = t; }
    el.setAttribute('data-tw-done', '1');
  }
  function tidy() {
    var era = get();
    if (era !== '2010' && era !== 'now') return;
    [].forEach.call(document.querySelectorAll('.pixhead'), function (e) { clean(e); });
    [].forEach.call(document.querySelectorAll('.sub'), function (e) { clean(e, { mid: 1 }); });
    [].forEach.call(document.querySelectorAll('.btn'), function (e) {
      if (e.id === 'stock-btn') return;
      clean(e);
    });
    [].forEach.call(document.querySelectorAll('#catalogue > div[style]'), function (e) { clean(e); });
    [].forEach.call(document.querySelectorAll('#pr-list .pixhead'), function (e) { clean(e); });
  }
  window.__twTidy = tidy;

  function boot() {
    panel();
    var era = get();
    if (era === '2000') decorate2000();
    if (era === '2010' || era === 'now') { textLogo(era); tidy(); setTimeout(tidy, 400); setTimeout(tidy, 1500); }
    if (window.sumuraOnLang) window.sumuraOnLang(function () {
      [].forEach.call(document.querySelectorAll('[data-tw-done]'), function (e) { e.removeAttribute('data-tw-done'); });
      setTimeout(tidy, 60);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
