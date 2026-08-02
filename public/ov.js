/* すむら酒店：文言の上書きを、描かれる前に当てるための小さな仕掛け。
   <head> で読み込みます。前に見た内容を控えてあるので、
   通信を待たずに正しい文章のまま最初から表示されます。 */
(function () {
  var SKIP = { SCRIPT:1, STYLE:1, NOSCRIPT:1, SVG:1, PATH:1, CANVAS:1, IFRAME:1,
               INPUT:1, TEXTAREA:1, SELECT:1, OPTION:1, HEAD:1, TITLE:1, META:1, LINK:1 };
  var LANGS = ['jp','en','fr','zh','ko'];
  var rows = {};      /* キー → 一行分 */
  var lang = 'jp';
  var base = new WeakMap();
  var working = false;

  function ours(el) {
    return !!(el.closest && el.closest('.ed-panel, .ed-bar, .ed-msg, .ed-new, .ed-form'));
  }

  function editable(el) {
    if (SKIP[el.tagName]) return false;
    if (ours(el)) return false;
    var kids = el.childNodes, has = false;
    if (!kids.length) return false;
    for (var i = 0; i < kids.length; i++) {
      var n = kids[i];
      if (n.nodeType === 3) { if ((n.nodeValue || '').trim()) has = true; }
      else if (n.nodeType === 1 && n.tagName === 'BR') continue;
      else if (n.nodeType === 8) continue;
      else return false;
    }
    return has;
  }

  function isTarget(el) {
    if (ours(el)) return false;
    return el.hasAttribute('data-ov') || editable(el);
  }

  function pageName() {
    var p = location.pathname.replace(/\/+$/, '');
    var last = p.split('/').pop() || '';
    var n = last.replace(/\.html$/, '');
    return (n && n !== 'preview') ? n : 'home';
  }

  function autoKey(el) {
    var parts = [], cur = el, guard = 0;
    while (cur && cur !== document.body && guard++ < 40) {
      var p = cur.parentElement;
      if (!p) break;
      var same = [], c = p.children;
      for (var i = 0; i < c.length; i++) if (c[i].tagName === cur.tagName) same.push(c[i]);
      parts.unshift(cur.tagName.toLowerCase() + (same.length > 1 ? String(same.indexOf(cur)) : ''));
      cur = p;
    }
    var era = document.documentElement.getAttribute('data-era') || 'now';
    return 'p:' + pageName() + '|' + era + '|' + parts.join('>');
  }

  function keyOf(el) {
    var ov = el.getAttribute('data-ov'); if (ov) return ov;
    var k = el.getAttribute('data-i18n'); if (k) return k;
    return autoKey(el);
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function textOf(k) {
    var r = rows[k]; if (!r) return null;
    var v = (lang === 'jp' ? r['日本語'] : r[lang.toUpperCase()]) || '';
    var t = String(v).trim() || String(r['日本語'] || '').trim();
    return t || null;
  }
  function linkOf(k) {
    var r = rows[k]; if (!r) return null;
    var href = String(r['リンク先'] || '').trim();
    if (!href) return null;
    var t = String((lang === 'jp' ? r['リンク文字(日本語)'] : r['リンク文字' + lang.toUpperCase()]) || r['リンク文字(日本語)'] || '').trim();
    return { text: t || href, href: href };
  }

  function apply(root) {
    if (working || !document.body) return;
    working = true;
    try {
      var all = (root || document.body).querySelectorAll('*');
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (!isTarget(el)) continue;
        var k = keyOf(el);
        if (!base.has(el)) base.set(el, el.textContent || '');
        var orig = base.get(el);
        var t = textOf(k), link = linkOf(k);
        if (t == null && !link) {
          if (el.getAttribute('data-ov-on') === '1') {
            el.textContent = orig;
            el.removeAttribute('data-ov-on');
            el.removeAttribute('data-ov');
          }
          continue;
        }
        var body = (t == null) ? orig : t;
        if (link) {
          var html = esc(body) + ' <a href="' + esc(link.href) + '">' + esc(link.text) + '</a>';
          if (el.innerHTML !== html) el.innerHTML = html;
          el.setAttribute('data-ov', k);
        } else if (el.textContent !== body) {
          el.textContent = body;
        }
        el.setAttribute('data-ov-on', '1');
      }
    } catch (e) {} finally { working = false; }
  }

  function readLang() {
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (q && LANGS.indexOf(q) >= 0) return q;
      var l = localStorage.getItem('lang');
      if (l && LANGS.indexOf(l) >= 0) return l;
    } catch (e) {}
    return 'jp';
  }

  function mirror() { return /\/preview(\/|$)/.test(location.pathname); }

  /** 控えてある内容を読み出します（本番では「公開」のものだけ） */
  function loadCache() {
    try {
      var raw = localStorage.getItem('sumura-ov');
      if (!raw) return;
      var arr = JSON.parse(raw);
      setRows(arr);
    } catch (e) {}
  }

  function setRows(arr) {
    var map = {}, m = mirror();
    (arr || []).forEach(function (r) {
      if (!r || !r['キー']) return;
      if (!m && String(r['公開'] || '').trim() !== '公開') return;
      map[String(r['キー']).trim()] = r;
    });
    rows = map;
    try { localStorage.setItem('sumura-ov', JSON.stringify(arr || [])); } catch (e) {}
  }

  var timer = 0;
  function soon() {
    clearTimeout(timer);
    timer = setTimeout(function () { apply(); }, 40);
  }

  lang = readLang();
  loadCache();

  /* 中身が置かれるそばから当てます。画面に出る前に済ませます */
  /* はじめの数秒は即座に当てます（描かれる前に直すため）。
     その後は少し待ってからにして、画面を重くしません */
  var t0 = Date.now();
  var mo = new MutationObserver(function () {
    if (working) return;
    if (Date.now() - t0 < 4000) apply(); else soon();
  });
  function start() {
    if (!document.body) { requestAnimationFrame(start); return; }
    apply();
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  start();

  window.SumuraOv = {
    keyOf: keyOf, isTarget: isTarget, editable: editable, apply: apply, soon: soon,
    setRows: setRows, setLang: function (l) { lang = l; apply(); },
    baseText: function (el) { var b = base.get(el); return b === undefined ? (el.textContent || '') : b; },
    rows: function () { return rows; },
  };
})();
