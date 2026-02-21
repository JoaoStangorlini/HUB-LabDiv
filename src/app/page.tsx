import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeClientView } from '@/components/HomeClientView';
import { MediaCardProps } from '@/components/MediaCard';
import { supabase } from '@/lib/supabase';

// Helper to ensure stability before we have real data
export const revalidate = 0;

export default async function Home() {
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('status', 'aprovado')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
  }

  // Fetch like counts for all submissions
  const { data: likeCounts } = await supabase
    .from('curtidas')
    .select('submission_id');

  // Build a map of submission_id -> count
  const likeMap: Record<string, number> = {};
  if (likeCounts) {
    for (const row of likeCounts) {
      likeMap[row.submission_id] = (likeMap[row.submission_id] || 0) + 1;
    }
  }

  const items: MediaCardProps[] = submissions?.map(sub => ({
    id: sub.id,
    title: sub.title,
    description: sub.description,
    authors: sub.authors,
    mediaType: sub.media_type,
    mediaUrl: sub.media_url,
    category: sub.category,
    isFeatured: sub.featured,
    likeCount: likeMap[sub.id] || 0,
  })) || [];

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col">
        <HomeClientView initialItems={items} />
      </main>
      <Footer />
    </div>
  );
}
