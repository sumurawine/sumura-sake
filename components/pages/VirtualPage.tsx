'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSite } from '@/components/Providers';
import { createShop, type ShopHandle, type Bottle } from '@/lib/shop3d';
import { SUMURA_API, apiReady } from '@/lib/api';
import { asset } from '@/lib/paths';
import { dkey, yenOf } from '@/lib/store';
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
    sndOn: '音を出す', sndOff: '音を消す',
    kWalk: 'W A S D 歩く', kLook: 'マウス 見回す', kTake: 'クリック 手に取る', kLeave: '退店',
    callC: '店員を呼ぶ', talkC: '店員に話しかける', oBtn: '手に取る', xBtn: '閉じる',
    coming: '店員がこちらへ向かっております…',
    nameL: 'お名前', nl: 'メールマガジンを受け取る（任意）', body: 'この一本について、お伝えする内容',
    more: 'ほかにもお探しのものはございますか。', yesMore: 'はい、もう一度うかがう', noMore: 'いいえ、これで', needName: 'お名前をご記入ください。',
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
    sndOn: 'Sound on', sndOff: 'Sound off',
    kWalk: 'W A S D  walk', kLook: 'Mouse  look', kTake: 'Click  pick up', kLeave: 'Leave',
    callC: 'Call the clerk', talkC: 'Speak to the clerk', oBtn: 'Pick up', xBtn: 'Close',
    coming: 'The clerk is on the way…',
    nameL: 'Your name', nl: 'Receive our newsletter (optional)', body: 'What we will pass on',
    more: 'Is there anything else you are looking for?', yesMore: 'Yes, ask again', noMore: 'No, that is all', needName: 'Please enter your name.',
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
    sndOn: 'Son activé', sndOff: 'Son coupé',
    kWalk: 'W A S D  marcher', kLook: 'Souris  regarder', kTake: 'Clic  prendre', kLeave: 'Sortir',
    callC: 'Appeler le sommelier', talkC: 'Parler au sommelier', oBtn: 'Prendre', xBtn: 'Fermer',
    coming: 'Le sommelier arrive…',
    nameL: 'Votre nom', nl: 'Recevoir notre lettre (facultatif)', body: 'Ce que nous transmettrons',
    more: 'Cherchez-vous autre chose ?', yesMore: 'Oui, demander encore', noMore: 'Non, c’est tout', needName: 'Veuillez indiquer votre nom.',
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
    sndOn: '开启声音', sndOff: '关闭声音',
    kWalk: 'W A S D 行走', kLook: '鼠标 环视', kTake: '点击 取用', kLeave: '离店',
    callC: '呼叫店员', talkC: '与店员交谈', oBtn: '取用', xBtn: '关闭',
    coming: '店员正在过来…',
    nameL: '姓名', nl: '订阅本店通讯（任意）', body: '将转达的内容',
    more: '还有其他想找的酒吗？', yesMore: '有，再问一次', noMore: '没有了', needName: '请填写姓名。',
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
    sndOn: '소리 켜기', sndOff: '소리 끄기',
    kWalk: 'W A S D 걷기', kLook: '마우스 둘러보기', kTake: '클릭 집기', kLeave: '퇴점',
    callC: '점원 부르기', talkC: '점원에게 말 걸기', oBtn: '집기', xBtn: '닫기',
    coming: '점원이 오고 있습니다…',
    nameL: '성함', nl: '뉴스레터 받기 (선택)', body: '전달할 내용',
    more: '다른 찾으시는 것이 있으신가요?', yesMore: '네, 다시 여쭙기', noMore: '아니요, 괜찮습니다', needName: '성함을 입력해 주세요.',
  },
};


