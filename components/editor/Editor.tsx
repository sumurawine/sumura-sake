'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { editMode, loadOverrides, overrides, isMirror } from '@/lib/overrides';
import { bridgeUrl, setBridgeUrl, call, openBridge } from './Bridge';
import { useSite } from '@/components/Providers';

type Target = {
  key: string;
  kind: 'text' | 'image';
  el: HTMLElement;
  current: string;
};

/** サイト内のページ。リンク先の選択に使います */
const PAGES: Array<[string, string]> = [
  ['', 'リンクなし'],
  ['home.html', 'ホーム'],
  ['store.html', 'オンラインストア'],
  ['producers.html', 'お取り扱い生産者'],
  ['blog.html', 'ブログ'],
  ['news.html', 'お知らせ'],
  ['about.html', '会社概要'],
  ['access.html', 'アクセス'],
  ['contact.html', 'お問い合わせ'],
];

export function Editor() {
  const { lang } = useSite();
  const [on, setOn] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [text, setText] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkHref, setLinkHref] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [needUrl, setNeedUrl] = useState(false);
  const [who, setWho] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const hover = useRef<HTMLElement | null>(null);

  const toast = useCallback((t: string, ms = 2600) => {
    setMsg(t);
    window.setTimeout(() => setMsg(''), ms);
  }, []);

  useEffect(() => {
    if (!editMode()) return;
    setOn(true);
    document.documentElement.setAttribute('data-edit', '1');
    loadOverrides(true);
    if (!bridgeUrl()) { setNeedUrl(true); return; }
    verify();
    return () => { document.documentElement.removeAttribute('data-edit'); };
  }, [toast]);

  /** ご本人かどうかを確かめます。管理画面は「自分のみ」なので、他の方では返事が来ません */
  const verify = useCallback(() => {
    openBridge().then((ok) => {
      if (!ok) { toast('編集できません。この端末でGoogleにログインしているかご確認ください。', 8000); return; }
      call('whoami', {}).then((mail: string) => {
        if (mail) { setWho(mail); setAllowed(true); toast(mail + ' として編集できます'); }
        else toast('アカウントを確認できませんでした', 6000);
      }).catch(() => toast('編集できません。お店のGoogleアカウントでログインしてください。', 8000));
    });
  }, [toast]);

  /** 触れる場所に印をつけます */
  useEffect(() => {
    if (!on || !allowed) return;
    const over = (e: MouseEvent) => {
      const el = pickable(e.target as HTMLElement);
      if (hover.current && hover.current !== el) hover.current.classList.remove('ed-hot');
      if (el && !el.closest('.ed-panel')) { el.classList.add('ed-hot'); hover.current = el; }
    };
    const click = (e: MouseEvent) => {
      const el = pickable(e.target as HTMLElement);
      if (!el || el.closest('.ed-panel')) return;
      e.preventDefault();
      e.stopPropagation();
      const imgKey = imageKey(el);
      if (imgKey) {
        const img = (el.tagName === 'IMG' ? el : el.querySelector('img')) as HTMLImageElement | null;
        setTarget({ key: imgKey, kind: 'image', el, current: img?.src || '' });
      } else {
        const k = el.getAttribute('data-i18n')!;
        const cur = (el.textContent || '').trim();
        setTarget({ key: k, kind: 'text', el, current: cur });
        setText(cur);
        const r = overrides()[k] || {};
        setLinkText(String(r['リンク文字(日本語)'] || ''));
        setLinkHref(String(r['リンク先'] || ''));
      }
    };
    document.addEventListener('mouseover', over, true);
    document.addEventListener('click', click, true);
    return () => {
      document.removeEventListener('mouseover', over, true);
      document.removeEventListener('click', click, true);
      if (hover.current) hover.current.classList.remove('ed-hot');
    };
  }, [on, allowed]);

  const saveText = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await call('saveText', { key: target.key, jp: text, linkText, linkHref });
      await loadOverrides(true);
      toast('下書きとして保存しました。鏡にだけ映っています');
      setTarget(null);
    } catch (e: any) { toast(e.message || '保存できませんでした', 6000); }
    setBusy(false);
  };

  const revert = async () => {
    if (!target) return;
    if (!confirm('この場所を、もとの文章に戻します。よろしいですか？')) return;
    setBusy(true);
    try {
      await call('removeOverride', { key: target.key });
      await loadOverrides(true);
      toast('もとに戻しました');
      setTarget(null);
    } catch (e: any) { toast(e.message || '戻せませんでした', 6000); }
    setBusy(false);
  };

  const publish = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await call('publish', { key: target.key });
      await loadOverrides(true);
      toast('本番に出しました');
      setTarget(null);
    } catch (e: any) { toast(e.message || '出せませんでした', 6000); }
    setBusy(false);
  };

  const pickPhoto = async (file: File) => {
    if (!target) return;
    setBusy(true);
    toast('写真を送っています…', 30000);
    try {
      const dataUrl = await shrink(file);
      const url = await call('uploadPhoto', { data: dataUrl, name: file.name });
      await call('saveImage', { key: target.key, url });
      await loadOverrides(true);
      toast('写真を入れ替えました');
      setTarget(null);
    } catch (e: any) { toast(e.message || '写真を入れられませんでした', 6000); }
    setBusy(false);
  };

  if (!on) return null;

  return (
    <>
      <div className="ed-bar">
        <span className="ed-badge">編集モード（鏡）</span>
        {who ? <span className="ed-who">{who}</span> : <span className="ed-who">確認中…</span>}
        <button className="ed-b" onClick={() => { loadOverrides(true).then(() => location.reload()); }}>読み直す</button>
        <button className="ed-b" onClick={() => setNeedUrl(true)}>つなぎ先</button>
        <button className="ed-b" onClick={() => { window.open(location.href.replace('/preview/', '/'), '_blank'); }}>本番を見る</button>
        <button className="ed-b" onClick={() => { sessionStorage.removeItem('sumura-edit'); location.href = location.pathname; }}>編集をやめる</button>
      </div>

      {needUrl ? (
        <div className="ed-panel ed-center">
          <h3>管理画面のURL</h3>
          <p className="ed-hint">
            保存はこのURLの中（Googleアカウントで守られた場所）で行います。
            管理画面を開いたときのアドレスを貼り付けてください。
          </p>
          <input value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)}
                 placeholder="https://script.google.com/macros/s/…/exec" />
          <div className="ed-row">
            <button className="ed-b ed-primary" onClick={() => {
              if (!/^https:\/\/script\.google\.com\/macros\/s\//.test(urlDraft.trim())) { toast('管理画面のURLを貼り付けてください'); return; }
              setBridgeUrl(urlDraft.trim()); setNeedUrl(false); verify();
            }}>保存する</button>
            <button className="ed-b" onClick={() => setNeedUrl(false)}>やめる</button>
          </div>
        </div>
      ) : null}

      {target ? (
        <div className="ed-panel">
          <div className="ed-key">{target.key}</div>
          {target.kind === 'text' ? (
            <>
              <label>文章（日本語）</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
              <p className="ed-hint">保存すると、英・仏・中・韓は自動で訳されます。</p>
              <label>リンクの文字（つけたいとき）</label>
              <input value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="例：詳しく見る" />
              <label>リンク先</label>
              <select value={PAGES.some((p) => p[0] === linkHref) ? linkHref : '__other'}
                      onChange={(e) => setLinkHref(e.target.value === '__other' ? '' : e.target.value)}>
                {PAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                <option value="__other">そのほかのURL…</option>
              </select>
              {!PAGES.some((p) => p[0] === linkHref) ? (
                <input value={linkHref} onChange={(e) => setLinkHref(e.target.value)} placeholder="https://…" />
              ) : null}
            </>
          ) : (
            <>
              <label>写真</label>
              {target.current ? <img className="ed-thumb" src={target.current} alt="" /> : null}
              <label className="ed-file">
                写真を選ぶ
                <input type="file" accept="image/*"
                       onChange={(e) => { const f = e.target.files?.[0]; if (f) pickPhoto(f); }} />
              </label>
              <p className="ed-hint">パソコンはフォルダから、スマホは写真アプリやカメラから選べます。</p>
            </>
          )}
          <div className="ed-row">
            {target.kind === 'text' ? (
              <button className="ed-b ed-primary" disabled={busy} onClick={saveText}>保存する</button>
            ) : null}
            <button className="ed-b" disabled={busy} onClick={publish}>本番に出す</button>
            <button className="ed-b" disabled={busy} onClick={revert}>もとに戻す</button>
            <button className="ed-b" onClick={() => setTarget(null)}>閉じる</button>
          </div>
        </div>
      ) : null}

      {msg ? <div className="ed-msg">{msg}</div> : null}
    </>
  );
}

