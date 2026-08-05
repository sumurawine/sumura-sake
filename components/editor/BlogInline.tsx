'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { call } from './Bridge';

type Row = Record<string, string>;

/* どの表を相手にしているか。目印 data-sheet で見分けます */
type Sheet = 'blog' | 'news';

const SHEET_NAME: Record<Sheet, string> = { blog: 'ブログの記事', news: 'お知らせ' };
const NEW_LABEL: Record<Sheet, string> = { blog: '＋ 新しい記事を書く', news: '＋ 新しいお知らせを出す' };

/* 表の見出しに、分かりやすい呼び名を添えます */
const LABEL: Record<string, string> = {
  '題名(日本語)': '題名',
  '本文(日本語)': '本文',
  '写真': '写真',
  '日付と分類': '日付と種類',
  '日付': '日づけ',
  'リンク': 'ボタンのリンク',
};

/* よく使う種類。押すだけで入ります */
const CATS = ['雑感', '試飲', 'プリムール', '入荷', 'お知らせ', '催し', '造り手', '産地', '食卓', '店より'];

/* サイトの中の行き先。押すだけで本文に入ります */
const LINKS: Array<[string, string]> = [
  ['/store', 'オンラインストア'],
  ['/producers', 'お取り扱い生産者'],
  ['/blog', 'ブログ'],
  ['/news', 'お知らせ'],
  ['/about', '会社概要'],
  ['/access', 'アクセス'],
  ['/contact', 'お問い合わせ'],
  ['/virtual', 'バーチャル店舗'],
  ['/mukashi', '昔日のすむら酒店'],
  ['/legal', '特定商取引法に基づく表記'],
];

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

