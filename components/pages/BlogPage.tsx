'use client';
import { asset } from '@/lib/paths';
import { useSite } from '@/components/Providers';
import { isModern } from '@/lib/era';
import { BLOG_TITLE } from '@/lib/modernCopy';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { Comments, useComments } from '@/components/Comments';
import { useContent, pick, photoOf } from '@/lib/content';

export function BlogPage() {
  const { lang, eraView } = useSite();
  const modern = isModern(eraView as any);
  const { all, reload } = useComments();
  const { blog } = useContent();
  const L = lang.toUpperCase();
  return (
    <Shell>
      <div className="panel" style={{ textAlign: 'center' }}>
        {modern ? null : <img src={asset('/images/blog-head.png')} alt="" />}
        {modern
          ? <div className="pixhead">{BLOG_TITLE[lang]}</div>
          : <T k="bl-head" as="div" kind="head" className="pixhead" />}
        {modern ? null : <T k="bl-sub" as="div" kind="sub" className="sub" />}
      </div>
      {blog.length
        ? blog.map((r, i) => (
            <div className="panel" key={`s${i}`}>
              <div className="x-pink" style={{ fontSize: 14 }}>{r['日付']}</div>
              <div className="pixhead" style={{ fontSize: 18 }}>{pick(r, lang, '題名(日本語)', '題名' + L)}</div>
              {photoOf(r) ? (
                <p style={{ textAlign: 'center' }}>
                  <img src={photoOf(r)} alt="" style={{ maxWidth: '100%', height: 'auto' }} loading="lazy" />
                </p>
              ) : null}
              <p style={{ whiteSpace: 'pre-wrap' }}>{pick(r, lang, '本文(日本語)', '本文' + L)}</p>
              <Comments post={`s${i + 1}`} all={all} reload={reload} />
            </div>
          ))
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
