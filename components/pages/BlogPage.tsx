'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/paths';
import { useSite } from '@/components/Providers';
import { isModern } from '@/lib/era';
import { BLOG_TITLE } from '@/lib/modernCopy';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { Comments, useComments } from '@/components/Comments';
import { dateOf, blogCatOf } from '@/lib/store';
import { plainText } from '@/lib/richText';
import { useContent, pick, photoOf } from '@/lib/content';
import { pre } from '@/lib/slug';

/** 画面の小さな言葉（五言語） */
const UI: Record<string, Record<string, string>> = {
  all: { jp: 'すべて', en: 'All', fr: 'Tout', zh: '全部', ko: '전체' },
  cat: { jp: '分類', en: 'Category', fr: 'Catégorie', zh: '分类', ko: '분류' },
  year: { jp: '年', en: 'Year', fr: 'Année', zh: '年份', ko: '연도' },
  more: { jp: '続きを読む', en: 'Read more', fr: 'Lire la suite', zh: '阅读全文', ko: '더 읽기' },
  uncat: { jp: 'その他', en: 'Other', fr: 'Autres', zh: '其他', ko: '기타' },
};

export function BlogPage() {
  const { lang, eraView } = useSite();
  const modern = isModern(eraView as any);
  const { all, reload } = useComments();
  const { blog, ready } = useContent();
  const L = lang.toUpperCase();
  const t = (k: string) => UI[k][lang] || UI[k].jp;

  /* 下書きは出しません。新しい日付から順に並べます */
  const posts = useMemo(() => {
    const rows = (blog || []).filter((r) => (r['公開'] || '公開') !== '下書き');
    return rows.slice().sort((a, b) => String(b['日付'] || '').localeCompare(String(a['日付'] || '')));
  }, [blog]);

  const cats = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((r) => s.add((r['カテゴリ'] || '').trim() || t('uncat')));
    return [...s];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, lang]);

  const years = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((r) => { const y = String(r['日付'] || '').slice(0, 4); if (/^\d{4}$/.test(y)) s.add(y); });
    return [...s].sort().reverse();
  }, [posts]);

  const [cat, setCat] = useState('');
  const [year, setYear] = useState('');

  const shown = posts.filter((r) =>
    (!cat || ((r['カテゴリ'] || '').trim() || t('uncat')) === cat) &&
    (!year || String(r['日付'] || '').slice(0, 4) === year));

  const P = pre(lang);
  const href = (r: Record<string, string>) => P + '/blog/post?id=' + r['_row'];

  return (
    <Shell>
      <div className="panel" style={{ textAlign: 'center' }}>
        {modern ? null : <img src={asset('/images/blog-head.png')} alt="" />}
        {modern
          ? <div className="pixhead">{BLOG_TITLE[lang]}</div>
          : <T k="bl-head" as="div" kind="head" className="pixhead" />}
        {modern ? null : <T k="bl-sub" as="div" kind="sub" className="sub" />}
        {posts.length ? (
          <div className="bg-filters">
            <div className="gm-menu">
              <span className="bg-cap">{t('cat')}</span>
              <button className={cat ? 'gm-tab' : 'gm-tab is-on'} onClick={() => setCat('')}>{t('all')}</button>
              {cats.map((c) => (
                <button key={c} className={cat === c ? 'gm-tab is-on' : 'gm-tab'}
                        onClick={() => setCat(cat === c ? '' : c)}>{blogCatOf(c, lang)}</button>
              ))}
            </div>
            <div className="gm-menu">
              <span className="bg-cap">{t('year')}</span>
              <button className={year ? 'gm-tab' : 'gm-tab is-on'} onClick={() => setYear('')}>{t('all')}</button>
              {years.map((y) => (
                <button key={y} className={year === y ? 'gm-tab is-on' : 'gm-tab'}
                        onClick={() => setYear(year === y ? '' : y)}>{y}</button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {!ready
        ? null
        : posts.length
        ? shown.map((r) => {
            const body = plainText(pick(r, lang, '本文(日本語)', '本文' + L));
            const short = body.length > 140 ? body.slice(0, 140) + '…' : body;
            return (
              <div className="panel" key={r['_row']} data-blog-card={r['_row']}>
                <div className="x-pink" style={{ fontSize: 14 }}
                     data-blog-row={r['_row']} data-blog-field="日付と分類">
                  {dateOf(r['日付'], lang)}{(r['カテゴリ'] || '').trim() ? '　｜　' + blogCatOf(r['カテゴリ'], lang) : ''}
                </div>
                <Link href={href(r)} style={{ textDecoration: 'none' }} prefetch>
                  <div className="pixhead" style={{ fontSize: 18 }}
                       data-blog-row={r['_row']} data-blog-field="題名(日本語)">{pick(r, lang, '題名(日本語)', '題名' + L)}</div>
                </Link>
                {photoOf(r) ? (
                  <p style={{ textAlign: 'center' }}>
                    <Link href={href(r)} prefetch>
                      <img src={photoOf(r)} alt="" style={{ maxWidth: '100%', height: 'auto' }} loading="lazy"
                           data-blog-row={r['_row']} data-blog-field="写真" />
                    </Link>
                  </p>
                ) : null}
                <p style={{ whiteSpace: 'pre-wrap' }}
                   data-blog-row={r['_row']} data-blog-field="本文(日本語)">{short}</p>
                <p><Link href={href(r)} prefetch>{t('more')} →</Link></p>
              </div>
            );
          })
        : [1, 2, 3].map((i) => (
            <div className="panel" key={i}>
              <T k={`bl-d${i}`} as="div" className="x-pink" style={{ fontSize: 14 }} />
              <T k={`bl-t${i}`} as="div" kind="head" className="pixhead" style={{ fontSize: 18 }} />
              <T k={`bl-p${i}`} as="p" />
              <Comments post={`p${i}`} all={all} reload={reload} />
            </div>
          ))}
    </Shell>
  );
}
