import { metaFor } from '@/lib/siteMeta';
import { NewsPage } from '@/components/pages/NewsPage';
export default function Page() { return <NewsPage />; }
export const metadata = metaFor('/news');
