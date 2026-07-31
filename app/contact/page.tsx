import { Suspense } from 'react';
import { ContactPage } from '@/components/pages/ContactPage';
export default function Page() {
  return <Suspense fallback={null}><ContactPage /></Suspense>;
}
