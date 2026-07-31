'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { useSite } from '@/components/Providers';
import { apiPost, apiReady } from '@/lib/api';
import type { Lang } from '@/lib/i18n';

const M: Record<Lang, Record<string, string>> = {
  jp: { sending: '送信しています…', ok: 'ありがとうございます。お問い合わせを承りました。折り返しご連絡いたします。', ng: '送信できませんでした。お手数ですが 0836-21-4721 までお電話ください。', mail: 'メールアドレスをご確認ください。', need: 'お問い合わせ内容をご記入ください。', off: 'ただいまフォームの準備中です。お手数ですが 0836-21-4721 までお電話ください。', nsend: '登録しています…', nok: 'メルマガにご登録いただきました。ありがとうございます。', ndup: 'このメールアドレスはすでに登録されています。', nng: '登録できませんでした。しばらくしてからもう一度お試しください。', pre: '「%s」について、在庫と価格を教えてください。' },
  en: { sending: 'Sending…', ok: 'Thank you. We have received your message and will be in touch shortly.', ng: 'The message could not be sent. Please call us on +81 836-21-4721.', mail: 'Please check your email address.', need: 'Please write your message.', off: 'The form is not ready yet. Please call us on +81 836-21-4721.', nsend: 'Subscribing…', nok: 'You are subscribed to the newsletter. Thank you.', ndup: 'This address is already subscribed.', nng: 'Subscription failed. Please try again in a moment.', pre: 'Could you tell me the availability and price of "%s"?' },
  fr: { sending: 'Envoi en cours…', ok: 'Merci. Nous avons bien reçu votre message et vous répondrons rapidement.', ng: 'L’envoi a échoué. Merci de nous appeler au +81 836-21-4721.', mail: 'Veuillez vérifier votre adresse e-mail.', need: 'Merci d’écrire votre message.', off: 'Le formulaire n’est pas encore actif. Merci de nous appeler au +81 836-21-4721.', nsend: 'Inscription…', nok: 'Vous êtes inscrit à la lettre d’information. Merci.', ndup: 'Cette adresse est déjà inscrite.', nng: 'L’inscription a échoué. Merci de réessayer dans un instant.', pre: 'Pourriez-vous m’indiquer la disponibilité et le prix de « %s » ?' },
  zh: { sending: '发送中…', ok: '感谢您的咨询，我们已收到，将尽快与您联系。', ng: '发送失败。烦请致电 +81 836-21-4721。', mail: '请确认您的电子邮件地址。', need: '请填写咨询内容。', off: '表单尚在准备中。烦请致电 +81 836-21-4721。', nsend: '登记中…', nok: '已完成邮件通讯订阅，谢谢您。', ndup: '该邮箱已订阅。', nng: '订阅失败，请稍后再试。', pre: '请告知「%s」的库存与价格。' },
  ko: { sending: '보내는 중…', ok: '감사합니다. 문의를 접수했습니다. 곧 연락드리겠습니다.', ng: '전송하지 못했습니다. 번거로우시겠지만 +81 836-21-4721 로 전화 주세요.', mail: '메일 주소를 확인해 주세요.', need: '문의 내용을 입력해 주세요.', off: '양식을 준비 중입니다. 번거로우시겠지만 +81 836-21-4721 로 전화 주세요.', nsend: '등록 중…', nok: '뉴스레터에 등록되었습니다. 감사합니다.', ndup: '이미 등록된 메일 주소입니다.', nng: '등록하지 못했습니다. 잠시 후 다시 시도해 주세요.', pre: '「%s」의 재고와 가격을 알려 주세요.' },
};

const okMail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

