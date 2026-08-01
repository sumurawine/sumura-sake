import { metaFor } from '@/lib/siteMeta';
import { GamePage } from '@/components/pages/GamePage';
export default function Page() { return <GamePage />; }
export const metadata = metaFor('/game');
