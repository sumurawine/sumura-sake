'use client';
import { A } from '@/components/A';
import { T } from '@/components/T';
import { useSite } from '@/components/Providers';
import { MODERN } from '@/lib/decor';
import { isModern } from '@/lib/era';

export function RoomBack() {
  const { lang, eraView } = useSite();
  const modern = isModern(eraView as any);
  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <A href="/secret" style={{ textDecoration: 'none' }}>
        {modern
          ? <span className="btn" data-i18n="rm-back">{MODERN[lang].back}</span>
          : <T k="rm-back" as="span" kind="btn" className="btn" />}
      </A>
    </div>
  );
}
