import { metaFor } from '@/lib/siteMeta';
import { StorePage } from '@/components/pages/StorePage';
export default function Page() { return <StorePage />; }
export const metadata = metaFor('/store');
