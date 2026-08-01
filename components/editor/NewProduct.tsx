'use client';

import { useState } from 'react';
import { editMode, loadOverrides } from '@/lib/overrides';
import { call } from './Bridge';

const CATS: Array<[string, string]> = [
  ['フランス ブルゴーニュ', 'フランス ブルゴーニュ'],
  ['フランス コート デュ ローヌ', 'フランス コート デュ ローヌ'],
  ['フランス ジュラ', 'フランス ジュラ'],
  ['フランス ヴァル ド ロワール', 'フランス ヴァル ド ロワール'],
  ['フランス アルザス', 'フランス アルザス'],
  ['フランス ボルドー', 'フランス ボルドー'],
  ['イタリア', 'イタリア'],
  ['アメリカ', 'アメリカ'],
  ['オーストラリア', 'オーストラリア'],
  ['ウイスキー', 'ウイスキー'],
  ['その他', 'その他'],
];

/** オンラインストアの左上に出る「＋ 出品する」 */
export function NewProduct() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [f, setF] = useState({
    name: '', price: '', cat: 'フランス ブルゴーニュ', prod: '', stock: '1', photo: '', desc: '',
  });

  if (!editMode()) return null;
  const set = (k: string, v: string) => setF((o) => ({ ...o, [k]: v }));
  const toast = (t: string, ms = 3000) => { setMsg(t); window.setTimeout(() => setMsg(''), ms); };

  const photo = async (file: File) => {
    setBusy(true); toast('写真を送っています…', 30000);
    try {
      const d = await shrink(file);
      const url = await call('uploadPhoto', { data: d, name: file.name });
      set('photo', url); toast('写真を入れました');
    } catch (e: any) { toast(e.message || '写真を送れませんでした', 6000); }
    setBusy(false);
  };

  const submit = async () => {
    if (!f.name.trim()) { toast('商品名を入れてください'); return; }
    setBusy(true); toast('登録しています…', 60000);
    try {
      await call('addProduct', f);
      await loadOverrides(true);
      toast('出品しました。少ししてから読み直すと並びます', 5000);
      setF({ name: '', price: '', cat: f.cat, prod: '', stock: '1', photo: '', desc: '' });
      setOpen(false);
    } catch (e: any) { toast(e.message || '登録できませんでした', 6000); }
    setBusy(false);
  };

  return (
    <>
      <button className="ed-new" onClick={() => setOpen(true)}>＋ 出品する</button>
      {open ? (
        <div className="ed-panel ed-center ed-wide">
          <h3>商品を出品する</h3>
          <label>商品名（日本語）</label>
          <input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="例：2020年 ジュヴレ・シャンベルタン" />
          <label>価格</label>
          <input value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="例：12,000円" />
          <label>産地</label>
          <select value={f.cat} onChange={(e) => set('cat', e.target.value)}>
            {CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <label>生産者</label>
          <input value={f.prod} onChange={(e) => set('prod', e.target.value)} placeholder="例：ドメーヌ ジョルジュ ルーミエ" />
          <label>在庫（0 と書くと在庫切れ）</label>
          <input value={f.stock} onChange={(e) => set('stock', e.target.value)} />
          <label>写真</label>
          {f.photo ? <img className="ed-thumb" src={f.photo} alt="" /> : null}
          <label className="ed-file">
            写真を選ぶ
            <input type="file" accept="image/*" onChange={(e) => { const x = e.target.files?.[0]; if (x) photo(x); }} />
          </label>
          <label>説明（日本語）</label>
          <textarea rows={5} value={f.desc} onChange={(e) => set('desc', e.target.value)}
                    placeholder="ふつうの文章で大丈夫です。英・仏・中・韓は自動で訳します。" />
          <div className="ed-row">
            <button className="ed-b ed-primary" disabled={busy} onClick={submit}>登録する</button>
            <button className="ed-b" onClick={() => setOpen(false)}>やめる</button>
          </div>
        </div>
      ) : null}
      {msg ? <div className="ed-msg">{msg}</div> : null}
    </>
  );
}

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
