import { metaFor } from '@/lib/siteMeta';
import { LegalPage } from '@/components/pages/LegalPage';
export default function Page() { return <LegalPage />; }
export const metadata = metaFor('/legal');
