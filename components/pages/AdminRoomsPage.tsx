'use client';

import { useCallback, useEffect, useState } from 'react';
import { call } from '@/components/editor/Bridge';
import { lock, unlock, canLock } from '@/lib/roomCrypto';

type Row = { _row: number; name: string; box: string };

/* 鍵のかかった部屋の管理。
   合言葉と本文は、この画面の中で包んでから送ります。
   お店のシートに残るのは包んだ文字列だけで、
   合言葉を知らないかぎり、誰にも（私にも）読めません。 */
export function AdminRoomsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState('');
  const [say, setSay] = useState('');
  const [busy, setBusy] = useState(false);

  /* 新しく作る */
  const [nName, setNName] = useState('');
  const [nPass, setNPass] = useState('');
  const [nTitle, setNTitle] = useState('');
  const [nBody, setNBody] = useState('');

  /* 開いて直す */
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [ePass, setEPass] = useState('');
  const [eTitle, setETitle] = useState('');
  const [eBody, setEBody] = useState('');
  const [eReady, setEReady] = useState(false);

  const load = useCallback(() => {
    setErr('');
    call('roomsRows', {})
      .then((r: any) => setRows(Array.isArray(r?.rows) ? r.rows : []))
      .catch((e: any) => setErr(String(e?.message || e)));
  }, []);

  useEffect(() => { load(); }, [load]);

  const done = (m: string) => { setSay(m); setBusy(false); setTimeout(() => setSay(''), 4000); load(); };
  const oops = (e: any) => { setErr(String(e?.message || e)); setBusy(false); };

  const add = async () => {
    if (!canLock()) { setErr('お使いの環境では鍵をかけられません。'); return; }
    if (!nName.trim()) { setErr('部屋の名前をご記入ください。'); return; }
    if (nPass.trim().length < 4) { setErr('合言葉は四文字以上でお願いいたします。'); return; }
    if (!nBody.trim()) { setErr('中に置く文をご記入ください。'); return; }
    setBusy(true); setErr('');
    try {
      const box = await lock(nPass, JSON.stringify({ title: nTitle.trim(), body: nBody }));
      await call('roomsSave', { name: nName.trim(), box });
      setNName(''); setNPass(''); setNTitle(''); setNBody('');
      done('新しい部屋をこしらえました。');
    } catch (e) { oops(e); }
  };

  const openIt = async (r: Row) => {
    if (!ePass.trim()) { setErr('合言葉をご記入ください。'); return; }
    setBusy(true); setErr('');
    const out = await unlock(ePass, r.box);
    setBusy(false);
    if (out === null) { setErr('開きません。合言葉が違うようです。'); return; }
    let o: any = {};
    try { o = JSON.parse(out); } catch { o = { title: '', body: out }; }
    setETitle(String(o.title || ''));
    setEBody(String(o.body || ''));
    setEReady(true);
  };

  const saveIt = async (r: Row) => {
    setBusy(true); setErr('');
    try {
      const box = await lock(ePass, JSON.stringify({ title: eTitle.trim(), body: eBody }));
      await call('roomsSave', { _row: r._row, name: r.name, box });
      setOpenRow(null); setEReady(false); setEPass(''); setETitle(''); setEBody('');
      done('直しました。');
    } catch (e) { oops(e); }
  };

  const killIt = async (r: Row) => {
    if (!window.confirm('「' + r.name + '」を消します。よろしいですか。')) return;
    setBusy(true); setErr('');
    try { await call('roomsRemove', { _row: r._row }); done('消しました。'); } catch (e) { oops(e); }
  };

  return (
    <div className="rm-wrap">
      <div className="rm-head">
        <div className="rm-kick">すむら酒店</div>
        <h1 className="rm-title">鍵のかかった部屋</h1>
        <p className="rm-lead">
          合言葉を知っている方だけが読める部屋です。<br />
          中の文は、この画面で鍵をかけてからお預けします。合言葉を忘れると、どなたにも開けられなくなります。
        </p>
      </div>

      {err ? <p className="ar-err">{err}</p> : null}
      {say ? <p className="ar-ok">{say}</p> : null}

      <section className="ar-box">
        <h2>いまある部屋</h2>
        {rows === null ? <p className="ar-dim">読んでいます…</p> : null}
        {rows && !rows.length ? <p className="ar-dim">まだ一つもございません。</p> : null}
        {rows?.map((r) => (
          <div className="ar-row" key={r._row}>
            <div className="ar-row-h">
              <b>{r.name}</b>
              <span>
                <button className="btn" disabled={busy} onClick={() => { setOpenRow(openRow === r._row ? null : r._row); setEReady(false); setEPass(''); setErr(''); }}>
                  {openRow === r._row ? '閉じる' : '開いて直す'}
                </button>{' '}
                <button className="btn ar-kill" disabled={busy} onClick={() => killIt(r)}>消す</button>
              </span>
            </div>

            {openRow === r._row ? (
              <div className="ar-open">
                {!eReady ? (
                  <>
                    <label>合言葉</label>
                    <input className="field" type="password" autoComplete="off" value={ePass} onChange={(e) => setEPass(e.target.value)} />
                    <p><button className="btn" disabled={busy} onClick={() => openIt(r)}>開ける</button></p>
                  </>
                ) : (
                  <>
                    <label>見出し</label>
                    <input className="field" value={eTitle} onChange={(e) => setETitle(e.target.value)} />
                    <label>本文</label>
                    <textarea className="field ar-ta" value={eBody} onChange={(e) => setEBody(e.target.value)} />
                    <p><button className="btn" disabled={busy} onClick={() => saveIt(r)}>この合言葉のまま直す</button></p>
                  </>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </section>

      <section className="ar-box">
        <h2>新しい部屋をこしらえる</h2>
        <label>部屋の名前<span className="ar-dim">（控室の一覧に出るだけの名札です）</span></label>
        <input className="field" value={nName} onChange={(e) => setNName(e.target.value)} placeholder="秘密のセラー在庫" />
        <label>合言葉<span className="ar-dim">（お客様にお伝えする言葉。忘れると開けられません）</span></label>
        <input className="field" type="text" autoComplete="off" value={nPass} onChange={(e) => setNPass(e.target.value)} />
        <label>見出し</label>
        <input className="field" value={nTitle} onChange={(e) => setNTitle(e.target.value)} placeholder="秘密のセラー在庫" />
        <label>中に置く文</label>
        <textarea className="field ar-ta" value={nBody} onChange={(e) => setNBody(e.target.value)} placeholder="ここに書いた文が、合言葉を通った方にだけ見えます。&#10;&#10;行を空けると段落が変わります。" />
        <p><button className="btn" disabled={busy} onClick={add}>こしらえる</button></p>
      </section>

      <p className="ar-note">
        合言葉は、この画面を離れるとどこにも残りません。お店の控えとして、別に書き留めておかれることをおすすめいたします。
      </p>
    </div>
  );
}
