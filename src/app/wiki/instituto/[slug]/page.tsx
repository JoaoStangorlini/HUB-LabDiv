import React from 'react';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { WikiFeedbackCard } from '@/app/wiki/WikiFeedbackCard';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { DepartmentHeader } from '@/components/wiki/department/DepartmentHeader';
import { DepartmentSubMenu } from '@/components/wiki/department/DepartmentSubMenu';
import { DepartmentLaboratories } from '@/components/wiki/department/DepartmentLaboratories';
import { DepartmentResearchers } from '@/components/wiki/department/DepartmentResearchers';
import { DepartmentResearchLines } from '@/components/wiki/department/DepartmentResearchLines';
import { DepartmentMural } from '@/components/wiki/department/DepartmentMural';
import { KnowledgeSuggestionWidget } from '@/components/wiki/department/KnowledgeSuggestionWidget';

interface PageProps {
    params: Promise<{
        slug: string;
    }>
}

// ISR Revalidation (optional but good for Wiki content)
export const revalidate = 3600;

export default async function DepartmentPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createServerSupabase();

    const { data: department, error } = await supabase
        .from('departments')
        .select('*')
        .ilike('sigla', slug)
        .single();

    if (error || !department) {
        console.error(`[WIKI] Erro ao buscar departamento '${slug}':`, error);
        return notFound();
    }

    return (
        <MainLayoutWrapper rightSidebar={
            <div className="flex flex-col gap-6 sticky top-24">
                <WikiFeedbackCard />
                <KnowledgeSuggestionWidget departmentId={department.id} departmentName={department.sigla} />
            </div>
        }>
            <div className="flex flex-col gap-4 w-full overflow-x-hidden pb-12">
                <Link
                    href="/wiki/instituto"
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-blue transition-colors w-fit mb-4 group"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Voltar para o Instituto
                </Link>

                <DepartmentHeader department={department} />
                
                <DepartmentSubMenu />

                <div className="space-y-16 mt-8">
                    <section id="laboratorios" className="scroll-mt-32">
                        <DepartmentLaboratories departmentId={department.id} />
                    </section>
                    
                    <section id="pesquisadores" className="scroll-mt-32">
                        <DepartmentResearchers departmentId={department.id} />
                    </section>

                    <section id="linhas-de-pesquisa" className="scroll-mt-32">
                        <DepartmentResearchLines departmentId={department.id} />
                    </section>

                    <section id="mural" className="scroll-mt-32">
                        <DepartmentMural departmentId={department.id} />
                    </section>
                </div>
            </div>
        </MainLayoutWrapper>
    );
}
