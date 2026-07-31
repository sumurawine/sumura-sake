'use client';
import { useEffect, useState } from 'react';

export function Clock() {
  const [t, setT] = useState('--:--:--');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => ('0' + n).slice(-2);
      setT(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <div className="clock" id="clk">{t}</div>;
}
