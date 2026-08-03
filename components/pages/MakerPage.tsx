'use client';

import Link from 'next/link';
import { Shell } from '@/components/Shell';
import type { Lang } from '@/lib/i18n';
import type { Near } from '@/lib/wineText';
import { winePath, pre } from '@/lib/slug';

const M: Record<string, Record<Lang, string>> = {
  head: { jp: 'のワイン', en: ' — the wines we carry', fr: ' — nos vins', zh: ' 的葡萄酒', ko: '의 와인' },
  count: { jp: '点', en: ' bottles', fr: ' flacons', zh: ' 款', ko: '점' },
  shop: { jp: 'オンラインストア', en: 'Online shop', fr: 'Boutique', zh: '在线商店', ko: '온라인 스토어' },
  home: { jp: 'ホーム', en: 'Home', fr: 'Accueil', zh: '首页', ko: '홈' },
  makers: { jp: 'お取り扱い生産者', en: 'Producers', fr: 'Producteurs', zh: '经营生产者', ko: '취급 생산자' },
  ask: { jp: 'この造り手について問い合わせる', en: 'Enquire about this producer', fr: 'Nous écrire à propos de ce producteur', zh: '咨询这位生产者', ko: '이 생산자에 대해 문의하기' },
  note: {
    jp: '掲載は在庫のごく一部でございます。ヴィンテージのご指定やお取り寄せのご相談も承りますので、どうぞお声がけくださいませ。',
    en: 'What is listed here is only a part of our cellar. Ask us for a particular vintage — we are often able to source it.',
    fr: 'Cette liste ne montre qu’une partie de notre cave. Demandez-nous un millésime précis, nous pouvons souvent le trouver.',
    zh: '此处所列仅为库存的一部分。若需指定年份或代为寻找，敬请垂询。',
    ko: '여기 실린 것은 재고의 일부에 지나지 않습니다. 원하시는 빈티지가 있으시면 말씀해 주십시오.',
  },
};

export function MakerPage(
  { shown, list, lang, about }: { shown: string; list: Near[]; lang: Lang; about?: string[] },
) {
  const t = (k: string) => M[k][lang] || M[k].jp;
  const p = pre(lang);
  return (
    <Shell>
      <nav className="w-crumb" aria-label="breadcrumb">
        <Link href={`${p}/home`}>{t('home')}</Link>
        <span>›</span>
        <Link href={`${p}/producers`}>{t('makers')}</Link>
        <span>›</span>
        <span>{shown}</span>
      </nav>

      <div className="w-maker">
        <h1 className="w-name">{shown}{t('head')}</h1>
        <p className="w-count">{list.length}{t('count')}</p>
        {about && about.length ? (
          <div className="w-about">
            {about.map((s, i) => (<p key={i}>{s}</p>))}
          </div>
        ) : null}
        <p className="w-note">{t('note')}</p>
        <div className="w-cta">
          <Link href={`${p}/contact`} className="mx-btn mx-btn-solid"><span>{t('ask')}</span></Link>
          <Link href={`${p}/store`} className="mx-btn"><span>{t('shop')}</span></Link>
        </div>
      </div>

      <div className="w-grid">
        {list.map((x) => (
          <Link key={x.id} href={winePath(x.slug, lang)} className="w-card">
            {x.img ? <img src={x.img} alt="" loading="lazy" /> : <span className="w-noimg" />}
            <span className="w-card-n">{x.name}</span>
            {x.price ? <span className="w-card-p">{x.price}</span> : null}
          </Link>
        ))}
      </div>
    </Shell>
  );
}