/* 入店前の頁に、静的な文章として置く店の案内でございます（検索にも読まれます） */
const VS_ABOUT: Record<Lang, {
  lead: string; lName: string; name: string; lAddr: string; addr: string;
  lHours: string; hours: string; lTel: string; deal: string;
}> = {
  jp: {
    lead: 'ここは、山口県宇部市のワイン専門店「すむら酒店（洲村酒店）」の店内を、そのまま歩いていただけるバーチャル店舗でございます。棚の一本を手に取り、店員にお声がけいただけます。',
    lName: '店名', name: 'すむら酒店（洲村酒店）／ Liquor Shop Sumura',
    lAddr: '所在地', addr: '〒755-0072　山口県宇部市中村3-6-20',
    lHours: '営業時間', hours: '10:00〜18:30（火曜定休）',
    lTel: '電話',
    deal: 'ブルゴーニュを中心に、ボルドー、コート デュ ローヌ、ジュラ、ロワール、アルザスのフランス銘醸ワインを正規ルートで取り揃えております。ドメーヌ ド ラ ロマネ コンティ、ドメーヌ ルロワ、ドメーヌ ドーヴネの正規取り扱い店でございます。',
  },
  en: {
    lead: 'This is a virtual walk through Liquor Shop Sumura (すむら酒店 / 洲村酒店), a wine merchant in Ube, Yamaguchi, Japan. Take a bottle from the shelf, or call the shopkeeper over.',
    lName: 'Shop', name: 'Liquor Shop Sumura (すむら酒店・洲村酒店)',
    lAddr: 'Address', addr: '3-6-20 Nakamura, Ube, Yamaguchi 755-0072, Japan',
    lHours: 'Opening hours', hours: '10:00–18:30, closed Tuesdays',
    lTel: 'Telephone',
    deal: 'Burgundy above all, with Bordeaux, the Rhône, Jura, the Loire and Alsace, all sourced through official channels. An authorised stockist of Domaine de la Romanée-Conti, Domaine Leroy and Domaine d’Auvenay.',
  },
  fr: {
    lead: 'Voici une visite virtuelle de Liquor Shop Sumura (すむら酒店 / 洲村酒店), caviste à Ube, Yamaguchi, au Japon. Prenez une bouteille dans le rayon, ou appelez le caviste.',
    lName: 'Maison', name: 'Liquor Shop Sumura (すむら酒店・洲村酒店)',
    lAddr: 'Adresse', addr: '3-6-20 Nakamura, Ube, Yamaguchi 755-0072, Japon',
    lHours: 'Horaires', hours: '10h00–18h30, fermé le mardi',
    lTel: 'Téléphone',
    deal: 'La Bourgogne avant tout, mais aussi Bordeaux, le Rhône, le Jura, la Loire et l’Alsace, en filière officielle. Dépositaire agréé de la Romanée-Conti, du Domaine Leroy et du Domaine d’Auvenay.',
  },
  zh: {
    lead: '这里是日本山口县宇部市的葡萄酒专门店「すむら酒店（洲村酒店）」的虚拟店铺，您可以在店内自由走动，取下架上的酒瓶，或呼叫店员。',
    lName: '店名', name: 'すむら酒店（洲村酒店）／ Liquor Shop Sumura',
    lAddr: '地址', addr: '日本山口县宇部市中村3-6-20（邮编 755-0072）',
    lHours: '营业时间', hours: '10:00〜18:30（周二休息）',
    lTel: '电话',
    deal: '以勃艮第为中心，同时备有波尔多、罗讷河谷、汝拉、卢瓦尔、阿尔萨斯的法国名酿，全部经由正规渠道进货。本店为罗曼尼·康帝、勒桦、多维内的正规代理店。',
  },
  ko: {
    lead: '이곳은 일본 야마구치현 우베시의 와인 전문점 「스무라 주점(洲村酒店)」 매장을 그대로 걸어 볼 수 있는 가상 매장입니다. 선반의 한 병을 집어 들거나, 점원을 부르실 수 있습니다.',
    lName: '상호', name: '스무라 주점(すむら酒店・洲村酒店) / Liquor Shop Sumura',
    lAddr: '주소', addr: '〒755-0072 일본 야마구치현 우베시 나카무라 3-6-20',
    lHours: '영업시간', hours: '10:00〜18:30 (화요일 휴무)',
    lTel: '전화',
    deal: '부르고뉴를 중심으로 보르도, 코트 뒤 론, 쥐라, 루아르, 알자스의 프랑스 명양 와인을 정규 루트로 갖추고 있습니다. 도멘 드 라 로마네 콩티, 도멘 르로이, 도멘 도브네 정규 취급점입니다.',
  },
};

