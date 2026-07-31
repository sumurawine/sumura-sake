'use client';
import { LANGS, LANG_FLAGS } from '@/lib/i18n';
import { useSite } from './Providers';

export function LangBar() {
  const { lang, setLang } = useSite();
  return (
    <div id="lang-bar">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          data-lang={l}
          className={l === lang ? 'active' : undefined}
          onClick={() => setLang(l)}
        >
          {LANG_FLAGS[l]}
        </button>
      ))}
    </div>
  );
}
