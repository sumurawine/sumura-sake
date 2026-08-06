'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { useSite } from '@/components/Providers';
import { DOOR_SVG } from '@/lib/doorSvg';
import { MODERN, passwordWording } from '@/lib/decor';
import { isModern } from '@/lib/era';
import { pre } from '@/lib/slug';
import { apiGet } from '@/lib/api';
import { unlock, canLock } from '@/lib/roomCrypto';
import type { Lang } from '@/lib/i18n';

/* ゲームコーナーだけは中身がプログラムのため、包めません。
   ここは今までどおり「合言葉を通った人だけ入れる扉」でございます。 */
const GAME_HASH = '53772198d0676245365817688d71eb1704040daaf33dfdaf2a528ba56494cf2a';

type Room = { title: string; body: string };

const M: Record<Lang, Record<string, string>> = {
  jp: { empty: '合言葉を入力してください。', bad: '開きません。合言葉が違うようです。', good: '…鍵が外れました。', locked: '直接は入れません。合言葉をお願いします。', err: 'お使いの環境では開けられません。', busy: '…鍵を回しています。', ask: 'この件について問い合わせる', shut: '扉を閉める', net: 'つながりませんでした。少し置いてもう一度お願いいたします。' },
  en: { empty: 'Please enter the passphrase.', bad: 'It will not open. That is not the passphrase.', good: '…the lock gives way.', locked: 'You cannot enter directly. The passphrase, please.', err: 'This browser cannot open it.', busy: '…turning the key.', ask: 'Enquire about this', shut: 'Close the door', net: 'We could not reach the shop. Please try again shortly.' },
  fr: { empty: 'Veuillez saisir le mot de passe.', bad: 'Cela ne s’ouvre pas. Ce n’est pas le bon mot.', good: '…la serrure cède.', locked: 'Impossible d’entrer directement. Le mot de passe, s’il vous plaît.', err: 'Ce navigateur ne peut pas l’ouvrir.', busy: '…la clé tourne.', ask: 'Nous écrire à ce sujet', shut: 'Fermer la porte', net: 'Connexion impossible. Merci de réessayer dans un instant.' },
  zh: { empty: '请输入暗号。', bad: '打不开。暗号似乎不对。', good: '……锁开了。', locked: '无法直接进入。请说出暗号。', err: '当前环境无法开启。', busy: '……正在转动钥匙。', ask: '就此事咨询', shut: '关上门', net: '连接失败，请稍后再试。' },
  ko: { empty: '암호를 입력해 주세요.', bad: '열리지 않습니다. 암호가 다른 것 같습니다.', good: '…자물쇠가 풀렸습니다.', locked: '직접 들어올 수 없습니다. 암호를 말씀해 주세요.', err: '이 환경에서는 열 수 없습니다.', busy: '…열쇠를 돌리고 있습니다.', ask: '이 건에 대해 문의하기', shut: '문을 닫다', net: '연결하지 못했습니다. 잠시 후 다시 시도해 주세요.' },
};

async function sha256(s: string) {
  const b = new TextEncoder().encode(s);
  const h = await crypto.subtle.digest('SHA-256', b);
  return Array.from(new Uint8Array(h)).map((x) => ('0' + x.toString(16)).slice(-2)).join('');
}
const norm = (s: string) => {
  let v = String(s || '');
  try { v = v.normalize('NFKC'); } catch { /* しずかに */ }
  return v.trim().toLowerCase();
};

