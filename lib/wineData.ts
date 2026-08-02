import fs from 'node:fs';
import path from 'node:path';
import type { Item, I18nData } from './store';

/* ビルドのときだけ読みます（書き出しは静的なので、これで十分です） */
let _items: Item[] | null = null;
let _i18n: I18nData | null = null;

const read = (f: string) => {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', f), 'utf8')); }
  catch { return null; }
};

export function allItems(): Item[] {
  if (_items) return _items;
  const j = read('products.json');
  _items = (j && Array.isArray(j.items) ? j.items : []) as Item[];
  return _items;
}

export function wineI18n(): I18nData | null {
  if (_i18n) return _i18n;
  _i18n = read('products.i18n.json') as I18nData | null;
  return _i18n;
}
