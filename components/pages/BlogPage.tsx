'use client';
import { asset } from '@/lib/paths';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { Comments, useComments } from '@/components/Comments';

export function BlogPage() {
  const { all, reload } = useComments();
  return (
    <Shell>
      <div className="panel" style={{ textAlign: 'center' }}>
        <img src={asset('/images/blog-head.png')} alt="" />
        <T k="bl-head" as="div" kind="head" className="pixhead" />
        <T k="bl-sub" as="div" kind="sub" className="sub" />
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
