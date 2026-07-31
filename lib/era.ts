export type Era = '1995' | '2005' | '2010' | 'now';
export const ERAS: Era[] = ['now', '2010', '2005', '1995'];
export const DEFAULT_ERA: Era = 'now';

/** localStorage から時代を読む（旧「2000」は「2005」に読み替え） */
export function readEra(): Era {
  try {
    let e = localStorage.getItem('era');
    if (e === '2000') { e = '2005'; localStorage.setItem('era', e); }
    return (ERAS as string[]).includes(e || '') ? (e as Era) : DEFAULT_ERA;
  } catch {
    return DEFAULT_ERA;
  }
}

/** 2010年代・2020年代は「HTMLサイトらしさ」を落とした表示にする */
export function isModern(era: Era | 'mukashi'): boolean {
  return era === '2010' || era === 'now';
}
