'use client';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { A } from '@/components/A';

const MAP_SRC = 'https://www.google.com/maps?q=%E3%80%92755-0072%20%E5%B1%B1%E5%8F%A3%E7%9C%8C%E5%AE%87%E9%83%A8%E5%B8%82%E4%B8%AD%E6%9D%913-6-20%20%E3%81%99%E3%82%80%E3%82%89%E9%85%92%E5%BA%97&z=16&output=embed';
const DIR_URL = 'https://www.google.com/maps/dir/?api=1&destination=%E3%80%92755-0072%20%E5%B1%B1%E5%8F%A3%E7%9C%8C%E5%AE%87%E9%83%A8%E5%B8%82%E4%B8%AD%E6%9D%913-6-20%20%E3%81%99%E3%82%80%E3%82%89%E9%85%92%E5%BA%97';

export function AccessPage() {
  return (
    <Shell>
      <div className="panel">
        <T k="ac-head" as="div" kind="head" className="pixhead" />
        <T k="ac-sub" as="p" kind="sub" className="sub" />
        <table>
          <tbody>
            <tr><T k="ac-l-name" as="th" /><T k="ac-v-name" as="td" /></tr>
            <tr><T k="ac-l-addr" as="th" /><T k="ac-v-addr" as="td" /></tr>
            <tr><T k="ac-l-tel" as="th" /><td>0836-21-4721</td></tr>
            <tr><T k="ac-l-hours" as="th" /><T k="ac-v-hours" as="td" /></tr>
            <tr><T k="ac-l-close" as="th" /><T k="ac-v-close" as="td" /></tr>
          </tbody>
        </table>
      </div>

      <div className="panel">
        <T k="ac-map-head" as="div" kind="head" className="pixhead" />
        <div className="x-thumb" style={{ borderStyle: 'inset', borderWidth: 2, marginTop: 8 }}>
          <iframe
            src={MAP_SRC}
            width="100%"
            height={340}
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="map"
          />
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <a href={DIR_URL} target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
            <T k="ac-route" as="span" kind="btn" className="btn" />
          </a>
        </div>
      </div>

      <div className="panel">
        <T k="ac-come-head" as="div" kind="head" className="pixhead" />
        <T k="ac-come-1" as="p" />
        <T k="ac-come-2" as="p" />
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <a href="tel:0836214721" style={{ textDecoration: 'none' }}>
            <T k="ac-tel-btn" as="span" kind="btn" className="btn" />
          </a>
          &nbsp;
          <A href="/contact" style={{ textDecoration: 'none' }}>
            <T k="ac-ct-btn" as="span" kind="btn" className="btn" />
          </A>
        </div>
      </div>
    </Shell>
  );
}
