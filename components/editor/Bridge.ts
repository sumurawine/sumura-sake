'use client';

/**
 * 保存の受け渡し役。
 * サイトの中に、管理画面（自分のみアクセス可）を見えない枠で読み込み、
 * 書き込みはその中で行います。ご本人のブラウザでしか通りません。
 */

const BRIDGE_KEY = 'sumura-bridge-url';

export function bridgeUrl(): string {
  try { return localStorage.getItem(BRIDGE_KEY) || ''; } catch { return ''; }
}
export function setBridgeUrl(u: string) {
  try { localStorage.setItem(BRIDGE_KEY, u.trim()); } catch {}
}

type Pending = { resolve: (v: any) => void; reject: (e: any) => void; t: number };

let frame: HTMLIFrameElement | null = null;
let ready = false;
let readyWaiters: Array<(ok: boolean) => void> = [];
const pending = new Map<string, Pending>();
let seq = 0;

function origin(u: string) { try { return new URL(u).origin; } catch { return '*'; } }

/** 見えない枠を用意します */
export function openBridge(): Promise<boolean> {
  const url = bridgeUrl();
  if (!url) return Promise.resolve(false);
  if (ready) return Promise.resolve(true);
  if (!frame) {
    frame = document.createElement('iframe');
    frame.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'page=bridge';
    frame.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px';
    document.body.appendChild(frame);
    window.addEventListener('message', (e) => {
      if (!frame || e.source !== frame.contentWindow) return;
      const d = e.data || {};
      if (d.sumura === 'ready') {
        ready = true;
        readyWaiters.splice(0).forEach((fn) => fn(true));
        return;
      }
      if (d.sumura === 'result' && d.id && pending.has(d.id)) {
        const p = pending.get(d.id)!;
        pending.delete(d.id);
        clearTimeout(p.t);
        d.ok ? p.resolve(d.value) : p.reject(new Error(d.error || '保存できませんでした'));
      }
    });
  }
  return new Promise((res) => {
    readyWaiters.push(res);
    setTimeout(() => {
      if (!ready) { readyWaiters.splice(0).forEach((fn) => fn(false)); }
    }, 12000);
  });
}

/** 管理画面の中の関数を呼びます */
export function call(action: string, payload: any): Promise<any> {
  return openBridge().then((ok) => {
    if (!ok || !frame || !frame.contentWindow) {
      throw new Error('管理画面につながりません。Googleアカウントでログインしているかご確認ください。');
    }
    const id = 'r' + (++seq);
    return new Promise((resolve, reject) => {
      const t = window.setTimeout(() => {
        pending.delete(id);
        reject(new Error('時間がかかりすぎました。もう一度お試しください。'));
      }, 90000);
      pending.set(id, { resolve, reject, t });
      frame!.contentWindow!.postMessage({ sumura: 'call', id, action, payload }, origin(bridgeUrl()));
    });
  });
}

export const isBridgeReady = () => ready;
