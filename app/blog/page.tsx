import { metaFor } from '@/lib/siteMeta';
import { BlogPage } from '@/components/pages/BlogPage';
export default function Page() { return <BlogPage />; }
export const metadata = metaFor('/blog');
