'use client';
import { useEffect, useState } from 'react';

const MN = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const DW = ['日','月','火','水','木','金','土'];

function monthHtml(y: number, m: number): string {
  const today = new Date(), first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
  let h = '<table class="retro" style="width:auto;display:inline-table;margin:4px 4px 4px 0;min-width:248px">';
  h += '<tr><th colspan="7" style="text-align:center;color:#ffe14d;padding:6px 4px">' + y + '年 ' + MN[m] + '</th></tr><tr>';
  for (let i = 0; i < 7; i++) {
    const col = i === 0 ? 'color:#ff6060' : i === 2 ? 'color:#ff9040' : i === 6 ? 'color:#6098ff' : '';
    h += '<th style="text-align:center;padding:3px 5px;font-size:13px;' + col + '">' + DW[i] + '</th>';
  }
  h += '</tr><tr>';
  for (let p = 0; p < first.getDay(); p++) h += '<td style="padding:3px 5px"></td>';
  for (let d = 1; d <= last.getDate(); d++) {
    const dt = new Date(y, m, d), dow = dt.getDay();
    const isTue = dow === 2, isTod = dt.toDateString() === today.toDateString();
    let s = 'text-align:center;padding:3px 5px;font-size:13px;';
    if (isTue) s += 'background:#3a1500;color:#ff7040;';
    else if (dow === 0) s += 'color:#ff6060;';
    else if (dow === 6) s += 'color:#6098ff;';
    if (isTod) s += 'outline:2px solid #ffe14d;font-weight:bold;';
    const inner = isTue ? d + '<br><span style="font-size:9px;line-height:1">休</span>' : String(d);
    const cls = (isTue ? 'cal-off' : '') + (isTod ? ' cal-today' : '');
    h += '<td class="' + cls.trim() + '" style="' + s + '">' + inner + '</td>';
    if (dow === 6 || d === last.getDate()) {
      if (d === last.getDate()) for (let q = dow + 1; q <= 6; q++) h += '<td style="padding:3px 5px"></td>';
      h += '</tr>';
      if (d < last.getDate()) h += '<tr>';
    }
  }
  h += '</table>';
  return h;
}

export function Calendar() {
  const [html, setHtml] = useState('');
  useEffect(() => {
    const now = new Date(), y1 = now.getFullYear(), m1 = now.getMonth();
    const nx = new Date(y1, m1 + 1, 1);
    setHtml(monthHtml(y1, m1) + monthHtml(nx.getFullYear(), nx.getMonth()));
  }, []);
  return (
    <div id="cal" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start', overflowX: 'auto' }}
      dangerouslySetInnerHTML={{ __html: html }} />
  );
}
