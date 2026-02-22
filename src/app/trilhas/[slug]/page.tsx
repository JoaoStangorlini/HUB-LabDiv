import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MediaCard } from '@/components/MediaCard';
import { fetchPlaylistBySlug, fetchPlaylistItems } from '@/app/actions/playlists';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

export default async function TrilhaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;
    const playlist = await fetchPlaylistBySlug(slug);

    if (!playlist) {
        notFound();
    }

    const items = await fetchPlaylistItems(playlist.id);

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow flex flex-col pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 mt-4">
                        <Link href="/trilhas" className="hover:text-brand-blue dark:hover:text-brand-yellow transition-colors">Trilhas</Link>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-gray-900 dark:text-gray-100" aria-current="page">{playlist.title}</span>
                    </nav>

                    {/* Header */}
                    <div className="bg-white dark:bg-card-dark rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 mb-12 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-brand-blue via-brand-yellow to-brand-red group-hover:w-4 transition-all duration-500"></div>
                        <div className="max-w-3xl relative z-10 pl-4 md:pl-0">
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                                {playlist.title}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                {playlist.description}
                            </p>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] text-gray-50 dark:text-white/5 z-0 pointer-events-none select-none overflow-hidden" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
                    </div>

                    {/* Timeline / Items */}
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-4 mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-blue dark:text-brand-yellow">list_alt</span>
                                Conteúdos da Trilha
                            </h2>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{items.length} itens</span>
                        </div>

                        {items.length > 0 ? (
                            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-blue/20 before:via-brand-yellow/20 dark:before:via-brand-yellow/10 before:to-brand-red/20">
                                {items.map((item, index) => (
                                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        {/* Timeline Dot */}
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-background-dark bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-brand-blue group-hover:text-white dark:group-hover:bg-brand-yellow dark:group-hover:text-background-dark shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all duration-300 z-10 group-hover:scale-110">
                                            <span className="text-sm font-bold">{index + 1}</span>
                                        </div>
                                        {/* Card Container */}
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] hover:-translate-y-1 transition-transform duration-300">
                                            <div className="relative">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-blue to-brand-red rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
                                                <div className="relative bg-white dark:bg-card-dark rounded-2xl h-full shadow-sm hover:shadow-xl transition-shadow w-full group-hover:border-brand-blue/30 dark:group-hover:border-brand-yellow/30 border border-transparent">
                                                    <MediaCard {...item} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">inventory_2</span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Trilha Vazia</h3>
                                <p className="text-gray-500 dark:text-gray-400">Nenhum conteúdo adicionado a esta trilha ainda.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
