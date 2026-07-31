'use client';
import { asset } from '@/lib/paths';
import { useSite } from '@/components/Providers';
import { isModern } from '@/lib/era';
import { BLOG_TITLE } from '@/lib/modernCopy';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { Comments, useComments } from '@/components/Comments';

export function BlogPage() {
  const { lang, eraView } = useSite();
  const modern = isModern(eraView as any);
  const { all, reload } = useComments();
  return (
    <Shell>
      <div className="panel" style={{ textAlign: 'center' }}>
        {modern ? null : <img src={asset('/images/blog-head.png')} alt="" />}
        {modern
          ? <div className="pixhead">{BLOG_TITLE[lang]}</div>
          : <T k="bl-head" as="div" kind="head" className="pixhead" />}
        {modern ? null : <T k="bl-sub" as="div" kind="sub" className="sub" />}
      </div>
      {[1, 2, 3].map((i) => (
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
