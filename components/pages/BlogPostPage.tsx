'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSite } from '@/components/Providers';
import { Shell } from '@/components/Shell';
import { Comments, useComments } from '@/components/Comments';
import { dateOf, blogCatOf } from '@/lib/store';
import { richText } from '@/lib/richText';
import { useContent, pick, photoOf } from '@/lib/content';
import { pre } from '@/lib/slug';

const BACK: Record<string, string> = {
  jp: '← ブログへ戻る', en: '← Back to blog', fr: '← Retour au blog', zh: '← 返回博客', ko: '← 블로그로 돌아가기',
};
const LOADING: Record<string, string> = {
  jp: '読み込んでいます…', en: 'Loading…', fr: 'Chargement…', zh: '加载中…', ko: '불러오는 중…',
};

/** 一本のブログ記事。/blog/post?id=行番号 で開きます */
export function BlogPostPage() {
  const { lang } = useSite();
  const { all, reload } = useComments();
  const { blog, ready } = useContent();
  const L = lang.toUpperCase();
  const [id, setId] = useState('');
  useEffect(() => {
    try { setId(new URLSearchParams(location.search).get('id') || ''); } catch { /* しずかに */ }
  }, []);
  const r = (blog || []).find((x) => String(x['_row']) === id);
  const P = pre(lang);
  return (
    <Shell>
      <div className="panel">
        {r ? (
          <>
            <div className="x-pink" style={{ fontSize: 14 }} data-blog-row={r['_row']} data-blog-field="日付と分類">
              {dateOf(r['日付'], lang)}{(r['カテゴリ'] || '').trim() ? '　｜　' + blogCatOf(r['カテゴリ'], lang) : ''}
            </div>
            <div className="pixhead" style={{ fontSize: 20 }} data-blog-row={r['_row']} data-blog-field="題名(日本語)">{pick(r, lang, '題名(日本語)', '題名' + L)}</div>
            {photoOf(r) ? (
              <p style={{ textAlign: 'center' }}>
                <img src={photoOf(r)} alt="" style={{ maxWidth: '100%', height: 'auto' }} data-blog-row={r['_row']} data-blog-field="写真" />
              </p>
            ) : null}
            <p style={{ whiteSpace: 'pre-wrap' }} data-blog-row={r['_row']} data-blog-field="本文(日本語)">{richText(pick(r, lang, '本文(日本語)', '本文' + L), lang)}</p>
            <Comments post={'r' + id} all={all} reload={reload} />
          </>
        ) : ready ? (
          <p>{LOADING[lang] || LOADING.jp}</p>
        ) : null}
        <p style={{ marginTop: 18 }}><Link href={P + '/blog'}>{BACK[lang] || BACK.jp}</Link></p>
      </div>
    </Shell>
  );
}
