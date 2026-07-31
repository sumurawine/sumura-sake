import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { LangBar } from '@/components/LangBar';
import { Tidy } from '@/components/Tidy';
import { TimeTravel } from '@/components/TimeTravel';

const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';
/** CSSを変えたら数字を上げてください（ブラウザのキャッシュ対策） */
const CSSV = process.env.NEXT_PUBLIC_CSSV || String(Date.now());

export const metadata: Metadata = {
  title: 'すむら酒店 ｜ Liquor Shop Sumura',
};

/** 描画前に時代を反映してチラつきを防ぎます */
const eraInit = `(function(){try{
var e=localStorage.getItem('era');if(e==='2000'){e='2005';localStorage.setItem('era',e);}
var ok=['1995','2005','2010','now'];if(ok.indexOf(e)<0)e='now';
if(/\\/mukashi\\/?$/.test(location.pathname))e='mukashi';
document.documentElement.setAttribute('data-era',e);
}catch(x){document.documentElement.setAttribute('data-era','now');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-era="now">
      <head>
        <link rel="stylesheet" href={`${BP}/base.css?v=${CSSV}`} />
        <link rel="stylesheet" href={`${BP}/eras.css?v=${CSSV}`} />
        <link rel="stylesheet" href={`${BP}/modern.css?v=${CSSV}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Shippori+Mincho:wght@400;600&family=Zen+Kaku+Gothic+New:wght@400;500&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: eraInit }} />
      </head>
      <body>
        <Providers>
          {children}
          <LangBar />
          <TimeTravel />
          <Tidy />
        </Providers>
      </body>
    </html>
  );
}
