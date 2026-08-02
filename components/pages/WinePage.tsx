'use client';

import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { asset } from '@/lib/paths';
import type { Lang } from '@/lib/i18n';
import type { WineView, Near } from '@/lib/wineText';
import { winePath, makerPath, pre } from '@/lib/slug';

const W: Record<string, Record<Lang, string>> = {
  producer: { jp: '生産者', en: 'Producer', fr: 'Producteur', zh: '生产者', ko: '생산자' },
  region: { jp: '産地', en: 'Region', fr: 'Région', zh: '产区', ko: '산지' },
  ap: { jp: 'アペラシオン', en: 'Appellation', fr: 'Appellation', zh: '法定产区', ko: '아펠라시옹' },
  vintage: { jp: 'ヴィンテージ', en: 'Vintage', fr: 'Millésime', zh: '年份', ko: '빈티지' },
  price: { jp: '価格', en: 'Price', fr: 'Prix', zh: '价格', ko: '가격' },
  stock: { jp: '在庫', en: 'Availability', fr: 'Disponibilité', zh: '库存', ko: '재고' },
  inStock: { jp: '店頭在庫がございます', en: 'In stock', fr: 'En stock', zh: '有现货', ko: '재고 있음' },
  out: { jp: '在庫切れ（お取り寄せのご相談を承ります）', en: 'Sold out — we may be able to source it', fr: 'Épuisé — nous pouvons tenter de le trouver', zh: '售罄（可代为寻找）', ko: '품절 — 구해 드릴 수 있습니다' },
  ask: { jp: 'この一本について問い合わせる', en: 'Enquire about this bottle', fr: 'Nous écrire à propos de ce vin', zh: '咨询这瓶酒', ko: '이 한 병에 대해 문의하기' },
  virtual: { jp: 'バーチャル店舗で相談する', en: 'Ask in the virtual shop', fr: 'Demander à la boutique virtuelle', zh: '在虚拟店铺咨询', ko: '버추얼 매장에서 상담하기' },
  same: { jp: '同じ造り手から', en: 'From the same producer', fr: 'Du même producteur', zh: '同一生产者', ko: '같은 생산자' },
  near: { jp: '同じ産地から', en: 'From the same region', fr: 'De la même région', zh: '同一产区', ko: '같은 산지' },
  back: { jp: 'オンラインストアへ', en: 'Back to the shop', fr: 'Retour à la boutique', zh: '返回在线商店', ko: '온라인 스토어로' },
  shop: { jp: 'オンラインストア', en: 'Online shop', fr: 'Boutique', zh: '在线商店', ko: '온라인 스토어' },
  home: { jp: 'ホーム', en: 'Home', fr: 'Accueil', zh: '首页', ko: '홈' },
  note: {
    jp: '当店は山口県宇部市のワイン専門店でございます。掲載は在庫のごく一部です。お探しの一本がございましたら、どうぞお問い合わせくださいませ。',
    en: 'We are a wine merchant in Ube, Yamaguchi, Japan. What is listed here is only a part of our cellar — please write to us if you are looking for something in particular.',
    fr: 'Nous sommes caviste à Ube, Yamaguchi, au Japon. Cette liste ne montre qu’une partie de notre cave — écrivez-nous si vous cherchez un flacon précis.',
    zh: '本店位于日本山口县宇部市，专营葡萄酒。此处所列仅为库存的一部分，若有想找的酒款，敬请来函垂询。',
    ko: '저희는 일본 야마구치현 우베시의 와인 전문점입니다. 여기 실린 것은 재고의 일부에 지나지 않습니다. 찾으시는 병이 있으시면 문의해 주십시오.',
  },
};

export function WinePage({ v, lang }: { v: WineView; lang: Lang }) {
  const t = (k: string) => W[k][lang] || W[k].jp;
  const out = String(v.item.stock || '0') === '0';
  const p = pre(lang);

  const Card = ({ x }: { x: Near }) => (
    <Link href={winePath(x.slug, lang)} className="w-card">
      {x.img ? <img src={x.img} alt="" loading="lazy" /> : <span className="w-noimg" />}
      <span className="w-card-n">{x.name}</span>
      {x.price ? <span className="w-card-p">{x.price}</span> : null}
    </Link>
  );

  return (
    <Shell>
      <nav className="w-crumb" aria-label="breadcrumb">
        <Link href={`${p}/home`}>{t('home')}</Link>
        <span>›</span>
        <Link href={`${p}/store`}>{t('shop')}</Link>
        <span>›</span>
        <span>{v.name}</span>
      </nav>

      <article className="w-wrap">
        <div className="w-shot">
          <img src={v.item.img || asset('/images/shop-sign.webp')} alt={v.name} />
        </div>

        <div className="w-body">
          <h1 className="w-name">{v.name}</h1>

          <dl className="w-facts">
            {v.producer ? (
              <>
                <dt>{t('producer')}</dt>
                <dd><Link href={makerPath(v.producerSlug, lang)}>{v.producer}</Link></dd>
              </>
            ) : null}
            {v.region ? (<><dt>{t('region')}</dt><dd>{v.region}</dd></>) : null}
            {v.ap ? (<><dt>{t('ap')}</dt><dd>{v.ap}</dd></>) : null}
            {v.vintage ? (<><dt>{t('vintage')}</dt><dd>{v.vintage}</dd></>) : null}
            {v.item.price ? (<><dt>{t('price')}</dt><dd className="w-price">{v.item.price}</dd></>) : null}
            <dt>{t('stock')}</dt>
            <dd className={out ? 'w-out' : 'w-in'}>{out ? t('out') : t('inStock')}</dd>
          </dl>

          {v.desc ? <p className="w-desc">{v.desc}</p> : null}

          <div className="w-cta">
            <Link href={`${p}/contact`} className="mx-btn mx-btn-solid"><span>{t('ask')}</span></Link>
            <Link href={`${p}/virtual`} className="mx-btn"><span>{t('virtual')}</span></Link>
          </div>

          <p className="w-note">{t('note')}</p>
          <p className="w-back"><Link href={`${p}/store`}>← {t('back')}</Link></p>
        </div>
      </article>

      {v.related.length ? (
        <section className="w-more">
          <h2>{t('same')}</h2>
          <div className="w-grid">{v.related.map((x) => <Card key={x.id} x={x} />)}</div>
        </section>
      ) : null}

      {v.nearby.length ? (
        <section className="w-more">
          <h2>{t('near')}</h2>
          <div className="w-grid">{v.nearby.map((x) => <Card key={x.id} x={x} />)}</div>
        </section>
      ) : null}
    </Shell>
  );
}