export function VirtualPage() {
  const { lang } = useSite();
  const t = W[lang] || W.jp;
  const ab = VS_ABOUT[lang] || VS_ABOUT.jp;
  const box = useRef<HTMLDivElement>(null);
  const shop = useRef<ShopHandle | null>(null);

  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [snd, setSnd] = useState(true);
  const [near, setNear] = useState(false);
  const [coming, setComing] = useState(false);
  const [hint, setHint] = useState<'clerk' | 'bottle' | null>(null);
  const [panel, setPanel] = useState<'none' | 'talk' | 'bottle' | 'bye'>('none');
  const [bottle, setBottle] = useState<Bottle | null>(null);
  const [items, setItems] = useState<Bottle[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [descs, setDescs] = useState<Record<string, string>>({});

  const [ask, setAsk] = useState('');
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState('');
  const [picks, setPicks] = useState<Pick[]>([]);
  const [msg, setMsg] = useState('');
  const [mail, setMail] = useState('');
  const [note, setNote] = useState('');
  const [buying, setBuying] = useState<Pick | Bottle | null>(null);
  const [uname, setUname] = useState('');
  const [nl, setNl] = useState(false);
  const [done, setDone] = useState(false);
  const [imgs, setImgs] = useState<Record<string, string>>({});

  /* 在庫を読み込みます */
  useEffect(() => {
    let off = false;
    Promise.all([
      fetch(asset('/products.json')).then((r) => r.json()).catch(() => null),
      fetch(asset('/products.i18n.json')).then((r) => r.json()).catch(() => null),
    ])
      .then(([j, I]: any[]) => {
        if (off) return;
        const say = (m: any, jp: string) => (lang === 'jp' ? jp : (m && m[lang]) || jp);
        const nm: Record<string, string> = {};
        const ds: Record<string, string> = {};
        const im: Record<string, string> = {};
        (j?.items || []).forEach((it: any) => {
          nm[String(it.id)] = say(I?.items?.[it.id]?.name, it.name);
          if (it.desc) ds[String(it.id)] = say(I?.descs?.[dkey(it.desc)], it.desc);
          if (it.img) im[String(it.id)] = String(it.img);
        });
        setNames(nm); setDescs(ds); setImgs(im);
        const rows: Bottle[] = (j?.items || [])
          .filter((it: any) => String(it.stock || '0') !== '0')
          .map((it: any) => ({
            id: it.id, name: nm[String(it.id)] || it.name, price: yenOf(it.price, lang),
            prod: say(I?.producers?.[it.prod], it.prod || ''), cat: it.cat || '',
          }));
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
      onNear: (v) => setNear(v),
      onArrive: () => { setComing(false); setReply(''); setPicks([]); open('talk'); },
      onDoor: () => open('bye'),
    }).then((h) => {
      if (dead) { h.dispose(); return; }
      shop.current = h;
      h.sound(snd);
    }).catch(() => setReady(true));
    return () => { dead = true; shop.current?.dispose(); shop.current = null; };
  }, [started, items, open]);

  /* 音の入り切り */
  useEffect(() => { shop.current?.sound(snd); }, [snd]);

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
    if (!uname.trim()) { setMsg(t.needName); return; }
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
          action: 'contact', name: uname.trim(), email: mail.trim(),
          message: what + '\n\n【ご用件】\n' + ask + '\n\n【ご要望】\n' + note,
        }),
      });
      if (nl) {
        await fetch(SUMURA_API, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'subscribe', email: mail.trim(), lang, hp: '' }),
        }).catch(() => {});
      }
      setMsg(t.sent); setBuying(null); setNote(''); setDone(true);
    } catch { setMsg(t.err); }
    setBusy(false);
  };

  const again = () => {
    setDone(false); setMsg(''); setBuying(null);
    setAsk(''); setReply(''); setPicks([]); setNote('');
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
            <p className="vs-guide">
              {(isTouch ? t.hintSp : t.hintPc).split(/[\uFF0F\/\u30FB,\uFF0C\u3001]/).map((s, i) => (
                <span className="vs-guide-i" key={i}>{s.trim()}</span>
              ))}
            </p>

            <div className="vs-about">
              <p>{ab.lead}</p>
              <dl>
                <dt>{ab.lName}</dt><dd>{ab.name}</dd>
                <dt>{ab.lAddr}</dt><dd>{ab.addr}</dd>
                <dt>{ab.lHours}</dt><dd>{ab.hours}</dd>
                <dt>{ab.lTel}</dt><dd>0836-21-4721</dd>
              </dl>
              <p>{ab.deal}</p>
            </div>
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

          <button className="vs-call" onClick={() => {
            if (near) { setReply(''); setPicks([]); open('talk'); }
            else { setComing(true); shop.current?.callClerk(); }
          }}>
            <span className="vs-cap">C</span>{coming ? t.coming : near ? t.talkC : t.callC}
          </button>

          <button className="vs-exit" onClick={() => { shop.current?.leave(); }}>
            <span className="vs-cap">E</span>{t.kLeave}
          </button>

          {!isTouch ? (
            <div className="vs-keys">
              <span><span className="vs-cap">W</span><span className="vs-cap">A</span><span className="vs-cap">S</span><span className="vs-cap">D</span>{t.kWalk}</span>
              <span><span className="vs-cap">✥</span>{t.kLook}</span>
              <span><span className="vs-cap">◉</span>{t.kTake}</span>
              <span><span className="vs-cap">C</span>{near ? t.talkC : t.callC}</span>
              <span><span className="vs-cap">E</span>{t.kLeave}</span>
            </div>
          ) : (
            <>
              <div className="vs-keys">{t.hintSp}</div>
              <button className="vs-take" onClick={() => shop.current?.use()}>{t.oBtn}</button>
            </>
          )}

          <button className="vs-snd" onClick={() => setSnd((v) => !v)}
                  aria-label={snd ? t.sndOff : t.sndOn}>{snd ? '♪ ' + t.sndOff : '♪ ' + t.sndOn}</button>
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
              {imgs[String(p.id)] ? (
                <img className="vs-shot" src={imgs[String(p.id)]} alt="" loading="lazy" />
              ) : null}
              <div className="vs-card-n">{names[String(p.id)] || p.name}</div>
              <div className="vs-card-p">{yenOf(p.price, lang)}</div>
              {p.why ? <div className="vs-card-w">{p.why}</div> : null}
              {descs[String(p.id)] ? <div className="vs-card-d">{descs[String(p.id)]}</div> : null}
              <button className="vs-btn vs-sm" onClick={() => { setBuying(p); setDone(false); setMsg(''); setNote(p.name); }}>{t.buy}</button>
            </div>
          ))}

          {done ? (
            <div className="vs-form">
              <div className="vs-ok">{t.sent}</div>
              <div className="vs-clerk" style={{ marginTop: 14 }}>{t.more}</div>
              <div className="vs-row">
                <button className="vs-btn vs-primary" onClick={again}>{t.yesMore}</button>
                <button className="vs-btn" onClick={() => { setDone(false); close(); }}>{t.noMore}</button>
              </div>
            </div>
          ) : buying !== null || (reply && !picks.length) ? (
            <div className="vs-form">
              {buying ? <div className="vs-buying">{(buying as any).name}</div> : null}
              <label>{t.nameL}</label>
              <input value={uname} onChange={(e) => setUname(e.target.value)} placeholder="宇部 太郎" />
              <label>{t.mail}</label>
              <input value={mail} onChange={(e) => setMail(e.target.value)} inputMode="email" placeholder="you@example.com" />
              <label>{t.body}</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              <label className="vs-nl">
                <input type="checkbox" checked={nl} onChange={(e) => setNl(e.target.checked)} />
                <span>{t.nl}</span>
              </label>
              <button className="vs-btn vs-primary" disabled={busy} onClick={sendShop}>{t.sendShop}</button>
            </div>
          ) : reply || picks.length ? (
            <div className="vs-card vs-ask">
              <div className="vs-card-w">{t.note}</div>
              <button className="vs-btn vs-sm" onClick={() => { setBuying(null); setDone(false); setMsg(''); setNote(ask); }}>{t.sendShop}</button>
            </div>
          ) : null}

          {msg ? <div className="vs-msg">{msg}</div> : null}
        </div>
      ) : null}

      {panel === 'bottle' && bottle ? (
        <div className="vs-panel vs-small">
          <div className="vs-card-n">{names[String(bottle.id)] || bottle.name}</div>
          <div className="vs-card-p">{bottle.price}</div>
          {descs[String(bottle.id)] ? <div className="vs-card-d">{descs[String(bottle.id)]}</div> : null}
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
