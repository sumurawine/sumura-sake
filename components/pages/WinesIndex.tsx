'use client';

import Link from 'next/link';
import { Shell } from '@/components/Shell';
import type { Lang } from '@/lib/i18n';
import { winePath, makerPath, pre } from '@/lib/slug';

export type Group = { key: string; label: string; list: Array<{ slug: string; name: string; out: boolean }> };
export type MakerRow = { slug: string; name: string; n: number };

const X: Record<string, Record<Lang, string>> = {
  head: { jp: '取り扱い銘柄の一覧', en: 'All the wines we carry', fr: 'Tous les vins que nous proposons', zh: '全部经营酒款一览', ko: '취급 전 품목 목록' },
  lead: {
    jp: '当店がお取り扱いしてまいりました銘柄を、産地ごとに並べております。一本ずつのページに、生産者・アペラシオン・ヴィンテージ・在庫の別を記しております。',
    en: 'Every bottle we carry, arranged by region. Each has its own page with the producer, appellation, vintage and availability.',
    fr: 'Tous nos flacons, classés par région. Chacun a sa page : producteur, appellation, millésime et disponibilité.',
    zh: '本店经营的全部酒款，按产地排列。每款均设专属页面，载有生产者、法定产区、年份与库存。',
    ko: '저희가 취급해 온 모든 병을 산지별로 늘어놓았습니다. 각 병마다 생산자·아펠라시옹·빈티지·재고를 적은 전용 페이지가 있습니다.',
  },
  makers: { jp: '造り手から探す', en: 'By producer', fr: 'Par producteur', zh: '按生产者查找', ko: '생산자로 찾기' },
  out: { jp: '（在庫切れ）', en: ' (sold out)', fr: ' (épuisé)', zh: '（售罄）', ko: ' (품절)' },
  home: { jp: 'ホーム', en: 'Home', fr: 'Accueil', zh: '首页', ko: '홈' },
};

export function WinesIndex(
  { groups, makers, lang }: { groups: Group[]; makers: MakerRow[]; lang: Lang },
) {
  const t = (k: string) => X[k][lang] || X[k].jp;
  const p = pre(lang);
  return (
    <Shell>
      <nav className="w-crumb" aria-label="breadcrumb">
        <Link href={`${p}/home`}>{t('home')}</Link><span>›</span><span>{t('head')}</span>
      </nav>
      <h1 className="w-name">{t('head')}</h1>
      <p className="w-desc">{t('lead')}</p>

      {groups.map((g) => (
        <section key={g.key} className="w-more">
          <h2>{g.label}</h2>
          <ul className="w-list">
            {g.list.map((x) => (
              <li key={x.slug}>
                <Link href={winePath(x.slug, lang)}>{x.name}</Link>
                {x.out ? <span className="w-outmark">{t('out')}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="w-more">
        <h2>{t('makers')}</h2>
        <ul className="w-list w-makers">
          {makers.map((m) => (
            <li key={m.slug}><Link href={makerPath(m.slug, lang)}>{m.name}</Link> <span className="w-n">{m.n}</span></li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
