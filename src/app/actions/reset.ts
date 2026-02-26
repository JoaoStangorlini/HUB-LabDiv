'use server';

import { supabase } from '@/lib/supabase';
import { purgeStorageFolder } from '@/lib/cloudinary-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const ResetSchema = z.object({
    secret_key: z.string(),
    confirm_phrase: z.string().refine((val) => val === "ESTOU CIENTE DA DESTRUIÇÃO TOTAL DOS DADOS", {
        message: "Frase de confirmação incorreta."
    }),
});

/**
 * ☣️ PROTOCOLO ZERO KELVIN: O RESGATE DO VÁCUO (V3.1.0)
 * Executa o reset total do sistema: DB + Storage + Cache.
 */
export async function executeNuclearReset(formData: FormData) {
    // 1. Double-Lock Authentication (Admin Role + Secret Key)
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || session.user.role !== 'admin') {
        return { success: false, error: 'Acesso negado. Apenas administradores podem iniciar o Protocolo Zero Kelvin.' };
    }

    const rawData = {
        secret_key: formData.get('secret_key'),
        confirm_phrase: formData.get('confirm_phrase'),
    };

    const validation = ResetSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    if (validation.data.secret_key !== process.env.ADMIN_SECRET_KEY) {
        return { success: false, error: 'Chave secreta de administração inválida.' };
    }

    try {
        console.warn('[V3.1.0] PROTOCOLO ZERO KELVIN INICIADO POR:', session.user.email);

        // 2. Limpeza de Storage (Cloudinary)
        // Purging submissions and reproductions folders
        const submissionPurge = await purgeStorageFolder('assets/submissions');
        const reproductionPurge = await purgeStorageFolder('reproductions');

        if (!submissionPurge.success || !reproductionPurge.success) {
            console.error('[V4.0] Falha parcial no storage reset:', submissionPurge.error, reproductionPurge.error);
        }

        // 3. Limpeza de Banco de Dados (TRUNCATE CASCADE via RPC v4)
        const { error: dbError } = await supabase.rpc('nuclear_reset_v4');

        if (dbError) {
            throw new Error(`Erro no banco de dados: ${dbError.message}`);
        }

        revalidatePath('/');
        return { success: true, message: 'Protocolo Zero Kelvin V4.0 concluído. Sistema em Vácuo Absoluto.' };
    } catch (error: any) {
        console.error('[V4.0] FALHA CRÍTICA NO RESET NUCLEAR:', error);
        return { success: false, error: 'Falha catastrófica durante o reset. Contate a infraestrutura.' };
    }
}
