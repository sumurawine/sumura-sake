import { metaFor } from '@/lib/siteMeta';
import { ProducersPage } from '@/components/pages/ProducersPage';
export default function Page() { return <ProducersPage />; }
export const metadata = metaFor('/producers');
