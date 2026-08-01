import { metaFor } from '@/lib/siteMeta';
import { MukashiPage } from '@/components/pages/MukashiPage';
export default function Page() { return <MukashiPage />; }
export const metadata = metaFor('/mukashi');
