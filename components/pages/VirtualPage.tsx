'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSite } from '@/components/Providers';
import { createShop, type ShopHandle, type Bottle } from '@/lib/shop3d';
import { SUMURA_API, apiReady } from '@/lib/api';
import { asset } from '@/lib/paths';
import type { Lang } from '@/lib/i18n';

type Pick = { id: string; name: string; price: string; prod: string; why: string };

const W: Record<Lang, Record<string, string>> = {
  jp: {
    loading: '店内をご用意しております…', enter: '扉を押して、店内へ',
    hintPc: 'W A S D で歩く／マウスで見回す／クリックで話しかける',
    hintSp: '左半分をなぞって歩く・右半分をなぞって見回す',
    talk: '話しかける', see: 'この一本を見る', close: '閉じる',
    ask: '今日はどういったご用件で、お酒をお求めでいらっしゃいますか。',
    ph: '例：来月の父の還暦に、ブルゴーニュの赤を二万円ほどで。／飲食店を始めるので取引のご相談を。',
    send: '店員に伝える', thinking: '店員が棚を見ております…',
    buy: '購入を相談する', mail: 'メールアドレス', note: 'ご要望（任意）',
    sendShop: 'お店に伝える', sent: 'お伝えしました。折り返しご連絡いたします。',
    bye: 'またのご来店を、お待ちしております。', back: 'サイトへ戻る', stay: 'もう少し見て回る',
    err: 'うまく伝わりませんでした。お手数ですが、もう一度お願いいたします。',
    need: 'ご用件をご記入ください。', needMail: 'メールアドレスをご記入ください。',
  },
  en: {
    loading: 'Preparing the shop…', enter: 'Push the door and step inside',
    hintPc: 'W A S D to walk / mouse to look / click to speak',
    hintSp: 'Drag the left half to walk, the right half to look',
    talk: 'Speak to the clerk', see: 'Look at this bottle', close: 'Close',
    ask: 'What brings you in today?',
    ph: 'e.g. A red Burgundy around ¥20,000 for my father’s 60th birthday. / I run a restaurant and would like to open an account.',
    send: 'Tell the clerk', thinking: 'The clerk is looking along the shelves…',
    buy: 'Enquire about buying', mail: 'Email address', note: 'Your message (optional)',
    sendShop: 'Send to the shop', sent: 'Thank you — we will be in touch.',
    bye: 'We look forward to your next visit.', back: 'Back to the site', stay: 'Stay a while longer',
    err: 'Something went wrong. Please try once more.',
    need: 'Please write your request.', needMail: 'Please enter your email address.',
  },
  fr: {
    loading: 'Préparation de la boutique…', enter: 'Poussez la porte et entrez',
    hintPc: 'W A S D pour marcher / souris pour regarder / clic pour parler',
    hintSp: 'Glissez à gauche pour marcher, à droite pour regarder',
    talk: 'Parler au vendeur', see: 'Regarder cette bouteille', close: 'Fermer',
    ask: 'Que puis-je pour vous aujourd’hui ?',
    ph: 'ex. Un bourgogne rouge vers 20 000 ¥ pour les 60 ans de mon père. / Je tiens un restaurant et souhaite ouvrir un compte.',
    send: 'Parler au vendeur', thinking: 'Le vendeur parcourt les rayons…',
    buy: 'Demander pour l’achat', mail: 'Adresse e-mail', note: 'Votre message (facultatif)',
    sendShop: 'Envoyer à la boutique', sent: 'Merci — nous vous recontacterons.',
    bye: 'Au plaisir de vous revoir.', back: 'Retour au site', stay: 'Rester encore un peu',
    err: 'Une erreur est survenue. Merci de réessayer.',
    need: 'Merci d’écrire votre demande.', needMail: 'Merci d’indiquer votre e-mail.',
  },
  zh: {
    loading: '正在准备店内…', enter: '推门进入店内',
    hintPc: 'W A S D 行走／鼠标环视／点击搭话',
    hintSp: '滑动左半屏行走，右半屏环视',
    talk: '与店员搭话', see: '看看这一瓶', close: '关闭',
    ask: '今天想找什么样的酒呢？',
    ph: '例：下月父亲六十大寿，想要两万日元左右的勃艮第红酒。／我经营餐厅，想洽谈供货。',
    send: '告诉店员', thinking: '店员正在货架上寻找…',
    buy: '咨询购买', mail: '电子邮箱', note: '留言（选填）',
    sendShop: '发送给本店', sent: '已收到，我们会尽快与您联系。',
    bye: '期待您再次光临。', back: '返回网站', stay: '再逛一会儿',
    err: '发送失败，请再试一次。',
    need: '请填写您的需求。', needMail: '请填写电子邮箱。',
  },
  ko: {
    loading: '매장을 준비하고 있습니다…', enter: '문을 열고 들어가기',
    hintPc: 'W A S D 이동 / 마우스로 둘러보기 / 클릭으로 말 걸기',
    hintSp: '왼쪽을 밀어 이동, 오른쪽을 밀어 둘러보기',
    talk: '점원에게 말 걸기', see: '이 한 병 보기', close: '닫기',
    ask: '오늘은 어떤 술을 찾으십니까?',
    ph: '예: 다음 달 아버지 환갑에 2만 엔 정도의 부르고뉴 레드. / 음식점을 열어 거래를 상담하고 싶습니다.',
    send: '점원에게 전하기', thinking: '점원이 선반을 살펴보고 있습니다…',
    buy: '구입 상담하기', mail: '이메일 주소', note: '요청 사항 (선택)',
    sendShop: '가게에 전하기', sent: '전달했습니다. 곧 연락드리겠습니다.',
    bye: '또 방문해 주시기를 기다리겠습니다.', back: '사이트로 돌아가기', stay: '조금 더 둘러보기',
    err: '전달되지 않았습니다. 다시 한 번 부탁드립니다.',
    need: '용건을 적어 주세요.', needMail: '이메일 주소를 적어 주세요.',
  },
};

