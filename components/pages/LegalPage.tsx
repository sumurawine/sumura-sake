'use client';
import { Shell } from '@/components/Shell';
import { T } from '@/components/T';

export function LegalPage() {
  return (
    <Shell footerRule={false}>
      <div className="panel">
        <T k="law-head" as="div" kind="head" className="pixhead" />
        <table className="retro" style={{ fontSize: 13, lineHeight: 1.7 }}>
          <tbody>
            <tr><T k="law-seller-label" as="th" style={{ width: '30%' }} /><T k="law-seller-val" as="td" /></tr>
            <tr><T k="law-rep-label" as="th" /><td>洲村博志</td></tr>
            <tr><T k="law-ops-label" as="th" /><td>洲村博志</td></tr>
            <tr><T k="law-address-label" as="th" /><T k="law-address-val" as="td" /></tr>
            <tr><T k="law-phone-label" as="th" /><td>0836-21-4721</td></tr>
            <tr><T k="law-email-label" as="th" /><td>hiroshi@sumura-sake.com</td></tr>
            <tr><T k="law-fee-label" as="th" /><T k="law-fee-val" as="td" /></tr>
            <tr><T k="law-shipping-label" as="th" /><T k="law-shipping-val" as="td" /></tr>
            <tr><T k="law-return-label" as="th" /><T k="law-return-val" as="td" /></tr>
            <tr><T k="law-delivery-label" as="th" /><T k="law-delivery-val" as="td" /></tr>
            <tr><T k="law-payment-label" as="th" /><T k="law-payment-val" as="td" /></tr>
            <tr><T k="law-shipper-label" as="th" /><T k="law-shipper-val" as="td" /></tr>
            <tr><T k="law-license-label" as="th" /><T k="law-license-val" as="td" /></tr>
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
