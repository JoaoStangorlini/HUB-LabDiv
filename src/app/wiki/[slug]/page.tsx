'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    MainLayoutWrapper
} from '@/components/layout/MainLayoutWrapper';
import {
    Breadcrumbs,
    TechnicalAccordion,
    DataCard,
    ActionButton,
    ContentSection
} from '@/components/wiki/WikiComponents';
import {
    ShieldCheck,
    Zap,
    Atom,
    Coins,
    Telescope,
    Brain,
    HeartHandshake,
    Network,
    Microscope,
    Compass,
    FileText,
    Calendar,
    Users,
    Download,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

// --- TECHNICAL DATA SHARD ---
const pageContent: Record<string, any> = {
    'guia-de-boas-praticas': {
        title: 'Guia de Boas Práticas',
        subtitle: 'Produção, Créditos e Qualidade Hub',
        icon: <ShieldCheck className="w-12 h-12" />,
        color: 'brand-blue',
        sections: [
            {
                title: 'Categorias',
                content: 'Refração (Notícias), Síncrotron (Tutoriais), Colisor (Debates) e Laboratório (Perfil). Escolha a categoria que melhor colide com seu objetivo de comunicação.'
            },
            {
                title: 'Formatos',
                content: 'Aceitamos Imagens (PNG/JPG), Vídeos (MP4) e Documentos Técnicos (PDF). Cada formato tem um papel na emissão de conhecimento científico.'
            },
            {
                title: 'Apelidos',
                content: 'Seu nome no Hub pode ser seu nome real ou um apelido acadêmico. Mantenha o respeito e a integridade da identidade visual do LabDiv.'
            },
            {
                title: 'Links Externos',
                content: 'Sempre cite fontes confiáveis (ArXiv, Nature, Portal USP). Links para sites externos devem ser verificados para evitar quebras de simetria na informação.'
            },
            {
                title: 'Detalhes Técnicos',
                content: 'Resolução mínima de 1080p para imagens e vídeos. Limite de 10MB para arquivos estáticos. Alta fidelidade é essencial para a precisão experimental.'
            },
            {
                title: 'Descrição',
                content: 'O corpo do texto deve ser claro, conciso e acessível. Use parágrafos curtos e destaque conceitos-chave para facilitar a absorção de radiação informativa.'
            },
            {
                title: 'Título',
                content: 'Crie títulos de impacto que gerem curiosidade técnica. Evite generalismos; seja específico sobre qual fenômeno ou conceito está sendo abordado.'
            },
            {
                title: 'Creative Commons',
                content: 'Todo conteúdo no Hub é, por padrão, CC-BY-SA. Isso garante que o conhecimento circule livremente, mantendo os créditos devidos aos autores originais.'
            },
            {
                title: 'Vídeos',
                content: 'Utilize compressão H.264 para garantir carregamento fluido. Vídeos curtos (até 2 min) têm maior taxa de colisão com o público universitário.'
            }
        ],
        dates: [
            { label: 'Versão', value: 'v4.2.0' },
            { label: 'Revisão', value: 'Março/2026' }
        ],
        actions: [
            { label: 'Baixar Checklist', icon: <Download className="w-4 h-4" />, href: '#' },
            { label: 'Ver Exemplos', icon: <Telescope className="w-4 h-4" />, href: '#' }
        ]
    },
    'calouro': {
        title: 'Iniciação de Partículas',
        subtitle: 'Manual de Sobrevivência na USP',
        icon: <Zap className="w-12 h-12" />,
        color: 'brand-yellow',
        sections: [
            {
                title: 'Mobilidade (Circulares e BUSP)',
                content: 'As rotas 8012 e 8022 circulam dentro da Cidade Universitária e chegam ao Metrô Butantã. Use a 8032 para ligação com a CPTM Cidade Universitária. O cartão BUSP é obrigatório para gratuidade; sem ele, a tarifa é cobrada via Bilhete Único.'
            },
            {
                title: 'Guia do Bandejão',
                content: 'Temos a Central, Física (mais próximo) e Química. O Bandejão da Física é famoso pela proximidade, mas o da Química costuma ter filas menores. Carregue créditos via Júpiter Web e confira o cardápio no app Cardápio USP.'
            },
            {
                title: 'Esporte e Lazer (CEPEUSP)',
                content: 'O CEPE oferece piscinas, quadras e academia gratuitas para alunos. Para utilizar, basta fazer o exame médico no local e apresentar a carteirinha USP digital. É o local ideal para desintegrar o estresse das provas.'
            },
            {
                title: 'Burocracia e Infraestrutura',
                content: 'A Seção de Alunos resolve trancamentos e matrículas. O Pró-Aluno é seu hub de computação: use para imprimir trabalhos e acessar softwares técnicos necessários para os laboratórios.'
            },
            {
                title: 'Networking Acadêmico',
                content: 'Dica de Ouro: Professores são pesquisadores. Não tenha medo de bater na porta durante as horas de monitoria. Uma conversa educada sobre um tema de aula pode ser o gatilho para sua primeira Iniciação Científica.'
            }
        ],
        dates: [
            { label: 'BUSP', value: 'Obrigatório' },
            { label: 'Bandejão', value: 'R$ 2,00' }
        ],
        actions: [
            { label: 'Acessar Júpiter', icon: <ExternalLink className="w-4 h-4" />, href: 'https://jupiterweb.usp.br' },
            { label: 'Mapa do Matão', icon: <Download className="w-4 h-4" />, href: '#' }
        ]
    },
    'ifusp': {
        title: 'Estrutura da Matéria',
        subtitle: 'Evolução Acadêmica e Estágios',
        icon: <Atom className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'Evolução de Créditos (O Roadmap)',
                content: 'Bacharelado (Habilitação em Física e Astronomia), Licenciatura e Física Médica possuem fluxos distintos. Acompanhe sua evolução pelo Júpiter Web e certifique-se de cumprir os créditos optativos eletivos e livres para fechar sua vertente.'
            },
            {
                title: 'Guia de Estágios',
                content: 'Estágios obrigatórios e não-obrigatórios exigem cadastro no sistema. Procure a secretaria para validação do plano de atividades. Físicos têm alta demanda em áreas de modelagem, ciência de dados e mercado financeiro.'
            },
            {
                title: 'Comissões CG/CoC',
                content: 'O papel da Comissão de Graduação e das Comissões de Curso na vida do estudante. Saiba como protocolar requerimentos e petições.'
            }
        ],
        dates: [
            { label: 'PPP Atual', value: 'V.2025' },
            { label: 'Créditos Totais', value: 'Varia por curso' }
        ],
        actions: [
            { label: 'Baixar Matriz', icon: <Download className="w-4 h-4" />, href: '#' },
            { label: 'Portal CG IFUSP', icon: <ExternalLink className="w-4 h-4" />, href: '#' }
        ]
    },
    'bolsas': {
        title: 'Energia de Permanência',
        subtitle: 'Bolsas e Auxílios Completos',
        icon: <Coins className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'PIBID e Residência Pedagógica',
                content: 'Essenciais para licenciandos: o PIBID insere o aluno na escola desde o início; a Residência Pedagógica foca na prática docente avançada. Ambos oferecem bolsas vinculadas à CAPES.'
            },
            {
                title: 'PROIAD e PUB',
                content: 'O PROIAD incentiva alunos de destaque. O PUB (Programa Unificado de Bolsas) abrange projetos de Ensino, Pesquisa e Extensão em todo o campus, com foco em inclusão.'
            },
            {
                title: 'PAPFE e Auxílio Moradia (CRUSP)',
                content: 'O PAPFE oferece auxílio alimentação, transporte e moradia. O CRUSP é o conjunto residencial para alunos com necessidade de permanência estudantil comprovada via SAS.'
            },
            {
                title: 'Monitoria (PEEG) e IC',
                content: 'O PEEG foca no apoio a disciplinas de graduação. A Iniciação Científica (FAPESP, CNPq, Santander) é o motor da formação em pesquisa no IF desde o primeiro ano.'
            }
        ],
        dates: [
            { label: 'PUB Inscrição', value: 'Agosto/ANUAL' },
            { label: 'PAPFE Início', value: 'Janeiro/ANUAL' }
        ],
        actions: [
            { label: 'Editais Ativos', icon: <Calendar className="w-4 h-4" />, href: '#' },
            { label: 'Portal PRIP', icon: <ExternalLink className="w-4 h-4" />, href: '#' }
        ]
    },
    'divulgacao': {
        title: 'Emissão de Luz',
        subtitle: 'Mini-curso de Criação LabDiv',
        icon: <Telescope className="w-12 h-12" />,
        color: 'brand-blue',
        sections: [
            {
                title: 'Fotografia Essencial',
                content: 'Aplique a Regra dos Terços: posicione o objeto de interesse nas intersecções da grade para criar equilíbrio. Busque ângulos que revelem a tridimensionalidade dos equipamentos.'
            },
            {
                title: 'Iluminação e Modo Pro',
                content: 'Configure o ISO baixo (100-400) para evitar ruído. Ajuste o Tempo de Obturador para capturar o movimento exato ou congelar fenômenos de alta energia. No celular, use o bloqueio de foco/exposição.'
            },
            {
                title: 'Redação e Divulgação',
                content: 'Escreva para humanos: comece com o gancho (o "porquê" importa), explique o mecanismo e termine com o impacto. Divulgação científica é o transporte de conceitos complexos para mentes curiosas.'
            },
            {
                title: 'Recursos Lab-Div',
                content: 'Utilize o KitDiv para assets visuais e tipografia oficial. Caso precise de suporte personalizado, agende uma Mentoria com nossa equipe técnica de comunicação.'
            }
        ],
        dates: [
            { label: 'Toolkit V', value: '4.0.0' },
            { label: 'Acesso', value: 'KitDiv Online' }
        ],
        actions: [
            { label: 'Acessar KitDiv', icon: <Download className="w-4 h-4" />, href: '#' },
            { label: 'Agendar Mentoria', icon: <Brain className="w-4 h-4" />, href: '#' }
        ]
    },
    'protecao': {
        title: 'Protocolos de Proteção',
        subtitle: 'Saúde Mental e Acolhimento',
        icon: <HeartHandshake className="w-12 h-12" />,
        color: 'brand-yellow',
        sections: [
            {
                title: 'Física Acolhe e Programa ECOS',
                content: 'A iniciativa Física Acolhe oferece suporte direto aos alunos do instituto. O Programa ECOS foca na escuta e acolhimento em casos de conflitos ou necessidade de orientação institucional.'
            },
            {
                title: 'Hospital Universitário (HU)',
                content: 'O HU oferece tratamento psicoterapêutico e psiquiátrico de qualidade para a comunidade USP. Procure o serviço de triagem para encaminhamento especializado dentro do campus.'
            },
            {
                title: 'Ouvidoria de Inclusão',
                content: 'Canais seguros para denúncias de assédio, preconceito ou falha em protocolos de acessibilidade. Sigilo Garantido.'
            }
        ],
        dates: [
            { label: 'Suporte', value: 'Física Acolhe' },
            { label: 'Saúde Mental', value: 'HU/ECOS' }
        ],
        actions: [
            { label: 'Solicitar Apoio', icon: <Users className="w-4 h-4" />, href: '#' },
            { label: 'Ler Portaria', icon: <FileText className="w-4 h-4" />, href: '#' }
        ]
    },
    'extensao': {
        title: 'Interações de Fronteira',
        subtitle: 'Mapa da Integração IFUSP',
        icon: <Network className="w-12 h-12" />,
        color: 'brand-blue',
        sections: [
            {
                title: 'Mapeamento de Grupos',
                content: 'O IFUSP pulsa com coletivos: o Amélia Império destaca mulheres na física; a Vaca Esférica é nossa rádio/divulgação; o Show de Física encanta escolas e o HS (Humanidades no Síncrotron) debate ética e sociedade.'
            },
            {
                title: 'Guia de Integração',
                content: 'Para se enturmar, frequente o Aquário (vivência dos alunos) ou participe das reuniões abertas dos grupos. Procure os editais de cultura e extensão para validar suas horas e gerar impacto real fora dos laboratórios.'
            }
        ],
        dates: [
            { label: 'Grupos Ativos', value: '15+ Unidades' },
            { label: 'Validação', value: 'ATPA/Ext' }
        ],
        actions: [
            { label: 'Ver Catálogo', icon: <Download className="w-4 h-4" />, href: '#' },
            { label: 'Próximos Eventos', icon: <Calendar className="w-4 h-4" />, href: '#' }
        ]
    },
    'quiz': {
        title: 'Teste de Radiação',
        subtitle: 'Gamificação e Conhecimento Hub',
        icon: <Brain className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'Contador Geiger',
                content: 'Acerte as questões técnicas e históricas para explodir o contador Geiger no seu perfil do Hub. Quanto mais colidido seu conhecimento, maior seu impacto na comunidade.'
            },
            {
                title: 'Curiosidades IF',
                content: 'Você sabia que o acelerador Pelletron foi inaugurado em 1972? Teste seu conhecimento sobre o patrimônio científico da Rua do Matão.'
            },
            {
                title: 'Desafios de Física',
                content: 'Problemas conceituais rápidos para aquecer os neurônios entre uma aula e outra. Colisões mentais de alta energia.'
            }
        ],
        dates: [
            { label: 'Perguntas', value: '50+' },
            { label: 'Dificuldade', value: 'Síncrotron' }
        ],
        actions: [
            { label: 'Iniciar Quiz', icon: <Zap className="w-4 h-4" />, href: '/wiki/quiz' },
            { label: 'Ver Ranking', icon: <Telescope className="w-4 h-4" />, href: '#' }
        ]
    },
    'pesquisa': {
        title: 'Sistemas de Pesquisa',
        subtitle: 'IC e Ciência Experimental',
        icon: <Microscope className="w-12 h-12" />,
        color: 'brand-red',
        sections: [
            {
                title: 'Iniciação Científica',
                content: 'O guia completo para ingressar na pesquisa. Desde a escolha do orientador até o relatório final e a apresentação no SIICUSP.'
            },
            {
                title: 'Laboratórios do IF',
                content: 'Navegação técnica pelos departamentos: Física Experimental, Nuclear, Materiais e Teórica. Conheça as linhas de pesquisa de ponta.'
            },
            {
                title: 'Sistema Ateneu',
                content: 'Tutorial de uso do sistema Ateneu para cadastro de projetos, acompanhamento de bolsas e submissão de frequências mensais.'
            }
        ],
        dates: [
            { label: 'Editais', value: 'Fluxo Contínuo' },
            { label: 'Ateneu V', value: 'Integração USP' }
        ],
        actions: [
            { label: 'Acessar Ateneu', icon: <ExternalLink className="w-4 h-4" />, href: 'https://ateneu.usp.br' },
            { label: 'Lista de Labs', icon: <Download className="w-4 h-4" />, href: '#' }
        ]
    },
    'carreira': {
        title: 'Vetores de Carreira',
        subtitle: 'Trajetórias Pós-IFUSP',
        icon: <Compass className="w-12 h-12" />,
        color: 'brand-yellow',
        sections: [
            {
                title: 'Carreira Acadêmica',
                content: 'O caminho do Mestrado ao Pós-Doutorado. Dicas para exames de ingresso (EUF) e busca por fomento nacional e internacional.'
            },
            {
                title: 'Física na Indústria',
                content: 'Setores de inovação: Ciência de Dados, Física Médica, Óptica de precisão e instituições financeiras. Onde os físicos colidem com o mercado.'
            },
            {
                title: 'Educação e Ensino',
                content: 'Oportunidades na Licenciatura, cursinhos populares, colégios de elite e divulgação científica profissional.'
            }
        ],
        dates: [
            { label: 'Egresso', value: 'Mapeamento 2026' },
            { label: 'Mercado', value: 'Alta Demanda' }
        ],
        actions: [
            { label: 'Guia do Egresso', icon: <FileText className="w-4 h-4" />, href: '#' },
            { label: 'Fórum Carreira', icon: <Users className="w-4 h-4" />, href: '#' }
        ]
    }
};

