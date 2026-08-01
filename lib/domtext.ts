'use client';

/**
 * ページに出ている文字を、そのまま書き換えられるようにします。
 * 見出しに名前（data-i18n）が付いていれば それを、無ければ
 * 「どのページの・どの時代の・どの位置か」から名前を組み立てます。
 * こうすることで、モダン版のホームのように名前の無い文言も触れます。
 */

import type { Lang } from './i18n';
import { ovText, ovLink } from './overrides';

const SKIP = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH', 'CANVAS', 'IFRAME',
  'INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'HEAD', 'TITLE', 'META', 'LINK',
]);

/** 編集の道具そのものは対象外です */
function ours(el: Element): boolean {
  return !!el.closest('.ed-panel, .ed-bar, .ed-msg, .ed-new, .ed-form');
}

/** 中身が文字だけの場所を探します（中に別の箱があるときは、その中を対象にします） */
export function editableText(el: Element): boolean {
  if (SKIP.has(el.tagName)) return false;
  if (ours(el)) return false;
  const kids = Array.from(el.childNodes);
  if (!kids.length) return false;
  let hasText = false;
  for (const n of kids) {
    if (n.nodeType === 3) { if ((n.textContent || '').trim()) hasText = true; }
    else if (n.nodeType === 1 && (n as Element).tagName === 'BR') continue;
    else if (n.nodeType === 8) continue;
    else return false;
  }
  return hasText;
}

/** 触れる場所かどうか */
export function isTarget(el: Element): boolean {
  if (ours(el)) return false;
  return el.hasAttribute('data-ov') || editableText(el);
}

/** いま見ているページの名前 */
function pageName(): string {
  const p = window.location.pathname.replace(/\/+$/, '');
  const last = p.split('/').pop() || '';
  const n = last.replace(/\.html$/, '');
  return n && n !== 'preview' ? n : 'home';
}

/** 位置から名前を組み立てます */
export function autoKey(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  let guard = 0;
  while (cur && cur !== document.body && guard++ < 40) {
    const p: Element | null = cur.parentElement;
    if (!p) break;
    const same = Array.from(p.children).filter((c) => c.tagName === cur!.tagName);
    const i = same.indexOf(cur);
    parts.unshift(cur.tagName.toLowerCase() + (same.length > 1 ? String(i) : ''));
    cur = p;
  }
  const era = document.documentElement.getAttribute('data-era') || 'now';
  return 'p:' + pageName() + '|' + era + '|' + parts.join('>');
}

/** その場所の見分け名 */
export function keyOf(el: Element): string {
  const ov = el.getAttribute('data-ov');
  if (ov) return ov;
  const i18n = el.getAttribute('data-i18n');
  if (i18n) return 'k:' + i18n;
  return autoKey(el);
}

/** もとの文章を覚えておきます（戻すときに使います） */
const base = new WeakMap<Element, string>();

export function baseText(el: Element): string {
  const b = base.get(el);
  return b !== undefined ? b : (el.textContent || '');
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let working = false;

/** 読み込んである上書きを、ページ全体に当てます */
export function applyOverrides(lang: Lang): void {
  if (typeof document === 'undefined' || working) return;
  working = true;
  try {
    const all = document.body.querySelectorAll<HTMLElement>('*');
    all.forEach((el) => {
      if (!isTarget(el)) return;
      const k = keyOf(el);
      if (!base.has(el)) base.set(el, el.textContent || '');
      const orig = base.get(el)!;
      const t = ovText(k, lang);
      const link = ovLink(k, lang);

      if (t == null && !link) {
        if (el.dataset.ovOn === '1') {
          el.textContent = orig;
          delete el.dataset.ovOn;
          el.removeAttribute('data-ov');
        }
        return;
      }

      const body = t == null ? orig : t;
      if (link) {
        const html = esc(body) + ' <a href="' + esc(link.href) + '">' + esc(link.text) + '</a>';
        if (el.innerHTML !== html) el.innerHTML = html;
        el.setAttribute('data-ov', k);
      } else if (el.textContent !== body) {
        el.textContent = body;
      }
      el.dataset.ovOn = '1';
    });
  } finally {
    working = false;
  }
}

/** 描き直されても当たるように、見張りを立てます */
export function watchOverrides(getLang: () => Lang): () => void {
  let timer = 0;
  const run = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => applyOverrides(getLang()), 60);
  };
  const mo = new MutationObserver(() => { if (!working) run(); });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  run();
  return () => { mo.disconnect(); window.clearTimeout(timer); };
}
