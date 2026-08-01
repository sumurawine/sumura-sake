import { metaFor } from '@/lib/siteMeta';
import { HomePage } from '@/components/pages/HomePage';
export default function Page() { return <HomePage />; }
export const metadata = metaFor('/home');
