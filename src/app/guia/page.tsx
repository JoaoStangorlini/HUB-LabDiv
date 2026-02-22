import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function GuiaPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-blue prose-img:rounded-xl">
                <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
                    <h1 className="text-4xl md:text-5xl text-gray-900 dark:text-white mb-4">
                        Guia de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow pr-2">Boas Práticas</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 lead font-medium">
                        Como capturar e compartilhar a ciência que acontece no IF-USP da melhor forma possível para o nosso Hub.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Co-autoria e Colaboração */}
                    <section className="bg-brand-blue/5 dark:bg-brand-blue/10 rounded-3xl p-8 border-2 border-brand-blue/20 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/20 transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-2xl">person_add</span>
                            </div>
                            <h2 className="text-3xl m-0 font-display font-bold">Co-autoria e Créditos</h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            A ciência é um esforço coletivo. No <strong>Hub de Comunicação Científica</strong>, incentivamos que você marque todos os colaboradores que participaram da criação do material.
                        </p>
                        <ul className="space-y-4 m-0">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-blue mt-1">check_circle</span>
                                <div className="text-sm">
                                    <strong>Marque seus colegas:</strong> Use o campo de co-autores para buscar perfis de outros usuários do sistema. Isso vincula a obra ao perfil deles também!
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-blue mt-1">check_circle</span>
                                <div className="text-sm">
                                    <strong>Menção em Texto:</strong> Se o colaborador não tiver perfil ainda, você pode citar o nome dele diretamente no campo principal de autores (separados por vírgula).
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Seção de Fotografia */}
                    <section className="bg-white dark:bg-card-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 bg-brand-blue/10 dark:bg-blue-500/20 text-brand-blue dark:text-blue-400 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12">
                                <span className="material-symbols-outlined text-2xl">photo_camera</span>
                            </div>
                            <h2 className="text-3xl m-0">Fotografia no Laboratório</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-blue-500 mt-1">tips_and_updates</span>
                                <div>
                                    <strong>Iluminação:</strong> Priorize luz natural. Evite o flash direto que gera reflexos em vidrarias ou metais.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-blue-500 mt-1">aspect_ratio</span>
                                <div>
                                    <strong>Enquadramento:</strong> Mostre o experimento em contexto, mas não esqueça de um "close-up" no detalhe que importa.
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Seção de Vídeo */}
                    <section className="bg-white dark:bg-card-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 bg-brand-red/10 dark:bg-red-500/20 text-brand-red dark:text-red-400 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-2xl">videocam</span>
                            </div>
                            <h2 className="text-3xl m-0">Vídeos e Movimento</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-red mt-1">smart_display</span>
                                <div>
                                    <strong>YouTube é a base:</strong> Suba seus vídeos no YouTube e cole o link no formulário. Isso garante que qualquer pessoa consiga assistir sem travar.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-red mt-1">stay_current_portrait</span>
                                <div>
                                    <strong>Celular em pé:</strong> Para conteúdos rápidos estilo "Shorts", grave na vertical. Para explicações detalhadas, prefira a horizontal.
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Seção de Texto */}
                    <section className="bg-white dark:bg-card-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 bg-brand-yellow/10 dark:bg-yellow-400/20 text-brand-yellow dark:text-yellow-400 rounded-2xl flex items-center justify-center transition-transform group-hover:-rotate-12">
                                <span className="material-symbols-outlined text-2xl">article</span>
                            </div>
                            <h2 className="text-3xl m-0">Textos Científicos</h2>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">function</span>
                                <div>
                                    <strong>LaTeX e Matemática:</strong> Nosso formulário suporta fórmulas matemáticas complexas. Use `$` para inline ou `$$` para blocos em destaque no preview.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-brand-yellow mt-1">edit_note</span>
                                <div>
                                    <strong>Clareza:</strong> Use o Markdown para criar subtítulos, listas e negritos. Textos bem estruturados são lidos 3x mais!
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Seção de Direitos */}
                    <section className="bg-gray-900 text-white rounded-[40px] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform">
                            <span className="material-symbols-outlined text-[120px]">verified_user</span>
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-white text-3xl font-black uppercase tracking-tight mb-4">Ética e Licenciamento</h2>
                            <p className="text-gray-400 max-w-2xl mb-8 leading-relaxed">
                                Ao submeter, você concorda em disponibilizar o material sob licença <strong>Creative Commons</strong>. Isso permite que outros educadores usem seu trabalho, sempre citando sua autoria original. É a ciência circulando livremente!
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                                Hub de Comunicação Científica IF-USP
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
