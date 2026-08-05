'use client';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';
import { Calendar } from '@/components/Calendar';

export function AboutPage() {
  return (
    <Shell>
      <div className="panel">
        <T k="about-head" as="div" kind="head" className="pixhead" />
        <table className="retro">
          <tbody>
            <tr><T k="about-name-label" as="th" style={{ width: '32%' }} /><T k="ab-name-val" as="td" /></tr>
            <tr><T k="about-alias-label" as="th" /><T k="about-alias-val" as="td" /></tr>
            <tr><T k="about-location-label" as="th" /><T k="about-location-val" as="td" /></tr>
            <tr><T k="about-phone-label" as="th" /><td>0836-21-4721</td></tr>
            <tr><T k="about-rep-label" as="th" /><T k="about-rep-val" as="td" /></tr>
            <tr><T k="about-history-label" as="th" /><T k="about-history-val" as="td" /></tr>
            <tr><T k="about-biz-label" as="th" /><T k="about-biz-val" as="td" /></tr>
            <tr><T k="about-products-label" as="th" /><T k="about-products-val" as="td" /></tr>
            <tr><T k="about-license-label" as="th" /><T k="about-license-val" as="td" /></tr>
            <tr><T k="about-hours-label" as="th" /><T k="about-hours-val" as="td" /></tr>
          </tbody>
        </table>
      </div>

      <div className="panel">
        <T k="ab-cal-head" as="div" kind="head" className="pixhead" />
        <T k="ab-cal-note" as="p" className="hint" style={{ marginBottom: 8 }} />
        <Calendar />
      </div>
    </Shell>
  );
}
