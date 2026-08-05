/* すむら酒店：文言の上書きを、描かれる前に当てるための小さな仕掛け。
   <head> で読み込みます。前に見た内容を控えてあるので、
   通信を待たずに正しい文章のまま最初から表示されます。 */
(function () {
  var SKIP = { SCRIPT:1, STYLE:1, NOSCRIPT:1, SVG:1, PATH:1, CANVAS:1, IFRAME:1,
               INPUT:1, TEXTAREA:1, SELECT:1, OPTION:1, HEAD:1, TITLE:1, META:1, LINK:1 };
  var LANGS = ['jp','en','fr','zh','ko'];
  var rows = {};        /* 見分け名 → 一行分 */
  var loose = {};       /* 昔の見分け名（位置から作ったもの）の受け皿 */
  var anyEra = {};      /* 時代をまたいで通じる受け皿 */
  var lang = 'jp';
  var base = new WeakMap();
  var working = false;

  function ours(el) {
    return !!(el.closest && el.closest('.ed-panel, .ed-bar, .ed-msg, .ed-new, .ed-form, .bi-wrap, .bi-hint'));
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
  function eraName() { return document.documentElement.getAttribute('data-era') || 'now'; }

  function tidy(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  /* 文章そのものから作る短い符号。飾りの箱が増えても変わりません */
  function code(s) {
    var h = 5381, i = s.length;
    while (i) { h = (h * 33 ^ s.charCodeAt(--i)) >>> 0; }
    return h.toString(36);
  }

  function headKey(el) {
    return 't:' + pageName() + '|' + eraName() + '|' + code(tidy(base.has(el) ? base.get(el) : el.textContent));
  }

  /* 同じ文章が並ぶときのために、何番目かを添えます */
  function nth(el, hk) {
    var all = document.body ? document.body.querySelectorAll('*') : [];
    var n = 0;
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (!isTarget(e)) continue;
      if (headKey(e) !== hk) continue;
      if (e === el) return n;
      n++;
    }
    return 0;
  }

  function keyOf(el) {
    var ov = el.getAttribute('data-ov'); if (ov) return ov;
    var k = el.getAttribute('data-i18n'); if (k) return k;
    var hk = headKey(el);
    var n = nth(el, hk);
    return n ? hk + '|' + n : hk;
  }

  /* 昔の見分け名（位置から作ったもの）。以前保存した分を拾うために残します */
  function pathKey(el) {
    var parts = [], cur = el, guard = 0;
    while (cur && cur !== document.body && guard++ < 40) {
      var p = cur.parentElement;
      if (!p) break;
      var same = [], c = p.children;
      for (var i = 0; i < c.length; i++) if (c[i].tagName === cur.tagName) same.push(c[i]);
      parts.unshift(cur.tagName.toLowerCase() + (same.length > 1 ? String(same.indexOf(cur)) : ''));
      cur = p;
    }
    return parts.join('>');
  }

  function eraFree(k) {
    if (k.indexOf('t:') !== 0) return null;
    var a = k.slice(2).split('|');
    if (a.length < 3) return null;
    return a[0] + '|' + a.slice(2).join('|');
  }

  function rowFor(el, k) {
    if (rows[k]) return rows[k];
    var ef = eraFree(k);
    if (ef && anyEra[ef]) return anyEra[ef];
    var pk = pathKey(el);
    var full = 'p:' + pageName() + '|' + eraName() + '|' + pk;
    if (rows[full]) return rows[full];
    var tail = pk.indexOf('>') >= 0 ? pk.slice(pk.indexOf('>') + 1) : pk;
    return loose[pageName() + '|' + eraName() + '|' + tail] || null;
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function textOf(r) {
    if (!r) return null;
    var v = (lang === 'jp' ? r['日本語'] : r[lang.toUpperCase()]) || '';
    var t = String(v).trim() || String(r['日本語'] || '').trim();
    return t || null;
  }
  function linkOf(r) {
    if (!r) return null;
    var href = String(r['リンク先'] || '').trim();
    if (!href) return null;
    var t = String((lang === 'jp' ? r['リンク文字(日本語)'] : r['リンク文字' + lang.toUpperCase()]) || r['リンク文字(日本語)'] || '').trim();
    return { text: t || href, href: href };
  }

  function apply() {
    if (working || !document.body) return;
    working = true;
    try {
      var all = document.body.querySelectorAll('*');
      var seen = {};
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (!isTarget(el)) continue;
        if (!base.has(el)) base.set(el, el.textContent || '');
        var orig = base.get(el);

        var k = el.getAttribute('data-ov') || el.getAttribute('data-i18n');
        if (!k) {
          var hk = headKey(el);
          var n = (seen[hk] = (seen[hk] || 0) + 1) - 1;
          k = n ? hk + '|' + n : hk;
        }

        var r = rowFor(el, k);
        var t = textOf(r), link = linkOf(r);
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

  function setRows(arr) {
    var ax = {};
    var map = {}, lo = {}, m = mirror();
    (arr || []).forEach(function (r) {
      if (!r || !r['キー']) return;
      if (!m && String(r['公開'] || '').trim() !== '公開') return;
      var key = String(r['キー']).trim();
      map[key] = r;
      if (key.indexOf('t:') === 0) {
        var t = key.slice(2).split('|');
        if (t.length >= 3) {
          var ek = t[0] + '|' + t.slice(2).join('|');
          if (!ax[ek] || String(r['公開'] || '').trim() === '公開') ax[ek] = r;
        }
      }
      if (key.indexOf('p:') === 0) {
        var body = key.slice(2);                      // ページ|時代|位置
        var i = body.lastIndexOf('|');
        var head = body.slice(0, i), path = body.slice(i + 1);
        var tail = path.indexOf('>') >= 0 ? path.slice(path.indexOf('>') + 1) : path;
        lo[head + '|' + tail] = r;
      }
    });
    rows = map; loose = lo; anyEra = ax;
    try { localStorage.setItem('sumura-ov', JSON.stringify(arr || [])); } catch (e) {}
  }

  function loadCache() {
    try {
      var raw = localStorage.getItem('sumura-ov');
      if (raw) setRows(JSON.parse(raw));
    } catch (e) {}
  }

  var timer = 0;
  function soon() { clearTimeout(timer); timer = setTimeout(apply, 60); }

  lang = readLang();
  loadCache();

  var t0 = Date.now();
  var mo = new MutationObserver(function () {
    if (working) return;
    if (Date.now() - t0 < 4000) apply(); else soon();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', apply);
  document.addEventListener('readystatechange', apply);
  window.addEventListener('load', apply);

  window.SumuraOv = {
    keyOf: keyOf, isTarget: isTarget, editable: editable, apply: apply, soon: soon,
    setRows: setRows, setLang: function (l) { lang = l; apply(); },
    baseText: function (el) { var b = base.get(el); return b === undefined ? (el.textContent || '') : b; },
    rows: function () { return rows; },
  };
})();
