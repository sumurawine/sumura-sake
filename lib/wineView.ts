import type { Lang } from './i18n';
import type { Item, I18nData } from './store';
import { yenOf } from './store';
import { SITE } from './siteMeta';
import { slugMap, prodSlug, winePath, makerPath, buyUrl } from './slug';
import { catName, localized, vintageOf, type WineView, type Near } from './wineText';

export const yen = (s: string) => {
  const m = String(s || '').replace(/[, ]/g, '').match(/(\d+)/);
  return m ? m[1] : '';
};

export function buildView(it: Item, items: Item[], i18n: I18nData | null, lang: Lang): WineView {
  const map = slugMap(items, i18n);
  const near = (list: Item[]): Near[] =>
    list.slice(0, 4).map((x) => {
      const L = localized(x, i18n, lang);
      return { id: x.id, slug: map[x.id], name: L.name, price: yenOf(x.price, lang), img: x.img };
    });
  const L = localized(it, i18n, lang);
  const same = items.filter((x) => x.id !== it.id && it.prod && x.prod === it.prod);
  const region = items.filter((x) => x.id !== it.id && x.cat === it.cat && (!it.prod || x.prod !== it.prod));
  return {
    item: it,
    slug: map[it.id],
    name: L.name,
    desc: L.desc,
    producer: L.producer,
    producerSlug: it.prod ? prodSlug(it.prod, i18n) : '',
    region: catName(it.cat, lang),
    ap: L.ap,
    vintage: vintageOf(it.name),
    related: near(same),
    nearby: near(region.sort(() => Math.random() - 0.5)),
  };
}

/** 検索エンジンに読ませる、商品の名札 */
export function wineLd(v: WineView, lang: Lang) {
  const price = yen(v.item.price);
  const out = String(v.item.stock || '0') === '0';
  const url = SITE.url + winePath(v.slug, lang);
  const product: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url + '#product',
    name: v.name,
    url,
    category: v.region,
    image: v.item.img ? [v.item.img] : [SITE.url + SITE.ogImage],
    ...(v.desc ? { description: v.desc } : {}),
    ...(v.producer ? { brand: { '@type': 'Brand', name: v.producer } } : {}),
    ...(v.producer ? { manufacturer: { '@type': 'Organization', name: v.producer } } : {}),
    additionalProperty: [
      ...(v.vintage ? [{ '@type': 'PropertyValue', name: 'Vintage', value: v.vintage }] : []),
      ...(v.ap ? [{ '@type': 'PropertyValue', name: 'Appellation', value: v.ap }] : []),
      ...(v.region ? [{ '@type': 'PropertyValue', name: 'Region', value: v.region }] : []),
    ],
  };
  if (price) {
    product.offers = {
      '@type': 'Offer',
      url: (!out && buyUrl(v.item.id)) || url,
      priceCurrency: 'JPY',
      price,
      availability: out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': SITE.url + '/#shop' },
    };
  }
  const crumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + (lang === 'jp' ? '' : '/' + lang) + '/home' },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: SITE.url + (lang === 'jp' ? '' : '/' + lang) + '/store' },
      { '@type': 'ListItem', position: 3, name: v.name, item: url },
    ],
  };
  return [product, crumb];
}

export function makerLd(shown: string, slug: string, lang: Lang, list: Near[]) {
  const url = SITE.url + makerPath(slug, lang);
  return [{
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url + '#page',
    name: shown,
    url,
    isPartOf: { '@id': SITE.url + '/#site' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: list.length,
      itemListElement: list.map((x, i) => ({
        '@type': 'ListItem', position: i + 1, name: x.name,
        url: SITE.url + winePath(x.slug, lang),
      })),
    },
  }];
}
