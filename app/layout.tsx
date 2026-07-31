import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { LangBar } from '@/components/LangBar';
import { Tidy } from '@/components/Tidy';
import { TimeTravel } from '@/components/TimeTravel';

const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';

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
        <link rel="stylesheet" href={`${BP}/base.css`} />
        <link rel="stylesheet" href={`${BP}/eras.css`} />
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
