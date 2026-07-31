import type { Lang } from './i18n';
import type { Era } from './era';
import { isModern } from './era';

const EDGE = /^[\s■◆▒▼▲★☆▶◀◁｜|・･]+|[\s■◆▒▼▲★☆▶◀◁｜|・･]+$/g;

/** 飾り文字を落とす（2010年代・2020年代のみ） */
export function stripDeco(html: string, opts?: { mid?: boolean }): string {
  let s = html;
  if (opts?.mid) s = s.replace(/[★☆]/g, '·');
  let v = s.replace(/[［］]/g, '').replace(EDGE, '').replace(/\s{2,}/g, ' ').trim();
  v = v.replace(/^(·\s*)+/, '').replace(/(\s*·)+$/, '');
  return v || s;
}

/** ヘッダーの副題から「時をおすそわけ」を落とす */
const DROP: Record<Lang, string> = {
  jp: '時をおすそわけ',
  en: 'Sharing a Little Time',
  fr: 'Un peu de temps partagé',
  zh: '与您分享时光',
  ko: '시간을 나눠 드립니다',
};
export function trimHeaderSub(html: string, lang: Lang): string {
  const parts = html
    .split(/[☆★·]/)
    .map((s) => s.trim())
    .filter((s) => s && s.indexOf(DROP[lang]) < 0);
  return parts.join(' · ');
}

/** 時代・言語に応じて表示用に整える */
export function decorate(
  html: string,
  era: Era | 'mukashi',
  lang: Lang,
  kind?: 'head' | 'sub' | 'btn' | 'headerSub' | 'plain'
): string {
  if (era === 'mukashi' || !isModern(era as Era)) return html;
  if (kind === 'headerSub') return trimHeaderSub(stripDeco(html, { mid: true }), lang);
  if (kind === 'sub') return stripDeco(html, { mid: true });
  if (kind === 'head' || kind === 'btn') return stripDeco(html);
  return html;
}

/** 2010年代・2020年代だけ差し替える言い回し */
export const MODERN: Record<Lang, { priv: string; ask: string; back: string; enter: string; sub: string }> = {
  jp: { priv: '非公開在庫', ask: 'こちらは非公開のページです。パスワードをご入力ください。', back: '← 戻る', enter: '入店する', sub: '山口・宇部　フランス銘醸ワインの店' },
  en: { priv: 'Private Cellar', ask: 'This page is private. Please enter the password.', back: '← Back', enter: 'Enter', sub: 'Fine French wines · Ube, Yamaguchi' },
  fr: { priv: 'Cave privée', ask: 'Cette page est privée. Merci de saisir le mot de passe.', back: '← Retour', enter: 'Entrer', sub: 'Grands vins de France · Ube, Yamaguchi' },
  zh: { priv: '非公开库存', ask: '此页面为非公开页面。请输入密码。', back: '← 返回', enter: '进入', sub: '法国名酿葡萄酒 · 山口宇部' },
  ko: { priv: '비공개 재고', ask: '이 페이지는 비공개입니다. 비밀번호를 입력해 주세요.', back: '← 돌아가기', enter: '입장하기', sub: '프랑스 명양조 와인 · 야마구치 우베' },
};

/** 合言葉 / パスワード の言い換え（2010年代・2020年代） */
export function passwordWording(s: string, era: Era | 'mukashi'): string {
  if (era !== '2010' && era !== 'now') return s;
  return s
    .replace(/合言葉/g, 'パスワード')
    .replace(/passphrase/g, 'password')
    .replace(/暗号/g, '密码')
    .replace(/암호/g, '비밀번호');
}
