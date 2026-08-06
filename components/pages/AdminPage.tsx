'use client';

import { useEffect, useState } from 'react';
import { useSite } from '@/components/Providers';
import { pre } from '@/lib/slug';
import { isMirror, editMode, setEditMode } from '@/lib/overrides';

type Card = { to: string; head: string; say: string; mark: string; raw?: boolean };

/* 控室に並べる札。上から、よく使う順に並べています */
const CARDS: Card[] = [
  { to: '/blog',      mark: '筆', head: 'ブログを書く',        say: 'お店の日記です。新しく書く・前のものを直す・写真を入れる、すべてここから。' },
  { to: '/news',      mark: '報', head: 'お知らせを出す',      say: '入荷やお休みのご案内です。ホームのいちばん下にも同じものが出ます。' },
  { to: '/store',     mark: '品', head: '商品在庫の管理',      say: '並んでいる商品の一覧です。値段と在庫は本店（sumura-sake.com）で直します。' },
  { to: '/about',     mark: '店', head: 'お店の情報を直す',    say: '住所・お電話・営業時間・定休日など。五つの言葉に自動で直ります。' },
  { to: '/home',      mark: '扉', head: 'ホームの文と写真',    say: 'お客様がいちばん最初に見る頁です。見出しや紹介文、写真を直せます。' },
  { to: '/producers', mark: '匠', head: '造り手の紹介を直す',  say: 'お取り扱いしている生産者の頁です。前書きや案内文を直せます。' },
  { to: '/access',    mark: '道', head: 'アクセスの案内',      say: 'お店までの行き方、地図まわりの文章です。' },
  { to: '/legal',     mark: '法', head: '特定商取引法の表記',  say: '返品・送料・お支払いなどの決まりごとです。' },
  { to: '/admin-rooms', mark: '鍵', head: '鍵のかかった部屋',   say: '合言葉を知っている方だけが読める部屋です。作る・直す・消す、合言葉の付け替えもここから。', raw: true },
];

/** お店の控室。更新はすべてここから始められます */
export function AdminPage() {
  const { lang } = useSite();
  const [here, setHere] = useState<'見ている' | '鏡' | null>(null);
  const [on, setOn] = useState(false);
  const [base, setBase] = useState('');   /* 練習用のサイトでは '/preview' が頭につきます */

  useEffect(() => {
    setHere(isMirror() ? '鏡' : '見ている');
    setOn(editMode());
    setBase(window.location.pathname.indexOf('/preview') === 0 ? '/preview' : '');
  }, []);

  const P = pre(lang);
  const go = (c: Card) => base + (c.raw ? '' : P) + c.to;

  const turn = (v: boolean) => { setEditMode(v); setOn(v); };

  return (
    <div className="rm-wrap">
      <div className="rm-head">
        <div className="rm-kick">すむら酒店</div>
        <h1 className="rm-title">お店の控室</h1>
        <p className="rm-lead">
          サイトを直すところは、すべてここから入れます。<br />
          直したいものの札を押してください。
        </p>
      </div>

      {here === '見ている' ? (
        <div className="rm-note rm-warn">
          <b>ここは、お客様に見えている本物のサイトです。</b>
          <p>直すときは、練習用のサイトからお入りください。下の釦を押すと移ります。</p>
          <a className="rm-go" href="/preview/admin">直すためのサイトへ移る</a>
        </div>
      ) : null}

      {here === '鏡' ? (
        <div className={on ? 'rm-note rm-on' : 'rm-note'}>
          {on ? (
            <>
              <b>いま、直せる状態です。</b>
              <p>札を押して進み、直したいところを押してください。やめるときは下の釦を押します。</p>
              <button className="rm-stop" onClick={() => turn(false)}>直すのをやめる</button>
            </>
          ) : (
            <>
              <b>まず、直せる状態にします。</b>
              <p>下の釦を押してから、札を押して進んでください。</p>
              <button className="rm-go" onClick={() => turn(true)}>直せる状態にする</button>
            </>
          )}
        </div>
      ) : null}

      <div className="rm-cards">
        {CARDS.map((c) => (
          <a key={c.to} href={go(c)} className="rm-card">
            <span className="rm-mark">{c.mark}</span>
            <span className="rm-body">
              <span className="rm-h">{c.head}</span>
              <span className="rm-s">{c.say}</span>
            </span>
            <span className="rm-arrow">ひらく →</span>
          </a>
        ))}
      </div>

      <div className="rm-how">
        <h2>使いかた（三つだけ）</h2>
        <ol>
          <li><b>直せる状態にする</b>ここの上の釦を一度押します。押すと、直せるところに金色の点線がつきます。</li>
          <li><b>直したいところを押す</b>その場に大きな窓が開きます。書き換えて「これでなおす」を押してください。</li>
          <li><b>しばらく待つ</b>英語・フランス語・中国語・韓国語の訳も、そのときに作ります。三十秒ほどそのままお待ちください。</li>
        </ol>
        <p className="rm-tip">
          直したものは、この練習用のサイトにすぐ出ます。お客様に見えている本物のサイトへは、
          あとで店主が確かめてから移します。まちがえても、お客様の目には触れませんのでご安心ください。
        </p>
      </div>

      <div className="rm-foot">
        <a className="rm-plain" href="/home">お客様に見えているサイトを見る</a>
      </div>
    </div>
  );
}