export default function WikiSubPage() {
    const params = useParams();
    const slug = params.slug as string;
    const content = pageContent[slug];

    if (!content) {
        return (
            <MainLayoutWrapper>
                <div className="min-h-screen bg-[#121212] pt-24 px-4 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-20 h-20 text-brand-red mx-auto mb-6 opacity-20" />
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Partícula não encontrada</h1>
                        <Link href="/wiki" className="mt-8 inline-block text-brand-blue font-black uppercase tracking-widest hover:underline">
                            Voltar ao Síncrotron
                        </Link>
                    </div>
                </div>
            </MainLayoutWrapper>
        );
    }

    return (
        <MainLayoutWrapper>
            <div className="min-h-screen bg-[#121212] pt-16 pb-24 px-4 overflow-x-hidden">
                <div className="max-w-6xl mx-auto">

                    <Breadcrumbs slug={slug} title={content.title} />

                    <div className="flex flex-col lg:flex-row gap-16">

                        {/* --- Main Content Col (70%) --- */}
                        <div className="lg:w-[70%] order-2 lg:order-1">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="flex items-center gap-6 mb-12">
                                    <div className={`size-20 rounded-[32px] bg-${content.color}/10 text-${content.color} flex items-center justify-center ring-1 ring-${content.color}/20 shadow-2xl shadow-${content.color}/10`}>
                                        {content.icon}
                                    </div>
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-2">
                                            {content.title}
                                        </h1>
                                        <p className="text-brand-blue text-xs font-black uppercase tracking-[0.3em]">
                                            {content.subtitle}
                                        </p>
                                    </div>
                                </div>

                                {content.sections.map((section: any, idx: number) => (
                                    <ContentSection key={idx} title={section.title}>
                                        <TechnicalAccordion title={`Mais sobre ${section.title}`}>
                                            {section.content}
                                        </TechnicalAccordion>
                                        <p className="text-gray-400 font-medium leading-relaxed bg-white/2 p-8 rounded-[40px] border border-white/5">
                                            {section.content}
                                        </p>
                                    </ContentSection>
                                ))}
                            </motion.div>
                        </div>

                        {/* --- Sidebar Info (30%) --- */}
                        <aside className="lg:w-[30%] order-1 lg:order-2">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="sticky top-24 space-y-8"
                            >
                                {/* Dates/DataCards */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6">Métricas de Colisão</h4>
                                    {content.dates.map((date: any, idx: number) => (
                                        <DataCard key={idx} label={date.label} value={date.value} color={content.color} />
                                    ))}
                                </div>

                                {/* Actions/ActionButtons */}
                                <div className="space-y-4 pt-8 border-t border-white/5">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6">Ações Rápidas</h4>
                                    {content.actions?.map((action: any, idx: number) => (
                                        <ActionButton key={idx} label={action.label} icon={action.icon} href={action.href} variant={idx === 0 ? 'primary' : 'secondary'} />
                                    ))}
                                </div>

                                {/* Support Card */}
                                <div className="p-8 bg-gradient-to-br from-brand-red/10 to-transparent border border-white/5 rounded-[40px] mt-12">
                                    <AlertCircle className="w-8 h-8 text-brand-red mb-4" />
                                    <h5 className="text-sm font-black text-white uppercase italic mb-2">Dúvida Técnica?</h5>
                                    <p className="text-[11px] text-gray-500 font-bold leading-relaxed mb-6">Utilize o botão de Pânico no topo para reportar flutuações de dados incorretas.</p>
                                    <Link href="/perguntas" className="text-xs font-black text-brand-red uppercase hover:underline">Abrir Ticket</Link>
                                </div>
                            </motion.div>
                        </aside>

                    </div>
                </div>
            </div>

            {/* Re-injecting Global Tooltip Color Classes (Defensive) */}
            <style jsx global>{`
                .ring-brand-green\/10 { --tw-ring-color: rgba(16, 185, 129, 0.1); }
                .shadow-brand-green\/10 { --tw-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -2px rgba(16, 185, 129, 0.1); }
                .bg-brand-green\/10 { background-color: rgba(16, 185, 129, 0.1); }
                .text-brand-green { color: #10b981; }
                .bg-brand-blue\/10 { background-color: rgba(0, 150, 255, 0.1); }
                .text-brand-blue { color: #0096FF; }
                .bg-brand-red\/10 { background-color: rgba(255, 59, 48, 0.1); }
                .shadow-brand-red\/10 { --tw-shadow: 0 4px 6px -1px rgba(255, 59, 48, 0.1), 0 2px 4px -2px rgba(255, 59, 48, 0.1); }
            `}</style>
        </MainLayoutWrapper>
    );
}
