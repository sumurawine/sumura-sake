'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { call } from './Bridge';

type Row = Record<string, string>;

/* 表の見出し。分かりやすい呼び名を添えます */
const LABEL: Record<string, string> = {
  '題名(日本語)': '題名',
  '本文(日本語)': '本文',
  '写真': '写真',
  '日付と分類': '日付と種類',
};

/* よく使う種類。押すだけで入ります */
const CATS = ['雑感', '試飲', 'プリムール', '入荷', 'お知らせ', '催し', '造り手', '産地', '食卓', '店より'];

/* 2026.08.05 (水) のような書き方に整えます */
const DOW = ['日', '月', '火', '水', '木', '金', '土'];
function jpDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
  if (!m) return String(iso || '');
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return m[1] + '.' + m[2] + '.' + m[3] + ' (' + DOW[d.getDay()] + ')';
}
function isoDate(jp: string): string {
  const m = /(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})/.exec(String(jp || ''));
  if (!m) { const t = new Date(); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); }
  return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
}

/* 写真を、送れる大きさまで縮めます */
function shrink(file: File): Promise<string> {
  return new Promise((ok, ng) => {
    const fr = new FileReader();
    fr.onerror = () => ng(new Error('写真を読めませんでした'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => ng(new Error('写真を読めませんでした'));
      img.onload = () => {
        const max = 1600;
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * s);
        cv.height = Math.round(img.height * s);
        const cx = cv.getContext('2d');
        if (!cx) { ng(new Error('写真を縮められませんでした')); return; }
        cx.drawImage(img, 0, 0, cv.width, cv.height);
        ok(cv.toDataURL('image/jpeg', 0.86));
      };
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
}

/** ブログを、見えているそのままの頁の上で直します */
export function BlogInline({ toast }: { toast: (t: string, ms?: number) => void }) {
  const [here, setHere] = useState(false);        // この頁にブログの記事があるか
  const [rows, setRows] = useState<Row[] | null>(null);
  const [pick, setPick] = useState<{ row: string; field: string } | null>(null);
  const [draft, setDraft] = useState('');
  const [date, setDate] = useState('');
  const [cat, setCat] = useState('');
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(false);          // 消してよいか、の確かめ
  const file = useRef<HTMLInputElement | null>(null);
  const shot = useRef<string>('');                // 写真の入れ替え先

  /* この頁に記事があるかどうかを、いつも見ています */
  useEffect(() => {
    const look = () => setHere(!!document.querySelector('[data-blog-field]'));
    look();
    const mo = new MutationObserver(look);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  /* 表の中身をひととおり控えておきます */
  const load = useCallback(() => {
    call('blogRows', {})
      .then((r: Row[]) => setRows(Array.isArray(r) ? r : []))
      .catch(() => setRows([]));
  }, []);
  useEffect(() => { if (here && rows === null) load(); }, [here, rows, load]);

  const rowOf = useCallback((n: string): Row | null => {
    if (!rows) return null;
    return rows.find((x) => String(x['_row']) === String(n)) || null;
  }, [rows]);

  /* 触れる場所に、点線の枠と「ここを直せます」の札を出します */
  useEffect(() => {
    if (!here) return;
    const click = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest('[data-blog-field]') as HTMLElement | null;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      const n = el.getAttribute('data-blog-row') || '';
      const f = el.getAttribute('data-blog-field') || '';
      const r = rowOf(n);
      if (!r) { toast('少しお待ちください。記事を読み込んでいます…'); load(); return; }
      setAsk(false);
      shot.current = '';
      if (f === '写真') { setPick({ row: n, field: f }); return; }
      if (f === '日付と分類') {
        setDate(isoDate(String(r['日付'] || '')));
        setCat(String(r['カテゴリ'] || ''));
        setPick({ row: n, field: f });
        return;
      }
      setDraft(String(r[f] || ''));
      setPick({ row: n, field: f });
    };
    document.addEventListener('click', click, true);
    return () => document.removeEventListener('click', click, true);
  }, [here, rowOf, toast, load]);

  const done = (msg: string) => {
    toast(msg + ' 画面を新しくします…', 6000);
    try { sessionStorage.removeItem('sumura-content-v1'); } catch {}
    window.setTimeout(() => window.location.reload(), 900);
  };

  /* 直したものを表へ書き戻します。訳もここで作られます */
  const save = async (patch: Row, msg = '直しました。') => {
    const base = pick ? rowOf(pick.row) : null;
    if (!base) return;
    setBusy(true);
    toast('保存しています。英・仏・中・韓の訳も作りますので、30秒ほどそのままお待ちください…', 90000);
    try {
      await call('blogSave', { ...base, ...patch });
      done(msg);
    } catch (e: any) {
      toast(e?.message || '保存できませんでした。もう一度お試しください。', 8000);
      setBusy(false);
    }
  };

  const addNew = async () => {
    const t = new Date();
    const iso = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    setBusy(true);
    toast('新しい記事をこしらえています…', 60000);
    try {
      await call('blogSave', {
        '日付': jpDate(iso), 'カテゴリ': '雑感',
        '題名(日本語)': '新しい記事', '本文(日本語)': 'ここに本文を書いてください。',
        '写真': '', '公開': '下書き',
      });
      done('新しい記事をこしらえました。題名から順に直してください。');
    } catch (e: any) {
      toast(e?.message || 'こしらえられませんでした', 8000);
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!pick) return;
    setBusy(true);
    toast('この記事を消しています…', 60000);
    try {
      await call('blogRemove', { _row: pick.row });
      done('消しました。');
    } catch (e: any) {
      toast(e?.message || '消せませんでした', 8000);
      setBusy(false);
    }
  };

  const putPhoto = async (f: File) => {
    setBusy(true);
    toast('写真を送っています。少しお待ちください…', 60000);
    try {
      const data = await shrink(f);
      const url = await call('uploadPhoto', { data, name: f.name });
      shot.current = String(url);
      await save({ '写真': String(url) }, '写真を入れ替えました。');
    } catch (e: any) {
      toast(e?.message || '写真を送れませんでした', 8000);
      setBusy(false);
    }
  };

  if (!here) return null;

  const cur = pick ? rowOf(pick.row) : null;
  const title = cur ? String(cur['題名(日本語)'] || '（題名なし）') : '';
  const open = String(cur?.['公開'] || '').trim();
  const shown = open !== '下書き';

  return (
    <>
      <input ref={file} type="file" accept="image/*" style={{ display: 'none' }}
             onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) putPhoto(f); }} />

      <div className="bi-hint">
        <span className="bi-hint-t">なおしたいところを押してください</span>
        <button className="bi-new" onClick={addNew} disabled={busy}>＋ 新しい記事を書く</button>
      </div>

      {pick ? (
        <div className="bi-wrap" onClick={(e) => { if (e.target === e.currentTarget && !busy) setPick(null); }}>
          <div className="bi-panel">
            <div className="bi-head">
              <span className="bi-kind">{LABEL[pick.field] || pick.field}をなおす</span>
              <span className="bi-of">{title}</span>
            </div>

            {pick.field === '写真' ? (
              <div className="bi-body">
                <p className="bi-say">下の釦を押すと、お手元の写真を選べます。大きすぎる写真は、こちらで自動的に小さくします。</p>
                <button className="bi-go" disabled={busy} onClick={() => file.current?.click()}>写真を選ぶ</button>
                {String(cur?.['写真'] || '') ? (
                  <button className="bi-sub" disabled={busy} onClick={() => save({ '写真': '' }, '写真を外しました。')}>いまの写真を外す</button>
                ) : null}
              </div>
            ) : pick.field === '日付と分類' ? (
              <div className="bi-body">
                <label className="bi-lab">日づけ</label>
                <input className="bi-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <label className="bi-lab">種類</label>
                <div className="bi-cats">
                  {CATS.map((c) => (
                    <button key={c} className={cat === c ? 'bi-cat bi-on' : 'bi-cat'} onClick={() => setCat(c)}>{c}</button>
                  ))}
                </div>
                <input className="bi-in" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="ほかの言い方でも構いません" />
                <div className="bi-row">
                  <button className="bi-go" disabled={busy} onClick={() => save({ '日付': jpDate(date), 'カテゴリ': cat })}>これでなおす</button>
                  <button className="bi-sub" disabled={busy} onClick={() => setPick(null)}>やめる</button>
                </div>
              </div>
            ) : (
              <div className="bi-body">
                <p className="bi-say">
                  {pick.field === '題名(日本語)'
                    ? '日本語で書いてください。英語・フランス語・中国語・韓国語の訳は、保存のときにこちらで作ります。'
                    : '日本語で書いてください。行を変えたところは、そのまま行が変わります。訳は保存のときに作ります。'}
                </p>
                <textarea className={pick.field === '題名(日本語)' ? 'bi-ta bi-ta-1' : 'bi-ta'}
                          value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
                <div className="bi-row">
                  <button className="bi-go" disabled={busy} onClick={() => save({ [pick.field]: draft })}>これでなおす</button>
                  <button className="bi-sub" disabled={busy} onClick={() => setPick(null)}>やめる</button>
                </div>
              </div>
            )}

            <div className="bi-foot">
              <button className="bi-sub" disabled={busy}
                      onClick={() => save({ '公開': shown ? '下書き' : '公開' },
                        shown ? '下書きに戻しました。お客様には出ません。' : 'お客様に見えるようにしました。')}>
                {shown ? 'この記事をいったん隠す（下書きに戻す）' : 'この記事をお客様に見せる'}
              </button>
              {ask ? (
                <div className="bi-ask">
                  <span>「{title}」を消します。戻せません。よろしいですか。</span>
                  <button className="bi-del" disabled={busy} onClick={remove}>はい、消します</button>
                  <button className="bi-sub" disabled={busy} onClick={() => setAsk(false)}>いいえ</button>
                </div>
              ) : (
                <button className="bi-sub bi-danger" disabled={busy} onClick={() => setAsk(true)}>この記事を消す</button>
              )}
            </div>

            {busy ? <div className="bi-busy">ただいま作業しています。そのままお待ちください…</div> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
