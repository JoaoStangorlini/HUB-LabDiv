INSERT INTO public.learning_trails (
    id, course_code, title, axis, 
    credits_aula, credits_trabalho, prerequisites, 
    course_map, excitation_level, requires_pcc_validation
) VALUES 
(gen_random_uuid(), '4300151', 'Fundamentos de Mecânica', 'lic', 4, 0, '{}', '{"licenciatura": "obrigatoria"}', 1, false),
(gen_random_uuid(), '4300157', 'Ciência, Educação e Linguagem', 'lic', 2, 1, '{}', '{"licenciatura": "obrigatoria"}', 1, true),
(gen_random_uuid(), '4300160', 'Ótica', 'lic', 2, 1, '{}', '{"licenciatura": "obrigatoria"}', 1, false),
(gen_random_uuid(), 'MAT0105', 'Geometria Analítica', 'lic', 4, 0, '{}', '{"licenciatura": "obrigatoria"}', 1, false),
(gen_random_uuid(), 'MAT1351', 'Cálculo para Funções de uma Variável Real I', 'lic', 6, 0, '{}', '{"licenciatura": "obrigatoria"}', 1, false),

(gen_random_uuid(), '4300152', 'Introdução às Medidas em Física', 'lic', 4, 0, '{}', '{"licenciatura": "obrigatoria"}', 2, false),
(gen_random_uuid(), '4300153', 'Mecânica', 'lic', 4, 1, '{"4300151", "MAT1351"}', '{"licenciatura": "obrigatoria"}', 2, false),
(gen_random_uuid(), '4300156', 'Gravitação', 'lic', 2, 0, '{"4300151", "MAT1351"}', '{"licenciatura": "obrigatoria"}', 2, false),
(gen_random_uuid(), 'EDM0402', 'Didática', 'lic', 4, 1, '{}', '{"licenciatura": "obrigatoria"}', 2, false),
(gen_random_uuid(), 'MAT1352', 'Cálculo para Funções de uma Variável Real II', 'lic', 6, 0, '{"MAT1351"}', '{"licenciatura": "obrigatoria"}', 2, false),

(gen_random_uuid(), '4300159', 'Física do Calor', 'lic', 4, 0, '{"MAT1352"}', '{"licenciatura": "obrigatoria"}', 3, false),
(gen_random_uuid(), '4300254', 'Laboratório de Mecânica', 'lic', 2, 0, '{"4300152", "4300153"}', '{"licenciatura": "obrigatoria"}', 3, false),
(gen_random_uuid(), '4300255', 'Mecânica dos Corpos Rígidos e Fluidos', 'lic', 4, 1, '{"4300153"}', '{"licenciatura": "obrigatoria"}', 3, false),
(gen_random_uuid(), 'EDF029X', 'Psicologia da Educação', 'lic', 4, 1, '{}', '{"licenciatura": "obrigatoria"}', 3, false),
(gen_random_uuid(), 'MAT2351', 'Cálculo para Funções de duas Variáveis Reais I', 'lic', 4, 0, '{"MAT1352", "MAT0105"}', '{"licenciatura": "obrigatoria"}', 3, false),

(gen_random_uuid(), '4300259', 'Termo-Estatística', 'lic', 4, 1, '{"4300159"}', '{"licenciatura": "obrigatoria"}', 4, false),
(gen_random_uuid(), '4300270', 'Eletricidade e Magnetismo I', 'lic', 4, 0, '{"MAT2351", "MAT1352"}', '{"licenciatura": "obrigatoria"}', 4, false),
(gen_random_uuid(), '4300356', 'Elementos e Estratégias para o Ensino de Física e Ciências', 'lic', 4, 1, '{"MAT1351"}', '{"licenciatura": "obrigatoria"}', 4, true),
(gen_random_uuid(), 'EDA0463', 'Política e Organização da Educação Básica no Brasil', 'lic', 4, 2, '{}', '{"licenciatura": "obrigatoria"}', 4, false),
(gen_random_uuid(), 'MAT2352', 'Cálculo para Funções de duas Variáveis Reais II', 'lic', 4, 0, '{"MAT2351"}', '{"licenciatura": "obrigatoria"}', 4, false),

(gen_random_uuid(), '4300357', 'Oscilações e Ondas', 'lic', 2, 0, '{"4300255"}', '{"licenciatura": "obrigatoria"}', 5, false),
(gen_random_uuid(), '4300271', 'Eletricidade e Magnetismo II', 'lic', 4, 1, '{"4300270"}', '{"licenciatura": "obrigatoria"}', 5, false),
(gen_random_uuid(), '4300358', 'Propostas e Projetos para o Ensino de Física e Ciências', 'lic', 4, 1, '{"4300356"}', '{"licenciatura": "obrigatoria"}', 5, true),
(gen_random_uuid(), '4300390', 'Práticas em Ensino de Física e Ciências', 'lic', 2, 3, '{"4300358"}', '{"licenciatura": "obrigatoria"}', 5, true),
(gen_random_uuid(), '4300373', 'Laboratório de Eletromagnetismo', 'lic', 4, 0, '{"4300152", "4300270"}', '{"licenciatura": "obrigatoria"}', 5, false),

(gen_random_uuid(), '4300372', 'Eletromagnetismo', 'lic', 4, 0, '{"4300271"}', '{"licenciatura": "obrigatoria"}', 6, false),
(gen_random_uuid(), '4300374', 'Relatividade', 'lic', 2, 1, '{"4300271"}', '{"licenciatura": "obrigatoria"}', 6, false),
(gen_random_uuid(), '4300377', 'Evidências Experimentais da Natureza Quântica da Radiação e da Matéria', 'lic', 4, 0, '{"4300357", "4300271"}', '{"licenciatura": "obrigatoria"}', 6, false),

(gen_random_uuid(), '4300458', 'Complementos de Mecânica', 'lic', 4, 0, '{"4300255"}', '{"licenciatura": "obrigatoria"}', 7, false),
(gen_random_uuid(), '4300371', 'Introdução à Mecânica Quântica Ondulatória', 'lic', 4, 1, '{"MAT2352", "4300377"}', '{"licenciatura": "obrigatoria"}', 7, false),
(gen_random_uuid(), 'EDM0425', 'Metodologia do Ensino de Física I', 'lic', 4, 3, '{"EDM0402", "EDA0463"}', '{"licenciatura": "obrigatoria"}', 7, true),
(gen_random_uuid(), 'EDF0665', 'Libras', 'lic', 4, 0, '{}', '{"licenciatura": "obrigatoria"}', 7, false),

(gen_random_uuid(), 'EDM0426', 'Metodologia do Ensino de Física II', 'lic', 4, 3, '{"EDM0425"}', '{"licenciatura": "obrigatoria"}', 8, true)
ON CONFLICT (course_code) DO UPDATE SET
    course_map = learning_trails.course_map || EXCLUDED.course_map,
    title = EXCLUDED.title,
    credits_aula = EXCLUDED.credits_aula,
    credits_trabalho = EXCLUDED.credits_trabalho,
    prerequisites = EXCLUDED.prerequisites,
    excitation_level = EXCLUDED.excitation_level;
