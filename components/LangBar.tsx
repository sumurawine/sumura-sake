'use client';
import { usePathname } from 'next/navigation';
import { LANGS, LANG_FLAGS, type Lang } from '@/lib/i18n';
import { useSite } from './Providers';

/** 2020年代の画面では、国旗ではなく静かな文字で示します */
const SHORT: Record<Lang, string> = { jp: 'JP', en: 'EN', fr: 'FR', zh: 'ZH', ko: 'KO' };

export function LangBar() {
  const { lang, setLang, eraView } = useSite();
  const path = usePathname() || '';
  /* 点灯は住所を第一に。住所に言語が無い頁だけ、覚えている言語に従います */
  const m = path.match(/^\/(en|fr|zh|ko)(?=\/|$)/);
  const active: Lang = (m ? (m[1] as Lang) : (/^\/(wine|maker|wines)(\/|$)/.test(path) ? 'jp' : lang));
  const quiet = eraView === 'now';
  return (
    <div id="lang-bar" className={quiet ? 'lb-quiet' : undefined}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          data-lang={l}
          className={l === active ? 'active' : undefined}
          onClick={() => setLang(l)}
        >
          {quiet ? SHORT[l] : LANG_FLAGS[l]}
        </button>
      ))}
    </div>
  );
}
