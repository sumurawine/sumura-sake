import { metaFor } from '@/lib/siteMeta';
import { Suspense } from 'react';
import { ContactPage } from '@/components/pages/ContactPage';
export default function Page() {
  return <Suspense fallback={null}><ContactPage /></Suspense>;
}
export const metadata = metaFor('/contact');