export function ContactPage() {
  const { lang } = useSite();
  const params = useSearchParams();
  const t = (k: string) => (M[lang] || M.jp)[k];

  const item0 = params?.get('item') || '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [item, setItem] = useState(item0);
  const [msg, setMsg] = useState('');
  const [hp, setHp] = useState('');
  const [st, setSt] = useState<{ text: string; color: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const auto = useRef('');
  const formRef = useRef<HTMLFormElement>(null);

  const [nlMail, setNlMail] = useState('');
  const [nlHp, setNlHp] = useState('');
  const [nlSt, setNlSt] = useState<{ text: string; color: string } | null>(null);

  useEffect(() => { setItem(item0); }, [item0]);

  useEffect(() => {
    if (!item0) return;
    const next = (M[lang] || M.jp).pre.replace('%s', item0);
    setMsg((cur) => (cur === '' || cur === auto.current ? next : cur));
    auto.current = next;
  }, [item0, lang]);

  useEffect(() => {
    if (!item0) return;
    const id = setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 800);
    return () => clearTimeout(id);
  }, [item0]);

  const say = (k: string, c?: string) =>
    setSt({ text: t(k), color: c === 'ok' ? '#9dff9d' : c === 'ng' ? '#ff8a8a' : '#b3a894' });
  const nsay = (k: string, c?: string) =>
    setNlSt({ text: t(k), color: c === 'ok' ? '#9dff9d' : c === 'ng' ? '#ff8a8a' : '#b3a894' });

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!okMail(email.trim())) { say('mail', 'ng'); return; }
    if (!msg.trim()) { say('need', 'ng'); return; }
    if (!apiReady()) { say('off', 'ng'); return; }
    setBusy(true); say('sending');
    try {
      const r = await apiPost({ action: 'contact', name, email: email.trim(), tel, item, message: msg.trim(), lang, hp });
      if (r && r.ok) { setName(''); setEmail(''); setTel(''); setItem(''); setMsg(''); say('ok', 'ok'); }
      else say('ng', 'ng');
    } catch { say('ng', 'ng'); }
    setBusy(false);
  };

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!okMail(nlMail.trim())) { nsay('mail', 'ng'); return; }
    if (!apiReady()) { nsay('off', 'ng'); return; }
    nsay('nsend');
    try {
      const r = await apiPost({ action: 'subscribe', email: nlMail.trim(), lang, hp: nlHp });
      if (r && r.ok && r.dup) nsay('ndup', 'ok');
      else if (r && r.ok) { setNlMail(''); nsay('nok', 'ok'); }
      else nsay('nng', 'ng');
    } catch { nsay('nng', 'ng'); }
  };

  return (
    <Shell>
      <div className="panel">
        <T k="ct-head" as="div" kind="head" className="pixhead" />
        <table className="retro">
          <tbody>
            <tr><T k="ct-addr-label" as="th" /><T k="ct-addr-val" as="td" /></tr>
            <tr><T k="ct-tel-label" as="th" /><td>0836-21-4721</td></tr>
            <tr><T k="ct-rep-label" as="th" /><T k="ct-rep-val" as="td" /></tr>
            <tr><T k="contact-hours-label" as="th" /><T k="contact-hours-val" as="td" /></tr>
          </tbody>
        </table>
        <T k="ct-phone-note" as="p" className="hint" />
      </div>

      <div className="panel">
        <T k="ct-mail-head" as="div" kind="head" className="pixhead" />
        <T k="ct-mail-note" as="p" />
        <form id="ct-form" ref={formRef} autoComplete="on" onSubmit={send}>
          <p style={{ display: 'none' }}>
            <label><T k="ct-honey" as="span" /><input id="ct-hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
          </p>
          <T k="ct-f-name" as="label" />
          <input className="field" id="ct-name" type="text" maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          <T k="ct-f-email" as="label" />
          <input className="field" id="ct-email" type="email" required placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <T k="ct-f-tel" as="label" />
          <input className="field" id="ct-tel" type="tel" maxLength={40} autoComplete="tel" value={tel} onChange={(e) => setTel(e.target.value)} />
          <T k="ct-f-item" as="label" />
          <input className="field" id="ct-item" type="text" maxLength={200} value={item} onChange={(e) => setItem(e.target.value)} />
          <T k="ct-f-msg" as="label" />
          <textarea className="field" id="ct-msg" rows={7} required style={{ resize: 'vertical' }} value={msg} onChange={(e) => setMsg(e.target.value)} />
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button className="btn" type="submit" id="ct-send" disabled={busy}><T k="ct-f-send" as="span" kind="btn" /></button>
          </div>
          <div id="ct-status" className="hint" style={{ marginTop: 10, minHeight: 20, color: st?.color }}>{st?.text}</div>
        </form>
      </div>

      <div className="panel">
        <T k="ct-news-head" as="div" kind="head" className="pixhead" />
        <T k="ct-news-note" as="p" />
        <form id="nl-form" onSubmit={subscribe}>
          <p style={{ display: 'none' }}>
            <label><T k="ct-honey" as="span" /><input id="nl-hp" tabIndex={-1} autoComplete="off" value={nlHp} onChange={(e) => setNlHp(e.target.value)} /></label>
          </p>
          <T k="contact-email-label" as="label" />
          <input className="field" id="nl-email" type="email" required placeholder="you@example.com" autoComplete="email" value={nlMail} onChange={(e) => setNlMail(e.target.value)} />
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button className="btn" type="submit"><T k="ct-news-btn" as="span" kind="btn" /></button>
          </div>
          <div id="nl-status" className="hint" style={{ marginTop: 10, minHeight: 20, color: nlSt?.color }}>{nlSt?.text}</div>
        </form>
        <T k="ct-news-foot" as="p" className="hint" />
      </div>
    </Shell>
  );
}
