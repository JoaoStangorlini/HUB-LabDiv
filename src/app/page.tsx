import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { SearchProvider } from '@/providers/SearchProvider';
import {
  fetchSubmissions,
  fetchTrendingSubmissions,
  getFeaturedSubmissions,
  getTrendingTags,
  getSidebarTags,
  getScientistsInOrbit
} from '@/app/actions/submissions';
import { Rocket } from 'lucide-react';

// V8.0 Performance Nuclear: Dynamic Isolation
const HomeClientView = dynamic(() => import('@/components/HomeClientView').then(mod => mod.HomeClientView));

const SidebarLeft = dynamic(() => import('@/components/layout/SidebarLeft').then(mod => mod.SidebarLeft));

const SidebarRight = dynamic(() => import('@/components/layout/SidebarRight').then(mod => mod.SidebarRight));

export const revalidate = 60;

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, type?: string, collection?: string, q?: string }> }) {
  const params = await searchParams;
  const initialCategory = params.category || params.type || 'Todos';
  const initialCollection = params.collection || '';
  const initialQuery = params.q || '';

  // V8.0 NUCLEAR ROOT: Parallel Data Fetching
  const [
    { items: initialItems, hasMore: initialHasMore },
    trendingItems,
    featuredItems,
    trendingTags,
    sidebarTags,
    scientists
  ] = await Promise.all([
    fetchSubmissions({
      page: 1,
      limit: 12,
      query: initialQuery,
      categories: initialCategory === 'Todos' || initialCategory === 'Destaques' ? [] : [initialCategory],
      author: initialCollection || undefined,
      is_featured: initialCategory === 'Destaques' ? true : undefined,
      sort: 'recentes'
    }),
    fetchTrendingSubmissions(),
    getFeaturedSubmissions(10),
    getTrendingTags(),
    getSidebarTags(),
    getScientistsInOrbit()
  ]);

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

        {/* FAB via Lucide */}
        <Link
          href="/enviar"
          className="hidden xl:flex fixed bottom-8 right-8 z-[60] bg-brand-blue text-white px-6 h-14 rounded-full shadow-2xl items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all group"
          title="Lançar à Órbita"
        >
          <Rocket className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          <span className="font-bold text-sm tracking-wide">Lançar à Órbita</span>
        </Link>

        <BottomNavBar />
      </div>
    </SearchProvider>
  );
}
