import { metaFor } from '@/lib/siteMeta';
import { BlogPostPage } from '@/components/pages/BlogPostPage';
export default function Page() { return <BlogPostPage />; }
export const metadata = metaFor('/blog');
