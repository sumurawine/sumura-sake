import { metaFor } from '@/lib/siteMeta';
import { VirtualPage } from '@/components/pages/VirtualPage';
export default function Page() { return <VirtualPage />; }
export const metadata = metaFor('/virtual');
