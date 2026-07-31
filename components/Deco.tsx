'use client';
import { asset } from '@/lib/paths';
import { useSite } from './Providers';

export function Gif({ name, w, h, style }: { name: string; w: number; h: number; style?: React.CSSProperties }) {
  return <img src={asset(`/gif/${name}`)} width={w} height={h} alt="" style={style} />;
}

const mid = { verticalAlign: 'middle', margin: '0 5px' } as const;

/** 2005年代の見出し下・区切り下に入る飾り */
export function DecoRow({ top = false }: { top?: boolean }) {
  const { eraView } = useSite();
  if (eraView !== '2005') return null;
  if (top) {
    return (
      <div className="tw-deco">
        <Gif name="const.gif" w={104} h={22} style={mid} />
        <Gif name="wine.gif" w={22} h={32} style={mid} />
        <Gif name="new.gif" w={40} h={16} style={mid} />
        <Gif name="heart.gif" w={16} h={14} style={mid} />
        <Gif name="star.gif" w={18} h={18} style={mid} />
        <Gif name="heart.gif" w={16} h={14} style={mid} />
      </div>
    );
  }
  return (
    <div className="tw-deco">
      <Gif name="star.gif" w={18} h={18} style={{ margin: '0 5px' }} />
      <Gif name="heart.gif" w={16} h={14} style={{ margin: '0 5px' }} />
      <Gif name="wine.gif" w={22} h={32} style={{ margin: '0 5px' }} />
      <Gif name="heart.gif" w={16} h={14} style={{ margin: '0 5px' }} />
      <Gif name="star.gif" w={18} h={18} style={{ margin: '0 5px' }} />
    </div>
  );
}

/** 虹色の区切り線（2005年代は下に飾りが付きます） */
export function Rainbow() {
  return (<><hr className="rainbow" /><DecoRow /></>);
}

/** 2005年代の画面下に流れる帯 */
export function Ticker({ text }: { text: string }) {
  const { eraView } = useSite();
  if (eraView !== '2005') return null;
  return <div id="tw-ticker"><b>{`☆*:.｡. ${text} .｡.:*☆`}</b></div>;
}
