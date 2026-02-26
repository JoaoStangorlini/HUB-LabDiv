import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeClientView } from '@/components/HomeClientView';
import { fetchSubmissions, fetchTrendingSubmissions, getFeaturedSubmissions, getTrendingTags } from '@/app/actions/submissions';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

// Helper to ensure stability before we have real data
export const revalidate = 0;

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, type?: string, collection?: string, q?: string }> }) {
  const params = await searchParams;
  const initialCategory = params.category || params.type || 'Todos';
  const initialCollection = params.collection || '';
  const initialQuery = params.q || '';

  // Fetch initial page 1
  const { items: initialItems, hasMore: initialHasMore } = await fetchSubmissions({
    page: 1,
    limit: 12,
    query: initialQuery,
    categories: initialCategory === 'Todos' || initialCategory === 'Destaques' ? [] : [initialCategory],
    author: initialCollection || undefined, // Mapping collection to author name for now
    is_featured: initialCategory === 'Destaques' ? true : undefined,
    sort: 'recentes'
  });

  const trendingItems = await fetchTrendingSubmissions();
  const featuredItems = await getFeaturedSubmissions(10);
  const trendingTags = await getTrendingTags();

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen">
      <Header />
      <MainLayoutWrapper>
        <div className="py-8 lg:py-12">
          <HomeClientView
            initialItems={initialItems}
            initialHasMore={initialHasMore}
            initialCategory={initialCategory}
            trendingItems={trendingItems}
            featuredItems={featuredItems}
            trendingTags={trendingTags}
          />
        </div>
      </MainLayoutWrapper>
      <Footer />
    </div>
  );
}
