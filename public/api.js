/* =============================================================
   すむら酒店 ホームページ 共通スクリプト

   下の1行が Google Apps Script のウェブアプリURLです。
   デプロイをやり直してURLが変わったときは、シングルクォートの
   中身だけを差し替えてください（行ごと消さないでください）。
   ============================================================= */

window.SUMURA_API = 'https://script.google.com/macros/s/AKfycbxbPAsUhQpvzxheNel3k91juYk8d4zpR1GPwubMGQT_FJmT6LZa7nWbC9awZryaX8Ubzg/exec';

/* ============================================================= */

(function () {
  'use strict';

  function api() { return String(window.SUMURA_API || '').trim(); }

  window.sumuraReady = function () {
    var m = /^https:\/\/script\.google\.com\/macros\/s\/([A-Za-z0-9_-]+)\/exec$/.exec(api());
    return !!(m && m[1].length >= 30);
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
