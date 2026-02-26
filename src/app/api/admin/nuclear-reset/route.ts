import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));

        let authHeader = req.headers.get('authorization');

        // Also allow passing in body if headers aren't easy to send
        const adminPw = authHeader?.replace('Bearer ', '') || body.admin_password;

        if (adminPw !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Acesso Negado. Credenciais inválidas.' }, { status: 401 });
        }

        console.log('☢️ INICIANDO PROTOCOLO NUCLEAR V4.0...');

        // 1. Limpeza Cloudinary (Assets Media)
        console.log('☢️ Limpando assets do Cloudinary (labdiv_hub/*)...');
        try {
            await cloudinary.api.delete_resources_by_prefix('labdiv_hub/');
        } catch (e: any) {
            console.warn('⚠️ Erro não-bloqueante no Cloudinary (talvez já vazio):', e.message);
        }

        // 2. Limpeza Supabase DB (Truncate CASCADE)
        console.log('☢️ Executando TRUNCATE CASCADE via RPC (reset_nuclear_v4)...');
        const { error: rpcError } = await supabase.rpc('reset_nuclear_v4');

        if (rpcError) {
            console.error('❌ Falha na RPC reset_nuclear_v4:', rpcError);
            throw new Error(`Falha no Banco de Dados: ${rpcError.message}`);
        }

        console.log('✅ PROTOCOLO NUCLEAR CONCLUÍDO COM SUCESSO.');
        return NextResponse.json({ success: true, message: 'Protocolo Nuclear V4 executado com sucesso. Todos os dados e mídias foram apagados.' });

    } catch (error: any) {
        console.error('❌ ERRO FATAL PROTOCOLO NUCLEAR:', error);
        return NextResponse.json({ error: error.message || 'Erro desconhecido.' }, { status: 500 });
    }
}
