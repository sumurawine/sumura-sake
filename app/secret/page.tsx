import { metaFor } from '@/lib/siteMeta';
import { Suspense } from 'react';
import { SecretPage } from '@/components/pages/SecretPage';
export default function Page() {
  return <Suspense fallback={null}><SecretPage /></Suspense>;
}
export const metadata = metaFor('/secret');
