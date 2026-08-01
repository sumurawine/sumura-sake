import { metaFor } from '@/lib/siteMeta';
import { AboutPage } from '@/components/pages/AboutPage';
export default function Page() { return <AboutPage />; }
export const metadata = metaFor('/about');
