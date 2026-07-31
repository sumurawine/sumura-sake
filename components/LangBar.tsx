'use client';
import { LANGS, LANG_FLAGS, type Lang } from '@/lib/i18n';
import { useSite } from './Providers';

/** 2020年代の画面では、国旗ではなく静かな文字で示します */
const SHORT: Record<Lang, string> = { jp: 'JP', en: 'EN', fr: 'FR', zh: 'ZH', ko: 'KO' };

export function LangBar() {
  const { lang, setLang, eraView } = useSite();
  const quiet = eraView === 'now';
  return (
    <div id="lang-bar" className={quiet ? 'lb-quiet' : undefined}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          data-lang={l}
          className={l === lang ? 'active' : undefined}
          onClick={() => setLang(l)}
        >
          {quiet ? SHORT[l] : LANG_FLAGS[l]}
        </button>
      ))}
    </div>
  );
}