export function SecretPage() {
  const { lang, eraView } = useSite();
  const router = useRouter();
  const params = useSearchParams();
  const modern = isModern(eraView as any);
  const p = pre(lang);

  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<{ k: string; cls: string } | null>(null);
  const [shake, setShake] = useState(0);
  const [opening, setOpening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxes = useRef<string[] | null>(null);

  const t = (k: string) => passwordWording((M[lang] || M.jp)[k], eraView);

  useEffect(() => {
    if (params?.get('locked') === '1') setMsg({ k: 'locked', cls: 'bad' });
  }, [params]);
  useEffect(() => { setMsg((m) => (m ? { ...m } : m)); }, [lang]);

  /* 包みは前もって取り寄せておきます。中身は包まれたままです */
  useEffect(() => {
    let dead = false;
    apiGet({ action: 'rooms' })
      .then((r) => { if (!dead) boxes.current = Array.isArray(r?.rooms) ? r.rooms.map((x: any) => String(x.box || '')) : []; })
      .catch(() => { if (!dead) boxes.current = []; });
    return () => { dead = true; };
  }, []);

  const knock = async () => {
    const v = norm(pw);
    if (!v) { setMsg({ k: 'empty', cls: 'bad' }); setShake((s) => s + 1); return; }
    if (!canLock()) { setMsg({ k: 'err', cls: 'bad' }); return; }

    setBusy(true);
    setMsg({ k: 'busy', cls: '' });

    /* ゲームコーナーだけは扉のまま */
    try {
      if ((await sha256(v)) === GAME_HASH) {
        setMsg({ k: 'good', cls: 'good' });
        try { sessionStorage.setItem('sumura-room-game', '1'); } catch { /* しずかに */ }
        setOpening(true);
        setTimeout(() => router.push(p + '/room-game'), 950);
        return;
      }
    } catch { /* しずかに */ }

    /* 包みが未着なら、ここで取り寄せます */
    let list = boxes.current;
    if (!list) {
      try {
        const r = await apiGet({ action: 'rooms' });
        list = Array.isArray(r?.rooms) ? r.rooms.map((x: any) => String(x.box || '')) : [];
        boxes.current = list;
      } catch {
        setBusy(false); setMsg({ k: 'net', cls: 'bad' }); return;
      }
    }

    for (const box of list) {
      const out = await unlock(v, box);
      if (out === null) continue;
      let got: Room | null = null;
      try { const o = JSON.parse(out); got = { title: String(o.title || ''), body: String(o.body || '') }; }
      catch { got = { title: '', body: out }; }
      setBusy(false);
      setMsg({ k: 'good', cls: 'good' });
      setOpening(true);
      setTimeout(() => setRoom(got), 950);
      return;
    }

    setBusy(false);
    setMsg({ k: 'bad', cls: 'bad' });
    setShake((s) => s + 1);
    setPw('');
  };

  const shut = () => {
    setRoom(null); setOpening(false); setPw(''); setMsg(null);
  };

  if (room) {
    return (
      <Shell>
        <div className="panel rm-room">
          {room.title ? <h1 className="rm-room-t">{room.title}</h1> : null}
          {room.body.split(/\n{2,}/).map((par, i) => (
            <p key={i} className="rm-room-p">
              {par.split(/\n/).map((line, j) => (
                <span key={j}>{j ? <br /> : null}{line}</span>
              ))}
            </p>
          ))}
          <p className="rm-room-cta">
            <Link className="btn" href={`${p}/contact?item=${encodeURIComponent(room.title || '鍵のかかった部屋')}`}>{t('ask')}</Link>
          </p>
          <p className="rm-room-shut"><button className="btn" onClick={shut}>{t('shut')}</button></p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="panel" style={{ textAlign: 'center' }}>
        {modern
          ? <div className="pixhead" data-i18n="sc-head">{MODERN[lang].priv}</div>
          : <T k="sc-head" as="div" kind="head" className="pixhead" />}

        <div id="modern-lock">
          <div className="ml-key">&#128274;</div>
          <div className="ml-t" />
        </div>

        <div id="door-wrap">
          <div
            id="stone-door"
            key={shake}
            className={`${opening ? 'open ' : ''}${shake ? 'shake' : ''}`.trim() || undefined}
            onClick={() => inputRef.current?.focus()}
            dangerouslySetInnerHTML={{ __html: DOOR_SVG }}
          />
        </div>

        {modern
          ? <p data-i18n="sc-ask">{MODERN[lang].ask}</p>
          : <T k="sc-ask" as="p" />}

        <div style={{ maxWidth: 280, margin: '0 auto' }}>
          <input
            ref={inputRef}
            id="pw"
            className="field"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="＊＊＊＊＊＊"
            style={{ textAlign: 'center', letterSpacing: 2 }}
            value={pw}
            disabled={busy}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') knock(); }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn" id="sd-open" onClick={knock} disabled={busy}>
            <T k="sc-open" as="span" kind="btn" />
          </button>
        </div>
        <div id="sd-msg" className={msg?.cls}>{msg ? t(msg.k) : ''}</div>
      </div>
    </Shell>
  );
}