/** 触れる場所か見分けます。文言と、ページ中のすべての写真が対象です */
function pickable(t: HTMLElement | null): HTMLElement | null {
  if (!t) return null;
  const marked = t.closest('[data-i18n],[data-img]') as HTMLElement | null;
  if (marked) return marked;
  const img = t.closest('img') as HTMLElement | null;
  return img && !img.closest('.ed-panel') ? img : null;
}

/**
 * 写真の見分け名。data-img があればそれ、無ければ画像の名前から作ります。
 * こうすることで、どのページの写真でも書き換えられます。
 */
export function imageKey(el: HTMLElement): string | null {
  const k = el.getAttribute('data-img');
  if (k) return k;
  if (el.tagName !== 'IMG') return null;
  const src = (el as HTMLImageElement).getAttribute('src') || '';
  const base = src.split('?')[0].split('/').slice(-2).join('/');
  return base ? 'img:' + base : null;
}

/** 写真は長辺1600pxまで縮めてから送ります */
function shrink(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = () => rej(new Error('写真を読めませんでした'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => rej(new Error('写真を読めませんでした'));
      img.onload = () => {
        const max = 1600;
        let { width: w, height: h } = img;
        if (w > max || h > max) { const r = Math.min(max / w, max / h); w = Math.round(w * r); h = Math.round(h * r); }
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d')!.drawImage(img, 0, 0, w, h);
        res(cv.toDataURL('image/jpeg', 0.85));
      };
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
}
