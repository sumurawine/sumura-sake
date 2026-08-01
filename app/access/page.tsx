import { metaFor } from '@/lib/siteMeta';
import { AccessPage } from '@/components/pages/AccessPage';
export default function Page() { return <AccessPage />; }
export const metadata = metaFor('/access');
