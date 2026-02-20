import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";

export default function CriadoresPage() {
    const creators = [
        {
            name: 'Prof. Pedro Alvarez',
            role: 'Pesquisador Titular & Diretor Lab-Div',
            bio: 'Físico experimental apaixonado por levar a mecânica quântica para as escolas de forma simples e visual.',
            imagePlaceholder: 'P',
            color: 'brand-blue'
        },
        {
            name: 'Ana Silva',
            role: 'Bolsista DigitalLab',
            bio: 'Estudante de Astronomia, produz os reels semanais sobre o céu de São Paulo e dicas de observação.',
            imagePlaceholder: 'A',
            color: 'brand-yellow'
        },
        {
            name: 'Lucas Martins',
            role: 'Monitor Acervo Histórico',
            bio: 'Investigador da história da física no Brasil. Responsável por digitalizar e comentar as fotos dos anos 60 do IF.',
            imagePlaceholder: 'L',
            color: 'brand-red'
        },
        {
            name: 'Mariana Costa',
            role: 'Professora Convidada',
            bio: 'Desenvolve materiais didáticos open-source com simulações computacionais em Python interativo.',
            imagePlaceholder: 'M',
            color: 'brand-blue'
        }
    ];

    const influencers = [
        {
            name: 'Agnessa',
            role: 'Estudante & TikToker',
            bio: 'Descomplicando a ciência e mostrando o dia a dia universitário de forma leve.',
            imagePlaceholder: 'A',
            color: 'brand-blue'
        },
        {
            name: 'Canoa',
            role: 'Criador de Conteúdo',
            bio: 'Curiosidades da física e vida acadêmica levadas de forma descontraída ao público.',
            imagePlaceholder: 'C',
            color: 'brand-yellow'
        },
        {
            name: 'Pleade',
            role: 'YouTuber & Estudante',
            bio: 'Vídeos interativos, vlogs da rotina e dicas de estudos diretamente do IFUSP.',
            imagePlaceholder: 'P',
            color: 'brand-red'
        },
        {
            name: 'Saficadafisica',
            role: 'Influenciadora Científica',
            bio: 'Popularizando a ciência com criatividade, bom humor e muito conhecimento nas redes.',
            imagePlaceholder: 'S',
            color: 'brand-blue'
        }
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col pt-24">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4 text-gray-900 dark:text-white">
                        Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow">Criadores</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Conheça os estudantes, professores e pesquisadores que estão por trás da curadoria e produção do acervo colaborativo.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {creators.map((creator, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className={`relative w-32 h-32 rounded-full mb-5 flex items-center justify-center text-4xl font-bold text-white bg-${creator.color} shadow-lg ring-4 ring-background-light dark:ring-background-dark outline outline-2 outline-gray-200 dark:outline-gray-800 transition-transform group-hover:scale-105 duration-300`}>
                                {creator.imagePlaceholder}
                                <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{creator.name}</h3>
                            <p className={`text-sm font-semibold text-${creator.color} mb-3`}>{creator.role}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[250px] mx-auto">
                                {creator.bio}
                            </p>

                            <div className="flex gap-3 mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">mail</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-28 text-center max-w-2xl mx-auto mb-16">
                    <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4 text-gray-900 dark:text-white">
                        Influenciadores do <span className="text-brand-yellow">IF-USP</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Acompanhe nossos estudantes espalhando ciência criativa pelo TikTok, YouTube e outras plataformas.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {influencers.map((influencer, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className={`relative w-32 h-32 rounded-full mb-5 flex items-center justify-center text-4xl font-bold text-white bg-${influencer.color} shadow-lg ring-4 ring-background-light dark:ring-background-dark outline outline-2 outline-gray-200 dark:outline-gray-800 transition-transform group-hover:scale-105 duration-300`}>
                                {influencer.imagePlaceholder}
                                <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{influencer.name}</h3>
                            <p className={`text-sm font-semibold text-${influencer.color} mb-3`}>{influencer.role}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[250px] mx-auto">
                                {influencer.bio}
                            </p>

                            <div className="flex gap-3 mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-colors" title="Acessar Canal">
                                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
