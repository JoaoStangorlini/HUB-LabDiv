-- MIGRATION: V3.1.0 "Zero Kelvin" ⚛️
-- PURGE OF LEGACY SOCIAL TERMS IN FAVOR OF ATOMIC PHYSICS

-- 1. RENOMEAR COLUNAS DE ENGAJAMENTO E ADIÇÃO DE FLAG
DO $$ 
BEGIN
    -- Kudos to Atomic Excitation
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='kudos_total') THEN
        ALTER TABLE submissions RENAME COLUMN kudos_total TO atomic_excitation;
    END IF;

    -- Reactions to Energy Reactions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='reactions_summary') THEN
        ALTER TABLE submissions RENAME COLUMN reactions_summary TO energy_reactions;
    END IF;

    -- Adicionar is_stable se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wiki_articles' AND column_name='is_stable') THEN
        ALTER TABLE wiki_articles ADD COLUMN is_stable BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. CONVERSÃO DE DADOS (LEGACY JSONB TO SCIENTIFIC JSONB)
-- Transforma chaves sociais em grandezas físicas para evitar crash de schema
-- Só processa se a chave 'likes' ainda existir (não convertido)
UPDATE submissions
SET energy_reactions = jsonb_build_object(
    'thermal', COALESCE((energy_reactions->>'likes')::int, 0),
    'kinetic', COALESCE((energy_reactions->>'shares')::int, 0),
    'potential', COALESCE((energy_reactions->>'saves')::int, 0),
    'entropy', 0
)
WHERE energy_reactions ? 'likes';

-- 4. ESTABILIZAR ACERVO ATUAL
UPDATE wiki_articles SET is_stable = TRUE WHERE is_stable = FALSE;
