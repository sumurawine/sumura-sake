'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Lang } from '@/lib/i18n';

/** 20歳未満の方にご案内する、酒類の販売についての法令 */
export const LAW_URL = 'https://laws.e-gov.go.jp/law/211AC1000000020';

const W: Record<Lang, {
  head: string; lead: string; y: string; m: string; d: string;
  now: string; ok: string; wait: string; bad: string; again: string; unit: string;
}> = {
  jp: {
    head: '生年月日をご入力ください',
    lead: '酒類をお求めいただけるのは、満20歳以上の方のみでございます。',
    y: '年', m: '月', d: '日',
    now: '入力された生年月日では', ok: '入店する', wait: '生年月日をすべてご入力ください',
    bad: '満20歳未満の方は、ご入店いただけません。',
    again: '入力し直す', unit: '歳',
  },
  en: {
    head: 'Please enter your date of birth',
    lead: 'Alcohol may only be purchased by those aged 20 or over.',
    y: 'Year', m: 'Month', d: 'Day',
    now: 'With the date entered, you are', ok: 'Enter the shop', wait: 'Please fill in all three fields',
    bad: 'We are sorry — those under 20 may not enter.',
    again: 'Enter again', unit: ' years old',
  },
  fr: {
    head: 'Veuillez saisir votre date de naissance',
    lead: "La vente d'alcool est réservée aux personnes de 20 ans et plus.",
    y: 'Année', m: 'Mois', d: 'Jour',
    now: 'Avec cette date, vous avez', ok: 'Entrer', wait: 'Veuillez remplir les trois champs',
    bad: "Les personnes de moins de 20 ans ne peuvent pas entrer.",
    again: 'Ressaisir', unit: ' ans',
  },
  zh: {
    head: '请输入您的出生年月日',
    lead: '仅限年满20周岁者购买酒类。',
    y: '年', m: '月', d: '日',
    now: '按所填日期，您现在', ok: '进入店内', wait: '请填写全部三项',
    bad: '未满20周岁者恕不接待。',
    again: '重新输入', unit: '周岁',
  },
  ko: {
    head: '생년월일을 입력해 주세요',
    lead: '주류는 만 20세 이상만 구입하실 수 있습니다.',
    y: '년', m: '월', d: '일',
    now: '입력하신 날짜 기준', ok: '입장하기', wait: '세 칸 모두 입력해 주세요',
    bad: '만 20세 미만은 입장하실 수 없습니다.',
    again: '다시 입력', unit: '세',
  },
};

/** その日の時点での満年齢 */
export function ageOn(y: number, m: number, d: number, today = new Date()): number | null {
  if (!y || !m || !d) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const b = new Date(y, m - 1, d);
  if (b.getFullYear() !== y || b.getMonth() !== m - 1 || b.getDate() !== d) return null;
  let a = today.getFullYear() - y;
  const before = today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d);
  if (before) a -= 1;
  return a;
}

const KEY = 'sumura-age-ok';

/** 一度確かめた方には、しばらくお尋ねしません */
export function ageVerified(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return false;
    return Date.now() - Number(v) < 1000 * 60 * 60 * 24 * 180;
  } catch { return false; }
}

export function AgeGate({ lang, onPass }: { lang: Lang; onPass: () => void }) {
  const t = W[lang] || W.jp;
  const [y, setY] = useState('');
  const [m, setM] = useState('');
  const [d, setD] = useState('');
  const [msg, setMsg] = useState('');
  const mRef = useRef<HTMLInputElement>(null);
  const dRef = useRef<HTMLInputElement>(null);

  const age = useMemo(() => ageOn(Number(y), Number(m), Number(d)), [y, m, d]);
  const full = y.length === 4 && m !== '' && d !== '' && Number(m) >= 1 && Number(d) >= 1;

  useEffect(() => { setMsg(''); }, [y, m, d]);

  const num = (v: string, len: number) => v.replace(/[^0-9]/g, '').slice(0, len);

  /* 「2」と打てば2月、「7」と打てば7日。0を足していただく必要はありません */
  const monthDone = (v: string) => v.length === 2 || Number(v) >= 2;
  const dayDone = (v: string) => v.length === 2 || Number(v) >= 4;

  const submit = () => {
    if (!full || age == null) { setMsg(t.wait); return; }
    if (age < 20) { window.location.href = LAW_URL; return; }
    try { localStorage.setItem(KEY, String(Date.now())); } catch {}
    onPass();
  };

  return (
    <div className="age-gate">
      <div className="ag-head">{t.head}</div>
      <p className="ag-lead">{t.lead}</p>

      <div className="ag-row">
        <label className="ag-f">
          <input inputMode="numeric" autoComplete="bday-year" placeholder="1990" maxLength={4}
                 value={y} onChange={(e) => { const v = num(e.target.value, 4); setY(v); if (v.length === 4) mRef.current?.focus(); }}
                 onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
          <span>{t.y}</span>
        </label>
        <label className="ag-f ag-s">
          <input ref={mRef} inputMode="numeric" autoComplete="bday-month" placeholder="2" maxLength={2}
                 value={m} onChange={(e) => { const v = num(e.target.value, 2); setM(v); if (monthDone(v)) dRef.current?.focus(); }}
                 onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
          <span>{t.m}</span>
        </label>
        <label className="ag-f ag-s">
          <input ref={dRef} inputMode="numeric" autoComplete="bday-day" placeholder="7" maxLength={2}
                 value={d} onChange={(e) => setD(num(e.target.value, 2))}
                 onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
          <span>{t.d}</span>
        </label>
      </div>

      <div className="ag-age" aria-live="polite">
        {age != null && full ? `${t.now} ${age}${t.unit}` : ' '}
      </div>

      <button type="button" className="ag-btn" onClick={submit}>{t.ok}</button>
      {msg ? <div className="ag-msg">{msg}</div> : null}
    </div>
  );
}
