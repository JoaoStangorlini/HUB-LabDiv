'use client';

import { useState, useEffect } from 'react';
import { fetchFreshmenForAdoption, fetchStudentsSeekingIC, fetchResearchersSeekingAssistants, getStudentMiniPortfolio } from '@/app/actions/profiles';
import { Avatar } from '@/components/ui/Avatar';
import { 
    GraduationCap, 
    ArrowRight, 
    CheckCircle2, 
    Loader2, 
    Phone, 
    Mail, 
    Star, 
    Microscope, 
    ShieldCheck, 
    Zap,
    Briefcase,
    Sparkles,
    UserPlus,
    Info,
    ExternalLink,
    X,
    BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Profile } from '@/types';
import { ICInterestModal } from './ICInterestModal';

interface MatchAcademicoTabProps {
    profile: Profile;
}

export function MatchAcademicoTab({ profile }: MatchAcademicoTabProps) {
    const [people, setPeople] = useState<any[]>([]);
    const [myContacts, setMyContacts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subTab, setSubTab] = useState<'available' | 'mine'>('available');
    const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
    const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
    const [isICModalOpen, setIsICModalOpen] = useState(false);

    const isStudent = profile.user_category === 'aluno_usp';
    const isResearcher = profile.user_category === 'pesquisador';
    const isMentor = profile.available_to_mentor;

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (subTab === 'available') {
                let res;
                if (isResearcher) {
                    res = await fetchStudentsSeekingIC();
                } else if (isStudent) {
                    res = await fetchResearchersSeekingAssistants();
                } else if (isMentor) {
                    res = await fetchFreshmenForAdoption();
                }

                if (res?.success && res.data) {
                    setPeople(res.data);
                } else if (res?.error) {
                    toast.error(res.error);
                }
            } else {
                // For 'mine', we can reuse fetchMyAdoptedFreshmen for now, 
                // or extend it if we had a generic 'contacts' system.
                // Given the instructions, we'll focus on the 'discovery' part first.
                const { fetchMyAdoptedFreshmen } = await import('@/app/actions/profiles');
                const res = await fetchMyAdoptedFreshmen();
                if (res.success && res.data) {
                    setMyContacts(res.data);
                }
            }
        } catch (error) {
            console.error("Error loading match data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewPortfolio = async (id: string) => {
        setIsPortfolioLoading(true);
        const res = await getStudentMiniPortfolio(id);
        if (res.success && res.data) {
            setSelectedPerson(res.data);
        } else {
            toast.error(res.error || 'Erro ao carregar portfólio');
        }
        setIsPortfolioLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [subTab]);

    if (!isStudent && !isResearcher && !isMentor) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 mb-6 rounded-full border-2 border-brand-blue/20 flex items-center justify-center bg-brand-blue/5">
                    <UserPlus className="w-12 h-12 text-brand-blue/40" />
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Match Acadêmico</h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium italic">
                    O Match Acadêmico conecta alunos interessados em IC, pesquisadores buscando ajudantes e bixos buscando mentores.
                    Ative suas preferências no perfil para começar!
                </p>
                <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl max-w-md mx-auto flex items-start gap-3">
                    <Info className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" />
                    <p className="text-[11px] text-left font-bold text-brand-yellow uppercase tracking-tight leading-normal">
                        Dica: Se você é Aluno USP, use o botão "Sinalizar Interesse" para entrar no radar de IC. Se é Pesquisador, ative "Buscando Ajudantes" no seu perfil.
                    </p>
                </div>
            </div>
        );
    }

    const displayData = subTab === 'available' ? people : myContacts;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-gray-100 dark:border-white/5 pb-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight">Match Acadêmico</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                        {isResearcher ? 'Encontre talentos para sua pesquisa' : isStudent ? 'Encontre oportunidades de IC' : 'Conecte-se com a nova geração'}
                    </p>
                </div>

                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/5">
                    <button
                        onClick={() => setSubTab('available')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'available'
                            ? 'bg-white dark:bg-brand-blue text-brand-blue dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        {isResearcher ? 'Alunos (IC)' : isStudent ? 'Oportunidades' : 'Disponíveis'}
                    </button>
                    <button
                        onClick={() => setSubTab('mine')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'mine'
                            ? 'bg-white dark:bg-brand-blue text-brand-blue dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        {isMentor ? 'Meus Bixos' : 'Meus Contatos'}
                    </button>
                </div>
            </div>

            {/* IC Interest Signaling Form (For Students) */}
             {isStudent && subTab === 'available' && (
                <div className="glass-card p-8 rounded-[32px] border-brand-red/20 bg-brand-red/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                        <Microscope size={80} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Cápsula de Interesse em Pesquisa</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Mostre seu potencial para pesquisadores do IFUSP</p>
                            </div>
                            <button
                                onClick={() => setIsICModalOpen(true)}
                                className="px-8 py-4 bg-brand-red text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-brand-red/20 flex items-center gap-3"
                            >
                                <Sparkles className="w-4 h-4" />
                                Sinalizar Interesse (IC)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-brand-red/10">
                            {[
                                { label: 'Área', val: profile.ic_research_area || 'NÃO DEFINIDA' },
                                { label: 'Departamento', val: profile.ic_preferred_department || 'NÃO DEFINIDO' },
                                { label: 'Laboratório', val: profile.ic_preferred_lab || 'NÃO DEFINIDO' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="text-[8px] font-black text-brand-red/60 uppercase tracking-widest">{item.label}</span>
                                    <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase truncate">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                </div>
            ) : displayData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 mb-6 rounded-full border-2 border-gray-200 dark:border-white/10 flex items-center justify-center">
                        {isResearcher ? <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-700" /> : <Microscope className="w-12 h-12 text-gray-300 dark:text-gray-700" />}
                    </div>
                    <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                        {subTab === 'available' ? 'Ninguém na fila ainda' : 'Nenhum contato salvo'}
                    </h2>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto font-medium italic">
                        {subTab === 'available'
                            ? 'Fique de olho! Assim que alguém sinalizar interesse, aparecerá aqui.'
                            : 'Seus contatos aprovados aparecerão aqui.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayData.map((person) => (
                        <div
                            key={person.id}
                            className={`glass-card p-6 rounded-[32px] group hover:scale-[1.02] transition-all duration-300 border ${subTab === 'mine' ? 'border-brand-blue/30 bg-brand-blue/5' : 'border-gray-100 dark:border-white/5'
                                }`}
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <Avatar
                                    src={person.avatar_url}
                                    name={person.use_nickname ? person.username : person.full_name}
                                    size="md"
                                    xp={person.xp}
                                    level={person.level}
                                    isLabDiv={person.is_labdiv}
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-display font-bold text-gray-900 dark:text-white truncate">
                                        {person.use_nickname ? person.username : person.full_name}
                                    </h3>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <span className={`px-2 py-0.5 ${
                                            person.user_category === 'pesquisador' ? 'bg-brand-yellow/10 text-brand-yellow' : 
                                            person.user_category === 'aluno_usp' ? 'bg-brand-blue/10 text-brand-blue' : 
                                            'bg-brand-red/10 text-brand-red'
                                        } text-[9px] font-black rounded uppercase tracking-tighter`}>
                                            {person.user_category === 'pesquisador' ? 'Pesquisador' : 
                                             person.user_category === 'aluno_usp' ? 'Aluno USP' : 
                                             'Curioso'}
                                        </span>
                                        {person.entrance_year && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-[9px] font-black rounded uppercase tracking-tighter">
                                                {person.entrance_year}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {person.bio && (
                                <p className="text-[13px] text-gray-600 dark:text-gray-400 italic mb-6 line-clamp-3 leading-relaxed">
                                    "{person.bio}"
                                </p>
                            )}

                            {person.user_category === 'pesquisador' && (
                                <div className="mb-6 p-4 rounded-2xl bg-brand-yellow/5 border border-brand-yellow/10 space-y-2">
                                    {person.research_line && (
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-brand-yellow/60 uppercase tracking-widest">Linha de Pesquisa</span>
                                            <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase truncate">{person.research_line}</span>
                                        </div>
                                    )}
                                    {person.laboratory_name && (
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-brand-yellow/60 uppercase tracking-widest">Laboratório</span>
                                            <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase truncate">{person.laboratory_name}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-50 dark:border-white/5">
                                {person.whatsapp && (
                                    <a
                                        href={`https://wa.me/${person.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/90 transition-all shadow-sm"
                                    >
                                        <Phone className="w-3 h-3" />
                                        WhatsApp
                                    </a>
                                )}
                                {person.email && (
                                    <button
                                        onClick={() => {
                                            if (person.email) {
                                                navigator.clipboard.writeText(person.email);
                                                toast.success('E-mail copiado!');
                                                window.location.href = `mailto:${person.email}`;
                                            }
                                        }}
                                        className="flex items-center justify-center p-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all shadow-sm"
                                        title="Enviar E-mail"
                                    >
                                        <Mail className="w-4 h-4" />
                                    </button>
                                )}
                                <a
                                    href={`/emaranhamento?user=${person.id}`}
                                    className="flex items-center justify-center p-2.5 bg-brand-yellow/10 text-brand-yellow rounded-2xl hover:bg-brand-yellow/20 transition-all shadow-sm"
                                    title="Emaranhar"
                                >
                                    <span className="material-symbols-outlined text-lg">hub</span>
                                </a>
                                <button
                                    onClick={() => handleViewPortfolio(person.id)}
                                    className="flex items-center justify-center p-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all shadow-sm"
                                    title="Ver Portfólio"
                                >
                                    {isPortfolioLoading && selectedPerson?.profile?.id === person.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <ExternalLink className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedPerson && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-[#1E1E1E] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/5 max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        src={selectedPerson.profile.avatar_url}
                                        name={selectedPerson.profile.use_nickname ? selectedPerson.profile.username : selectedPerson.profile.full_name}
                                        size="lg"
                                    />
                                    <div>
                                        <h2 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                            {selectedPerson.profile.use_nickname ? selectedPerson.profile.username : selectedPerson.profile.full_name}
                                        </h2>
                                        <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">
                                            {selectedPerson.profile.course} • {selectedPerson.profile.institute}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPerson(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto hidden-scrollbar space-y-8">
                                {/* Bio */}
                                 {selectedPerson.profile.bio && (
                                    <section className="space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                            <Info className="w-3 h-3" /> Bio / Trajetória
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                            "{selectedPerson.profile.bio}"
                                        </p>
                                    </section>
                                )}

                                {/* Detailed IC Interest (Students) */}
                                {selectedPerson.profile.user_category === 'aluno_usp' && (selectedPerson.profile.ic_research_area || selectedPerson.profile.ic_preferred_department || selectedPerson.profile.ic_preferred_lab) && (
                                    <section className="p-6 rounded-3xl bg-brand-red/5 border border-brand-red/10 space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red flex items-center gap-2">
                                            <Microscope className="w-3 h-3" /> Alvo de Iniciação Científica
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {selectedPerson.profile.ic_research_area && (
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Área</span>
                                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{selectedPerson.profile.ic_research_area}</p>
                                                </div>
                                            )}
                                            {selectedPerson.profile.ic_preferred_department && (
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Departamento</span>
                                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{selectedPerson.profile.ic_preferred_department}</p>
                                                </div>
                                            )}
                                            {selectedPerson.profile.ic_preferred_lab && (
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Laboratório</span>
                                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{selectedPerson.profile.ic_preferred_lab}</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* Researcher Details */}
                                {selectedPerson.profile.user_category === 'pesquisador' && (
                                    <section className="p-6 rounded-3xl bg-brand-yellow/5 border border-brand-yellow/10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow flex items-center gap-2">
                                                <Briefcase className="w-3 h-3" /> Núcleo de Pesquisa
                                            </h3>
                                            {selectedPerson.profile.seeking_assistant && (
                                                <span className="px-2 py-1 bg-brand-yellow text-[#121212] rounded-lg text-[8px] font-black uppercase flex items-center gap-1 animate-pulse">
                                                    <Zap className="w-2 h-2" /> Recrutando ICs
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {selectedPerson.profile.research_line && (
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Linha de Pesquisa</span>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{selectedPerson.profile.research_line}</p>
                                                </div>
                                            )}
                                            {selectedPerson.profile.department && (
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Departamento</span>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{selectedPerson.profile.department}</p>
                                                </div>
                                            )}
                                            {selectedPerson.profile.laboratory_name && (
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Laboratório</span>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{selectedPerson.profile.laboratory_name}</p>
                                                </div>
                                            )}
                                            {selectedPerson.profile.office_room && (
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Sala / Escritório</span>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{selectedPerson.profile.office_room}</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* Interests */}
                                {(selectedPerson.profile.areas_of_interest?.length > 0 || selectedPerson.profile.artistic_interests?.length > 0) && (
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                            <Star className="w-3 h-3" /> Interesses e Habilidades
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPerson.profile.areas_of_interest?.map((area: string) => (
                                                <span key={area} className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow text-[10px] font-black uppercase rounded-full">
                                                    {area}
                                                </span>
                                            ))}
                                            {selectedPerson.profile.artistic_interests?.map((art: string) => (
                                                <span key={art} className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase rounded-full">
                                                    {art}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Academic Portfolio */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Concluídas */}
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 flex items-center gap-2">
                                            <ShieldCheck className="w-3 h-3" /> Disciplinas Concluídas
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedPerson.completed.length === 0 ? (
                                                <p className="text-[10px] text-gray-500 italic uppercase">Nenhuma concluída ainda</p>
                                            ) : (
                                                selectedPerson.completed.map((trail: any) => (
                                                    <div key={trail.id} className="p-3 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{trail.title}</p>
                                                            <p className="text-[9px] text-gray-500 font-mono uppercase">{trail.course_code}</p>
                                                        </div>
                                                        <ShieldCheck className="w-3 h-3 text-green-500 shrink-0" />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>

                                    {/* Em Curso */}
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue flex items-center gap-2">
                                            <BookOpen className="w-3 h-3" /> Em Curso
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedPerson.current.length === 0 ? (
                                                <p className="text-[10px] text-gray-500 italic uppercase">Nenhuma em curso declarada</p>
                                            ) : (
                                                selectedPerson.current.map((trail: any) => (
                                                    <div key={trail.id} className="p-3 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{trail.title}</p>
                                                            <p className="text-[9px] text-gray-500 font-mono uppercase">{trail.course_code}</p>
                                                        </div>
                                                        <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse shrink-0" />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Footer / Actions */}
                            <div className="p-8 border-t border-gray-50 dark:border-white/5 flex gap-4">
                                <a
                                    href={`https://wa.me/${selectedPerson.profile.whatsapp?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-brand-green text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-green-500/20"
                                >
                                    <Phone className="w-4 h-4" />
                                    Entrar em Contato
                                </a>
                                <button
                                    onClick={() => {
                                        if (selectedPerson.profile.email) {
                                            navigator.clipboard.writeText(selectedPerson.profile.email);
                                            toast.success('E-mail copiado!');
                                            window.location.href = `mailto:${selectedPerson.profile.email}`;
                                        }
                                    }}
                                    className="px-6 py-4 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-[24px] hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                >
                                    <Mail className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ICInterestModal 
                isOpen={isICModalOpen}
                onClose={() => setIsICModalOpen(false)}
                initialData={{
                    ic_research_area: profile.ic_research_area,
                    ic_preferred_department: profile.ic_preferred_department,
                    ic_preferred_lab: profile.ic_preferred_lab
                }}
            />
        </div>
    );
}
