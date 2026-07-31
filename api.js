/* =============================================================
   すむら酒店 ホームページ 共通スクリプト
   -------------------------------------------------------------
   ▼▼▼ Google Apps Script のウェブアプリURLをここに貼ってください ▼▼▼ */

window.SUMURA_API = '';

/* ▲▲▲ ここ1行だけ書き換えれば、お問い合わせ・メルマガ登録・
       ブログのコメント・来客カウンターがすべて動きます ▲▲▲
   例: window.SUMURA_API = 'https://script.google.com/macros/s/AKfy..../exec';
   ============================================================= */

(function () {
  'use strict';

  function api() { return String(window.SUMURA_API || '').trim(); }

  window.sumuraReady = function () {
    return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/.test(api());
  };

  window.sumuraPost = function (payload) {
    if (!window.sumuraReady()) return Promise.reject(new Error('not-configured'));
    return fetch(api(), { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' })
      .then(function (r) { return r.json(); });
  };

  window.sumuraGet = function (params) {
    if (!window.sumuraReady()) return Promise.reject(new Error('not-configured'));
    var q = [];
    for (var k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k)) {
        q.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
      }
    }
    return fetch(api() + '?' + q.join('&'), { redirect: 'follow' })
      .then(function (r) { return r.json(); });
  };

  window.sumuraLang = function () {
    try { return localStorage.getItem('lang') || 'jp'; } catch (e) { return 'jp'; }
  };

  window.sumuraEsc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  };

  /* 言語切替のあとに走らせたい処理を登録する */
  window.sumuraOnLang = function (fn) {
    var prev = window.__afterLang;
    window.__afterLang = function (l) { if (prev) { try { prev(l); } catch (e) {} } fn(l); };
  };

  /* ---------- 来客カウンター ---------- */
  function paint(el, n) {
    var s = String(Math.max(0, n | 0));
    while (s.length < 6) s = '0' + s;
    var h = '';
    for (var i = 0; i < s.length; i++) {
      h += (i === s.length - 1) ? '<span class="blink">' + s.charAt(i) + '</span>' : s.charAt(i);
      if (i < s.length - 1) h += ' ';
    }
    el.innerHTML = h;
  }

  function counter() {
    var el = document.getElementById('visit-counter');
    if (!el) return;
    if (!window.sumuraReady()) { paint(el, 0); return; }
    var fresh = true;
    try { fresh = !sessionStorage.getItem('sumura-seen'); } catch (e) {}
    window.sumuraGet({ action: fresh ? 'hit' : 'peek' }).then(function (r) {
      if (fresh) { try { sessionStorage.setItem('sumura-seen', '1'); } catch (e) {} }
      if (r && r.ok) paint(el, r.count);
    })['catch'](function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', counter);
  } else {
    counter();
  }
})();
