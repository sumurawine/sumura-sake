'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { useSite } from '@/components/Providers';
import { DOOR_SVG } from '@/lib/doorSvg';
import { MODERN, passwordWording } from '@/lib/decor';
import { isModern } from '@/lib/era';
import type { Lang } from '@/lib/i18n';

const ROOMS: Record<string, [string, string]> = {
  a86a7c940fe3e2310fc84c96f941e24a93a9c1f67382dc1b71ce069c74279cf1: ['/room-cellar', 'cellar'],
  '21025feae1cad394b34b1d49ead42fbb08fa7a0c75876c988ee7b8c7306b8c9a': ['/room-primeur', 'primeur'],
  b4a1a978cd0c687ad9761fe81d8051edc5eff0b1be680926f9dd91158e06861b: ['/room-note', 'note'],
  '53772198d0676245365817688d71eb1704040daaf33dfdaf2a528ba56494cf2a': ['/room-game', 'game'],
};

const M: Record<Lang, Record<string, string>> = {
  jp: { empty: '合言葉を入力してください。', bad: '開きません。合言葉が違うようです。', good: '…鍵が外れました。', locked: '直接は入れません。合言葉をお願いします。', err: 'お使いの環境では開けられません。' },
  en: { empty: 'Please enter the passphrase.', bad: 'It will not open. That is not the passphrase.', good: '…the lock gives way.', locked: 'You cannot enter directly. The passphrase, please.', err: 'This browser cannot open it.' },
  fr: { empty: 'Veuillez saisir le mot de passe.', bad: 'Cela ne s’ouvre pas. Ce n’est pas le bon mot.', good: '…la serrure cède.', locked: 'Impossible d’entrer directement. Le mot de passe, s’il vous plaît.', err: 'Ce navigateur ne peut pas l’ouvrir.' },
  zh: { empty: '请输入暗号。', bad: '打不开。暗号似乎不对。', good: '……锁开了。', locked: '无法直接进入。请说出暗号。', err: '当前环境无法开启。' },
  ko: { empty: '암호를 입력해 주세요.', bad: '열리지 않습니다. 암호가 다른 것 같습니다.', good: '…자물쇠가 풀렸습니다.', locked: '직접 들어올 수 없습니다. 암호를 말씀해 주세요.', err: '이 환경에서는 열 수 없습니다.' },
};

async function sha256(s: string) {
  const b = new TextEncoder().encode(s);
  const h = await crypto.subtle.digest('SHA-256', b);
  return Array.from(new Uint8Array(h)).map((x) => ('0' + x.toString(16)).slice(-2)).join('');
}
const norm = (s: string) => {
  let v = String(s || '');
  try { v = v.normalize('NFKC'); } catch {}
  return v.trim().toLowerCase();
};

export function SecretPage() {
  const { lang, eraView } = useSite();
  const router = useRouter();
  const params = useSearchParams();
  const modern = isModern(eraView as any);

  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<{ k: string; cls: string } | null>(null);
  const [shake, setShake] = useState(0);
  const [opening, setOpening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = (k: string) => passwordWording((M[lang] || M.jp)[k], eraView);

  useEffect(() => {
    if (params?.get('locked') === '1') setMsg({ k: 'locked', cls: 'bad' });
  }, [params]);
  useEffect(() => { setMsg((m) => (m ? { ...m } : m)); }, [lang]);

  const knock = async () => {
    const v = norm(pw);
    if (!v) { setMsg({ k: 'empty', cls: 'bad' }); setShake((s) => s + 1); return; }
    if (!(typeof window !== 'undefined' && window.crypto && crypto.subtle)) { setMsg({ k: 'err', cls: 'bad' }); return; }
    let h = '';
    try { h = await sha256(v); } catch { setMsg({ k: 'err', cls: 'bad' }); return; }
    const r = ROOMS[h];
    if (!r) { setMsg({ k: 'bad', cls: 'bad' }); setShake((s) => s + 1); setPw(''); return; }
    setMsg({ k: 'good', cls: 'good' });
    try { sessionStorage.setItem('sumura-room-' + r[1], '1'); } catch {}
    setOpening(true);
    setTimeout(() => router.push(r[0]), 950);
  };

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
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') knock(); }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn" id="sd-open" onClick={knock}>
            <T k="sc-open" as="span" kind="btn" />
          </button>
        </div>
        <div id="sd-msg" className={msg?.cls}>{msg ? t(msg.k) : ''}</div>
      </div>
    </Shell>
  );
}
