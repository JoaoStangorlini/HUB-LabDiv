import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SidebarLeft } from '@/components/layout/SidebarLeft';
import { SidebarRight } from '@/components/layout/SidebarRight';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { HomeClientView } from '@/components/HomeClientView';
import { SearchProvider } from '@/providers/SearchProvider';
import { fetchSubmissions, fetchTrendingSubmissions, getFeaturedSubmissions, getTrendingTags, getSidebarTags, getScientistsInOrbit } from '@/app/actions/submissions';

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
    author: initialCollection || undefined,
    is_featured: initialCategory === 'Destaques' ? true : undefined,
    sort: 'recentes'
  });

  const trendingItems = await fetchTrendingSubmissions();
  const featuredItems = await getFeaturedSubmissions(10);
  const trendingTags = await getTrendingTags();
  const sidebarTags = await getSidebarTags();
  const scientists = await getScientistsInOrbit();

  return (
    <SearchProvider>
      <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen flex flex-col">
        <Header />

        <div className="flex-1 w-full max-w-[1920px] mx-auto flex justify-center">
          {/* Esquerda: Navegação / Side Menu */}
          <aside className="hidden xl:block w-[280px] shrink-0 border-r border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark/50">
            <div className="sticky top-20">
              <SidebarLeft />
            </div>
          </aside>

          {/* Centro: Feed */}
          <main className="flex-1 max-w-[800px] w-full px-4 sm:px-6 py-8 lg:py-12">
            <HomeClientView
              initialItems={initialItems}
              initialHasMore={initialHasMore}
              initialCategory={initialCategory}
              trendingItems={trendingItems}
              featuredItems={featuredItems}
              trendingTags={trendingTags}
            />
          </main>

          {/* Direita: Informações Extra / Trending */}
          <aside className="hidden lg:block w-[320px] shrink-0 px-4 py-8 border-l border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark/50">
            <div className="sticky top-20">
              <SidebarRight tags={sidebarTags} authors={scientists} />
            </div>
          </aside>
        </div>

        <Footer />

        {/* 🚀 FAB: Lançar à Órbita (Desktop Only — xl+) */}
        <Link
          href="/enviar"
          className="hidden xl:flex fixed bottom-8 right-8 z-[60] bg-brand-blue text-white px-6 h-14 rounded-full shadow-2xl items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all group"
          title="Lançar à Órbita"
        >
          <span className="material-symbols-outlined text-2xl group-hover:-translate-y-1 transition-transform">rocket_launch</span>
          <span className="font-bold text-sm tracking-wide">Lançar à Órbita</span>
        </Link>

        {/* 📱 Mobile BottomNavBar */}
        <BottomNavBar />
      </div>
    </SearchProvider>
  );
}
