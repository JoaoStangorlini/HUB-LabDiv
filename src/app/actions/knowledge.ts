'use server';

import { createServerSupabase } from '@/lib/supabase/server';

export async function submitKnowledgeSuggestion(payload: {
    department_id?: string;
    tipo: 'novo_laboratorio' | 'atualizar_pesquisador' | 'alterar_linha' | 'outro';
    conteudo: string;
}) {
    const supabase = await createServerSupabase();
    // Busca do user sessāo via middleware ou auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Ação requer autenticação. Faça login para sugerir.' };
    }

    const { data, error } = await supabase
        .from('knowledge_suggestions')
        .insert([{
            user_id: user.id,
            department_id: payload.department_id || null,
            tipo: payload.tipo,
            conteudo: payload.conteudo,
            status: 'pendente'
        }])
        .select()
        .single();

    if (error) {
        console.error("Erro ao registrar sugestão do grafo:", error);
        return { success: false, error: 'Ocorreu um erro no servidor ao processar a sugestão.' };
    }

    // Opcional: Notificar admins
    const { sendAdminNotification } = await import('@/lib/notifications');
    await sendAdminNotification({
        type: 'question',
        title: `Nova Sugestão: ${payload.tipo.replace('_', ' ')}`,
        authors: user.email || 'Usuário Anônimo',
        category: 'Lab-Div'
    });

    return { success: true, data };
}