/** ブログとお知らせを、見えているそのままの頁の上で直します */
export function BlogInline({ toast }: { toast: (t: string, ms?: number) => void }) {
  const [sheet, setSheet] = useState<Sheet | null>(null);        // この頁にあるのはどの表か
  const [rows, setRows] = useState<Record<string, Row[]>>({});
  const [pick, setPick] = useState<{ sheet: Sheet; row: string; field: string } | null>(null);
  const [draft, setDraft] = useState('');
  const [date, setDate] = useState('');
  const [cat, setCat] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkHref, setLinkHref] = useState('');
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(false);
  const [link, setLink] = useState(false);
  const file = useRef<HTMLInputElement | null>(null);
  const box = useRef<HTMLTextAreaElement | null>(null);

  /* この頁にどの表があるかを、いつも見ています */
  useEffect(() => {
    const look = () => {
      const el = document.querySelector('[data-field]') as HTMLElement | null;
      setSheet(el ? ((el.getAttribute('data-sheet') as Sheet) || 'blog') : null);
    };
    look();
    const mo = new MutationObserver(look);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  /* 表の中身をひととおり控えておきます */
  const load = useCallback((s: Sheet) => {
    call(s + 'Rows', {})
      .then((r: Row[]) => setRows((o) => ({ ...o, [s]: Array.isArray(r) ? r : [] })))
      .catch(() => setRows((o) => ({ ...o, [s]: [] })));
  }, []);
  useEffect(() => { if (sheet && !rows[sheet]) load(sheet); }, [sheet, rows, load]);

  const rowOf = useCallback((s: Sheet, n: string): Row | null => {
    const list = rows[s];
    if (!list) return null;
    return list.find((x) => String(x['_row']) === String(n)) || null;
  }, [rows]);

  /* 押されたところを見分けて、その場に窓を出します */
  useEffect(() => {
    if (!sheet) return;
    const click = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest('[data-field]') as HTMLElement | null;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      const s = ((el.getAttribute('data-sheet') as Sheet) || 'blog');
      const n = el.getAttribute('data-row') || '';
      const f = el.getAttribute('data-field') || '';
      const r = rowOf(s, n);
      if (!r) { toast('少しお待ちください。中身を読み込んでいます…'); load(s); return; }
      setAsk(false); setLink(false);
      if (f === '写真') { setPick({ sheet: s, row: n, field: f }); return; }
      if (f === '日付と分類') {
        setDate(isoDate(String(r['日付'] || '')));
        setCat(String(r['カテゴリ'] || ''));
        setPick({ sheet: s, row: n, field: f }); return;
      }
      if (f === '日付') { setDate(isoDate(String(r['日付'] || ''))); setPick({ sheet: s, row: n, field: f }); return; }
      if (f === 'リンク') {
        setLinkText(String(r['リンクの文字(日本語)'] || ''));
        setLinkHref(String(r['リンク先'] || ''));
        setPick({ sheet: s, row: n, field: f }); return;
      }
      setDraft(String(r[f] || ''));
      setPick({ sheet: s, row: n, field: f });
    };
    document.addEventListener('click', click, true);
    return () => document.removeEventListener('click', click, true);
  }, [sheet, rowOf, toast, load]);

  const done = (msg: string) => {
    toast(msg + ' 画面を新しくします…', 6000);
    try { sessionStorage.removeItem('sumura-content-v1'); } catch {}
    window.setTimeout(() => window.location.reload(), 900);
  };

  const oops = (e: any) => {
    const m = String(e?.message || '');
    if (/unknown action|不明/.test(m)) {
      toast('この表を直す準備が、まだ管理表の側で整っていません。店主にお伝えください。', 10000);
    } else {
      toast(m || '保存できませんでした。もう一度お試しください。', 8000);
    }
    setBusy(false);
  };

  /* 直したものを表へ書き戻します。訳もここで作られます */
  const save = async (patch: Row, msg = '直しました。') => {
    if (!pick) return;
    const base = rowOf(pick.sheet, pick.row);
    if (!base) return;
    setBusy(true);
    toast('保存しています。英・仏・中・韓の訳も作りますので、30秒ほどそのままお待ちください…', 90000);
    try { await call(pick.sheet + 'Save', { ...base, ...patch }); done(msg); } catch (e) { oops(e); }
  };

  const addNew = async () => {
    if (!sheet) return;
    const t = new Date();
    const iso = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    setBusy(true);
    toast('新しく一つこしらえています…', 60000);
    try {
      await call(sheet + 'Save', sheet === 'blog'
        ? { '日付': jpDate(iso), 'カテゴリ': '雑感', '題名(日本語)': '新しい記事',
            '本文(日本語)': 'ここに本文を書いてください。', '写真': '', '公開': '下書き' }
        : { '日付': jpDate(iso), '題名(日本語)': '新しいお知らせ',
            '本文(日本語)': 'ここに本文を書いてください。', 'リンクの文字(日本語)': '', 'リンク先': '' });
      done('こしらえました。題名から順に直してください。');
    } catch (e) { oops(e); }
  };

  const remove = async () => {
    if (!pick) return;
    setBusy(true);
    toast('消しています…', 60000);
    try { await call(pick.sheet + 'Remove', { _row: pick.row }); done('消しました。'); } catch (e) { oops(e); }
  };

  const putPhoto = async (f: File) => {
    setBusy(true);
    toast('写真を送っています。少しお待ちください…', 60000);
    try {
      const data = await shrink(f);
      const url = await call('uploadPhoto', { data, name: f.name });
      await save({ '写真': String(url) }, '写真を入れ替えました。');
    } catch (e) { oops(e); }
  };

  /* 選んだ行き先を、いま文字を置いている場所へ差し込みます */
  const insert = (to: string, name: string) => {
    const el = box.current;
    const mark = '[' + name + '](' + to + ')';
    if (!el) { setDraft((d) => d + mark); return; }
    const a = el.selectionStart ?? draft.length;
    const b = el.selectionEnd ?? a;
    const sel = draft.slice(a, b).trim();
    const put = sel ? '[' + sel + '](' + to + ')' : mark;
    setDraft(draft.slice(0, a) + put + draft.slice(b));
    setLink(false);
    window.setTimeout(() => { el.focus(); const at = a + put.length; try { el.setSelectionRange(at, at); } catch {} }, 0);
  };

  if (!sheet) return null;

  const cur = pick ? rowOf(pick.sheet, pick.row) : null;
  const title = cur ? String(cur['題名(日本語)'] || '（題名なし）') : '';
  const open = String(cur?.['公開'] || '').trim();
  const shown = open !== '下書き';
  const isBlog = pick?.sheet === 'blog';

  return (
    <>
      <input ref={file} type="file" accept="image/*" style={{ display: 'none' }}
             onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) putPhoto(f); }} />

      <div className="bi-hint">
        <span className="bi-hint-t">なおしたいところを押してください</span>
        <button className="bi-new" onClick={addNew} disabled={busy}>{NEW_LABEL[sheet]}</button>
      </div>

      {pick ? (
        <div className="bi-wrap" onClick={(e) => { if (e.target === e.currentTarget && !busy) setPick(null); }}>
          <div className="bi-panel">
            <div className="bi-head">
              <span className="bi-kind">{LABEL[pick.field] || pick.field}をなおす</span>
              <span className="bi-of">{SHEET_NAME[pick.sheet]}：{title}</span>
            </div>

            {pick.field === '写真' ? (
              <div className="bi-body">
                <p className="bi-say">下の釦を押すと、お手元の写真を選べます。大きすぎる写真は、こちらで自動的に小さくします。</p>
                <button className="bi-go" disabled={busy} onClick={() => file.current?.click()}>写真を選ぶ</button>
                {String(cur?.['写真'] || '') ? (
                  <button className="bi-sub" disabled={busy} onClick={() => save({ '写真': '' }, '写真を外しました。')}>いまの写真を外す</button>
                ) : null}
              </div>
            ) : pick.field === 'リンク' ? (
              <div className="bi-body">
                <p className="bi-say">お知らせの下に出る、押せる文字です。空にすると出ません。</p>
                <label className="bi-lab">押せる文字</label>
                <input className="bi-in" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="例：くわしくはこちら" />
                <label className="bi-lab">行き先</label>
                <div className="bi-cats">
                  {LINKS.map(([to, name]) => (
                    <button key={to} className={linkHref === to ? 'bi-cat bi-on' : 'bi-cat'}
                            onClick={() => { setLinkHref(to); if (!linkText.trim()) setLinkText(name); }}>{name}</button>
                  ))}
                </div>
                <input className="bi-in" value={linkHref} onChange={(e) => setLinkHref(e.target.value)} placeholder="ほかの行き先も入れられます" />
                <div className="bi-row">
                  <button className="bi-go" disabled={busy}
                          onClick={() => save({ 'リンクの文字(日本語)': linkText, 'リンク先': linkHref })}>これでなおす</button>
                  <button className="bi-sub" disabled={busy} onClick={() => setPick(null)}>やめる</button>
                </div>
              </div>
            ) : pick.field === '日付と分類' || pick.field === '日付' ? (
              <div className="bi-body">
                <label className="bi-lab">日づけ</label>
                <input className="bi-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                {pick.field === '日付と分類' ? (
                  <>
                    <label className="bi-lab">種類</label>
                    <div className="bi-cats">
                      {CATS.map((c) => (
                        <button key={c} className={cat === c ? 'bi-cat bi-on' : 'bi-cat'} onClick={() => setCat(c)}>{c}</button>
                      ))}
                    </div>
                    <input className="bi-in" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="ほかの言い方でも構いません" />
                  </>
                ) : null}
                <div className="bi-row">
                  <button className="bi-go" disabled={busy}
                          onClick={() => save(pick.field === '日付' ? { '日付': jpDate(date) } : { '日付': jpDate(date), 'カテゴリ': cat })}>これでなおす</button>
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
                <textarea ref={box} className={pick.field === '題名(日本語)' ? 'bi-ta bi-ta-1' : 'bi-ta'}
                          value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
                {pick.field === '本文(日本語)' ? (
                  <div className="bi-links">
                    <button className="bi-sub" onClick={() => setLink((v) => !v)}>
                      {link ? '閉じる' : 'サイトの中のページへリンクを入れる'}
                    </button>
                    {link ? (
                      <>
                        <p className="bi-say" style={{ margin: '12px 0 8px' }}>
                          入れたい場所に文字の位置を置いてから、下から選んでください。
                        </p>
                        <div className="bi-cats">
                          {LINKS.map(([to, name]) => (
                            <button key={to} className="bi-cat" onClick={() => insert(to, name)}>{name}</button>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}
                <div className="bi-row">
                  <button className="bi-go" disabled={busy} onClick={() => save({ [pick.field]: draft })}>これでなおす</button>
                  <button className="bi-sub" disabled={busy} onClick={() => setPick(null)}>やめる</button>
                </div>
              </div>
            )}

            <div className="bi-foot">
              {isBlog ? (
                <button className="bi-sub" disabled={busy}
                        onClick={() => save({ '公開': shown ? '下書き' : '公開' },
                          shown ? '下書きに戻しました。お客様には出ません。' : 'お客様に見えるようにしました。')}>
                  {shown ? 'この記事をいったん隠す（下書きに戻す）' : 'この記事をお客様に見せる'}
                </button>
              ) : null}
              {ask ? (
                <div className="bi-ask">
                  <span>「{title}」を消します。戻せません。よろしいですか。</span>
                  <button className="bi-del" disabled={busy} onClick={remove}>はい、消します</button>
                  <button className="bi-sub" disabled={busy} onClick={() => setAsk(false)}>いいえ</button>
                </div>
              ) : (
                <button className="bi-sub bi-danger" disabled={busy} onClick={() => setAsk(true)}>
                  {isBlog ? 'この記事を消す' : 'このお知らせを消す'}
                </button>
              )}
            </div>

            {busy ? <div className="bi-busy">ただいま作業しています。そのままお待ちください…</div> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
