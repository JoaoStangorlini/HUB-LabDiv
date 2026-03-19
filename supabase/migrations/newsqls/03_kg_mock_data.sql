-- MOCK DATA PARA O GRAFO DE CONHECIMENTO (IFUSP)
-- 1. Departamentos (Já existem, mas garantindo IDs conhecidos para o mock)
-- d1000000-0000-0000-0000-000000000000 -> FAP
-- ... 

-- 2. Habilitar RLS e Políticas de Leitura Pública
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratory_researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_research_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select" ON public.laboratories;
CREATE POLICY "Public Select" ON public.laboratories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select" ON public.researchers;
CREATE POLICY "Public Select" ON public.researchers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select" ON public.research_lines;
CREATE POLICY "Public Select" ON public.research_lines FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select" ON public.department_laboratories;
CREATE POLICY "Public Select" ON public.department_laboratories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select" ON public.department_researchers;
CREATE POLICY "Public Select" ON public.department_researchers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select" ON public.laboratory_researchers;
CREATE POLICY "Public Select" ON public.laboratory_researchers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select" ON public.submission_departments;
CREATE POLICY "Public Select" ON public.submission_departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select" ON public.submission_laboratories;
CREATE POLICY "Public Select" ON public.submission_laboratories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select" ON public.submission_researchers;
CREATE POLICY "Public Select" ON public.submission_researchers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select" ON public.submission_research_lines;
CREATE POLICY "Public Select" ON public.submission_research_lines FOR SELECT USING (true);

-- 3. Inserção de Dados (Laboratórios)
INSERT INTO public.laboratories (id, nome, descricao) VALUES
('1ab1ab1a-0000-0000-0000-000000000001', 'LAM - Laboratório de Análise de Materiais', 'Análise multi-escala de materiais condensados.'),
('1ab1ab1a-0000-0000-0000-000000000002', 'LFF - Laboratório de Filmes Finos', 'Crescimento e caracterização de filmes binários.'),
('2ab2ab2a-0000-0000-0000-000000000001', 'LCMat - Laboratório de Cristalografia de Materiais', 'Difração de raios-X e estrutura cristalina.'),
('6ab6ab6a-0000-0000-0000-000000000001', 'Pelletron - Acelerador de Partículas', 'Física nuclear experimental de baixas energias.')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

-- 4. Inserção de Dados (Pesquisadores)
INSERT INTO public.researchers (id, nome) VALUES
('1ee1ee1e-0000-0000-0000-000000000001', 'Prof. Dr. Newton Santos (FAP)'),
('1ee1ee1e-0000-0000-0000-000000000002', 'Profa. Dra. Maria Curie (FAP)'),
('6ee6ee6e-0000-0000-0000-000000000001', 'Prof. Dr. Enrico Fermi (FNC)')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

-- 5. Inserção de Dados (Linhas de Pesquisa)
INSERT INTO public.research_lines (id, nome) VALUES
('33333333-0000-0000-0000-000000000001', 'Nanomateriais'),
('33333333-0000-0000-0000-000000000002', 'Supercondutividade'),
('33333333-0000-0000-0000-000000000003', 'Física de Altas Energias'),
('33333333-0000-0000-0000-000000000004', 'Óptica Quântica')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

-- 6. Tabelas de Junção (O Elo Perdido)
-- FAP -> Labs
INSERT INTO public.department_laboratories (department_id, laboratory_id) VALUES
('d1000000-0000-0000-0000-000000000000', '1ab1ab1a-0000-0000-0000-000000000001'),
('d1000000-0000-0000-0000-000000000000', '1ab1ab1a-0000-0000-0000-000000000002'),
('d1000000-0000-0000-0000-000000000000', '2ab2ab2a-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- FAP -> Pesquisadores
INSERT INTO public.department_researchers (department_id, researcher_id) VALUES
('d1000000-0000-0000-0000-000000000000', '1ee1ee1e-0000-0000-0000-000000000001'),
('d1000000-0000-0000-0000-000000000000', '1ee1ee1e-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Lab -> Pesquisadores
INSERT INTO public.laboratory_researchers (laboratory_id, researcher_id) VALUES
('1ab1ab1a-0000-0000-0000-000000000001', '1ee1ee1e-0000-0000-0000-000000000001'),
('2ab2ab2a-0000-0000-0000-000000000001', '1ee1ee1e-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
