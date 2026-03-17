import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SidebarLeft } from '@/components/layout/SidebarLeft';
import { SidebarRight } from '@/components/layout/SidebarRight';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import {
  fetchSubmissions,
  fetchTrendingSubmissions,
  getFeaturedSubmissions,
  getTrendingTags,
} from '@/app/actions/submissions';
import { Rocket } from 'lucide-react';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { FluxoFeedbackCard } from '@/app/FluxoFeedbackCard';

// Direct import — contains LCP image, must SSR
import { HomeClientView } from '@/components/HomeClientView';

// Performance: Use ISR with 60s revalidation instead of force-dynamic
// This allows cached SSR responses, combined with unstable_cache wrappers on data fetches
export const revalidate = 60;

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, type?: string, collection?: string, q?: string }> }) {
  const params = await searchParams;
  const initialCategory = params.category || params.type || 'Todos';
  const initialCollection = params.collection || '';
  const initialQuery = params.q || '';

  // Parallel Data Fetching — only above-the-fold data
  const [
    { items: initialItems, hasMore: initialHasMore },
    trendingItems,
    featuredItems,
    trendingTags,
  ] = await Promise.all([
    fetchSubmissions({
      page: 1,
      limit: 6,
      query: initialQuery,
      categories: initialCategory === 'Todos' ? [] : [initialCategory],
      sort: 'recentes'
    }),
    fetchTrendingSubmissions(),
    getFeaturedSubmissions(3),
    getTrendingTags(),
  ]);

  // Performance: skip sequential checkUserLikes on server (adds 100-200ms TTFB)
  // Liked status will hydrate on client side instead of blocking SSR
  const initialLikedIds: string[] = [];

  return (
    <MainLayoutWrapper
      userId={undefined}
      rightSidebar={<FluxoFeedbackCard />}
    >
      <HomeClientView
        initialItems={initialItems}
        initialHasMore={initialHasMore}
        initialCategory={initialCategory}
        trendingItems={trendingItems}
        featuredItems={featuredItems}
        trendingTags={trendingTags}
        initialLikedIds={initialLikedIds}
      />
    </MainLayoutWrapper>
  );
}
