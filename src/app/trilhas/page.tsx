import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { fetchPlaylists } from '@/app/actions/playlists';
import Link from 'next/link';

export const revalidate = 0;

export default async function TrilhasPage() {
    const playlists = await fetchPlaylists();

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow flex flex-col pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    {/* Header */}
                    <div className="mb-12 text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-blue to-brand-red text-white flex-row-reverse rounded-full text-xs font-bold uppercase tracking-wider shadow-lg mb-6">
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                            Explorar Conhecimento
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                            Trilhas de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow">Aprendizagem</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Caminhos guiados através do acervo do IFUSP. Siga sequências lógicas de materiais curados por nossos especialistas.
                        </p>
                    </div>

                    {/* Grid */}
                    {playlists.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {playlists.map(playlist => (
                                <Link href={`/trilhas/${playlist.slug}`} key={playlist.id} className="group flex flex-col bg-white dark:bg-card-dark rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden transform hover:-translate-y-1">
                                    <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-brand-yellow/10 to-brand-red/20 group-hover:opacity-70 transition-opacity opacity-40"></div>
                                        <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 group-hover:scale-110 transition-transform duration-500 z-10" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-blue transition-colors line-clamp-2">
                                            {playlist.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 flex-1 mb-4">
                                            {playlist.description}
                                        </p>
                                        <div className="flex items-center text-brand-blue dark:text-brand-yellow font-bold text-sm uppercase tracking-wide gap-2 mt-auto">
                                            Iniciar Trilha
                                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">search_off</span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhuma trilha encontrada</h3>
                            <p className="text-gray-500 dark:text-gray-400">As trilhas de aprendizagem estão sendo preparadas e logo estarão disponíveis.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
