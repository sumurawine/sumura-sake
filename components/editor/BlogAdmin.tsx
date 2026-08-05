'use client';

import { useEffect, useState } from 'react';
import { call } from './Bridge';

type Row = Record<string, string>;

/** ブログの新規追加と修正。鏡サイトの編集モードから使います */
export function BlogAdmin({ toast }: { toast: (t: string, ms?: number) => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [row, setRow] = useState<Row | null>(null);

  const load = () => {
    setBusy(true);
    call('blogRows', {})
      .then((r: Row[]) => { setRows(Array.isArray(r) ? r.slice().reverse() : []); setBusy(false); })
      .catch((e: any) => { toast(e.message || '読み込めませんでした', 6000); setBusy(false); });
  };

  useEffect(() => { if (open) load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [open]);

  const today = () => {
    const d = new Date();
    return d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0');
  };

  const save = async () => {
    if (!row) return;
    if (!String(row['題名(日本語)'] || '').trim()) { toast('題名を入れてください'); return; }
    setBusy(true);
    toast('保存しています。英・仏・中・韓の訳も作りますので、30秒ほどお待ちください…', 90000);
    try {
      await call('blogSave', row);
      toast('保存しました。訳もできています');
      setRow(null); load();
    } catch (e: any) { toast(e.message || '保存できませんでした', 6000); }
    setBusy(false);
  };

  const remove = async () => {
    if (!row || !row['_row']) return;
    if (!window.confirm('この記事を消します。よろしいですか？')) return;
    setBusy(true);
    try {
      await call('blogRemove', { _row: row['_row'] });
      toast('消しました'); setRow(null); load();
    } catch (e: any) { toast(e.message || '消せませんでした', 6000); }
    setBusy(false);
  };

  const photo = async (file: File) => {
    setBusy(true);
    toast('写真を送っています…', 30000);
    try {
      const dataUrl = await shrinkImg(file);
      const url = await call('uploadPhoto', { data: dataUrl, name: file.name });
      setRow((r) => (r ? { ...r, '写真': String(url) } : r));
      toast('写真を載せました');
    } catch (e: any) { toast(e.message || '写真を送れませんでした', 6000); }
    setBusy(false);
  };

  return (
    <>
      <button className="ed-b" onClick={() => setOpen((v) => !v)}>ブログを更新</button>
      {open ? (
        <div className="ed-panel ed-blog">
          <h3>ブログ</h3>
          {row ? (
            <>
              <label>日付</label>
              <input value={row['日付'] || ''} onChange={(e) => setRow({ ...row, '日付': e.target.value })} placeholder="2026/08/05" />
              <label>カテゴリ（例：入荷、造り手、店のこと）</label>
              <input value={row['カテゴリ'] || ''} onChange={(e) => setRow({ ...row, 'カテゴリ': e.target.value })} placeholder="入荷" />
              <label>題名（日本語）</label>
              <input value={row['題名(日本語)'] || ''} onChange={(e) => setRow({ ...row, '題名(日本語)': e.target.value })} />
              <label>本文（日本語）</label>
              <textarea rows={10} value={row['本文(日本語)'] || ''} onChange={(e) => setRow({ ...row, '本文(日本語)': e.target.value })} />
              <label>写真</label>
              {row['写真'] ? <img className="ed-thumb" src={row['写真']} alt="" /> : null}
              <label className="ed-file">
                写真を選ぶ
                <input type="file" accept="image/*"
                       onChange={(e) => { const f = e.target.files?.[0]; if (f) photo(f); }} />
              </label>
              <label className="ed-check">
                <input type="checkbox" checked={(row['公開'] || '') === '公開'}
                       onChange={(e) => setRow({ ...row, '公開': e.target.checked ? '公開' : '下書き' })} />
                公開する（外すと下書き）
              </label>
              <p className="ed-hint">保存すると、英・仏・中・韓の訳が自動で作られます。</p>
              <div className="ed-row">
                <button className="ed-b ed-primary" disabled={busy} onClick={save}>保存する</button>
                {row['_row'] ? <button className="ed-b" disabled={busy} onClick={remove}>消す</button> : null}
                <button className="ed-b" onClick={() => setRow(null)}>一覧へ戻る</button>
              </div>
            </>
          ) : (
            <>
              <div className="ed-row">
                <button className="ed-b ed-primary" disabled={busy}
                        onClick={() => setRow({ '日付': today(), 'カテゴリ': '', '題名(日本語)': '', '本文(日本語)': '', '写真': '', '公開': '公開' })}>
                  新しい記事を書く
                </button>
                <button className="ed-b" disabled={busy} onClick={load}>読み直す</button>
                <button className="ed-b" onClick={() => setOpen(false)}>閉じる</button>
              </div>
              <ul className="ed-list">
                {rows.map((r) => (
                  <li key={r['_row']}>
                    <button className="ed-item" onClick={() => setRow({ ...r, '公開': r['公開'] || '公開' })}>
                      <span className="ed-d">{r['日付']}</span>
                      {(r['カテゴリ'] || '').trim() ? <span className="ed-c">{r['カテゴリ']}</span> : null}
                      <span className="ed-t">{r['題名(日本語)'] || '（題名なし）'}</span>
                      {(r['公開'] || '') === '下書き' ? <span className="ed-draft">下書き</span> : null}
                    </button>
                  </li>
                ))}
                {!rows.length && !busy ? <li className="ed-hint">まだ記事がありません。「新しい記事を書く」からどうぞ。</li> : null}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </>
  );
}

/** 写真は長辺1600pxまで縮めてから送ります */
function shrinkImg(file: File): Promise<string> {
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