export function VirtualPage() {
  const { lang } = useSite();
  const t = W[lang] || W.jp;
  const box = useRef<HTMLDivElement>(null);
  const shop = useRef<ShopHandle | null>(null);

  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [hint, setHint] = useState<'clerk' | 'bottle' | null>(null);
  const [panel, setPanel] = useState<'none' | 'talk' | 'bottle' | 'bye'>('none');
  const [bottle, setBottle] = useState<Bottle | null>(null);
  const [items, setItems] = useState<Bottle[]>([]);

  const [ask, setAsk] = useState('');
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState('');
  const [picks, setPicks] = useState<Pick[]>([]);
  const [msg, setMsg] = useState('');
  const [mail, setMail] = useState('');
  const [note, setNote] = useState('');
  const [buying, setBuying] = useState<Pick | Bottle | null>(null);

  /* 在庫を読み込みます */
  useEffect(() => {
    let off = false;
    fetch(asset('/products.json'))
      .then((r) => r.json())
      .then((j) => {
        if (off) return;
        const rows: Bottle[] = (j?.items || [])
          .filter((it: any) => String(it.stock || '0') !== '0')
          .map((it: any) => ({ id: it.id, name: it.name, price: it.price, prod: it.prod || '', cat: it.cat || '' }));
        setItems(rows.length ? rows : (j?.items || []).slice(0, 60));
      })
      .catch(() => setItems([]));
    return () => { off = true; };
  }, []);

  const open = useCallback((p: 'talk' | 'bottle' | 'bye') => {
    shop.current?.pause(true);
    setPanel(p);
  }, []);
  const close = useCallback(() => {
    setPanel('none'); setMsg('');
    shop.current?.pause(false);
  }, []);

  /* 店内を組み立てます */
  useEffect(() => {
    if (!started || !box.current || shop.current || !items.length) return;
    let dead = false;
    createShop({
      mount: box.current,
      bottles: items.slice(0, 90),
      onReady: () => { if (!dead) setReady(true); },
      onLook: (k) => setHint(k),
      onUse: (k, id) => {
        if (k === 'clerk') { setReply(''); setPicks([]); open('talk'); }
        else { const b = items.find((x) => x.id === id) || null; setBottle(b); open('bottle'); }
      },
      onDoor: () => open('bye'),
    }).then((h) => {
      if (dead) { h.dispose(); return; }
      shop.current = h;
    }).catch(() => setReady(true));
    return () => { dead = true; shop.current?.dispose(); shop.current = null; };
  }, [started, items, open]);

  /* 店員に伝えます */
  const tell = async () => {
    if (!ask.trim()) { setMsg(t.need); return; }
    if (!apiReady()) { setMsg(t.err); return; }
    setBusy(true); setMsg(''); setReply(''); setPicks([]);
    try {
      const r = await fetch(SUMURA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'advise', text: ask.trim(), lang }),
      });
      const j = await r.json();
      if (!j || j.ok === false) throw new Error('ng');
      setReply(String(j.reply || ''));
      setPicks(Array.isArray(j.picks) ? j.picks : []);
    } catch { setMsg(t.err); }
    setBusy(false);
  };

  /* 買いたい・相談したいを、お店へ伝えます */
  const sendShop = async () => {
    if (!mail.trim()) { setMsg(t.needMail); return; }
    setBusy(true); setMsg('');
    const what = buying
      ? `【バーチャル店舗】${(buying as any).name}（${(buying as any).price || ''}）を購入したい`
      : '【バーチャル店舗】ご相談';
    try {
      await fetch(SUMURA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'contact', name: 'バーチャル店舗のお客様', email: mail.trim(),
          message: what + '\n\n【ご用件】\n' + ask + '\n\n【ご要望】\n' + note,
        }),
      });
      setMsg(t.sent); setBuying(null); setNote('');
    } catch { setMsg(t.err); }
    setBusy(false);
  };

  const isTouch = typeof window !== 'undefined' && matchMedia('(hover: none)').matches;

  return (
    <div className="vs">
      <div className="vs-canvas" ref={box} />

      {!started ? (
        <div className="vs-gate">
          <div className="vs-gate-in">
            <div className="vs-kick">SUMURA — VIRTUAL SHOP</div>
            <h1>すむら酒店</h1>
            <p>{isTouch ? t.hintSp : t.hintPc}</p>
            <button className="vs-btn vs-primary" disabled={!items.length}
                    onClick={() => setStarted(true)}>
              {items.length ? t.enter : t.loading}
            </button>
            <Link href="/home" className="vs-back">{t.back}</Link>
          </div>
        </div>
      ) : null}

      {started && !ready ? <div className="vs-load">{t.loading}</div> : null}

      {started && ready && panel === 'none' ? (
        <>
          <div className="vs-cross" />
          {hint ? <div className="vs-hint">{hint === 'clerk' ? t.talk : t.see}</div> : null}
          <div className="vs-guide">{isTouch ? t.hintSp : t.hintPc}</div>
        </>
      ) : null}

      {panel === 'talk' ? (
        <div className="vs-panel">
          <div className="vs-clerk">{t.ask}</div>
          <textarea value={ask} onChange={(e) => setAsk(e.target.value)} rows={4} placeholder={t.ph} />
          <div className="vs-row">
            <button className="vs-btn vs-primary" disabled={busy} onClick={tell}>{busy ? t.thinking : t.send}</button>
            <button className="vs-btn" onClick={close}>{t.close}</button>
          </div>

          {reply ? <div className="vs-reply">{reply}</div> : null}

          {picks.map((p) => (
            <div key={p.id} className="vs-card">
              <div className="vs-card-n">{p.name}</div>
              <div className="vs-card-p">{p.price}</div>
              {p.why ? <div className="vs-card-w">{p.why}</div> : null}
              <button className="vs-btn vs-sm" onClick={() => { setBuying(p); setMsg(''); }}>{t.buy}</button>
            </div>
          ))}

          {reply || picks.length ? (
            <div className="vs-card vs-ask">
              <div className="vs-card-w">{buying ? '' : t.note}</div>
              {!buying ? <button className="vs-btn vs-sm" onClick={() => { setBuying(null); setMsg(''); setNote(ask); }}>{t.sendShop}</button> : null}
            </div>
          ) : null}

          {(buying !== null || (reply && !picks.length)) ? (
            <div className="vs-form">
              <label>{t.mail}</label>
              <input value={mail} onChange={(e) => setMail(e.target.value)} inputMode="email" placeholder="you@example.com" />
              <label>{t.note}</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
              <button className="vs-btn vs-primary" disabled={busy} onClick={sendShop}>{t.sendShop}</button>
            </div>
          ) : null}

          {msg ? <div className="vs-msg">{msg}</div> : null}
        </div>
      ) : null}

      {panel === 'bottle' && bottle ? (
        <div className="vs-panel vs-small">
          <div className="vs-card-n">{bottle.name}</div>
          <div className="vs-card-p">{bottle.price}</div>
          <div className="vs-row">
            <button className="vs-btn vs-primary" onClick={() => { setBuying(bottle as any); setPanel('talk'); }}>{t.buy}</button>
            <button className="vs-btn" onClick={close}>{t.close}</button>
          </div>
        </div>
      ) : null}

      {panel === 'bye' ? (
        <div className="vs-gate">
          <div className="vs-gate-in">
            <div className="vs-rule" />
            <h2>{t.bye}</h2>
            <Link href="/home" className="vs-btn vs-primary">{t.back}</Link>
            <button className="vs-back" onClick={close}>{t.stay}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
