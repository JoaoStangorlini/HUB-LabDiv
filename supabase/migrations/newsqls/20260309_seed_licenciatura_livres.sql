INSERT INTO public.learning_trails (
    id, course_code, title, axis, 
    credits_aula, credits_trabalho, prerequisites, 
    course_map, excitation_level, requires_pcc_validation
) VALUES 
(gen_random_uuid(), 'IEE0003', 'Aplicações da Energia Solar Térmica', 'lic', 2, 1, '{}', '{"licenciatura": "livre"}', null, false),
(gen_random_uuid(), 'IEE0004', 'Aplicações da Energia Solar Fotovoltaica', 'lic', 2, 1, '{}', '{"licenciatura": "livre"}', null, false)
ON CONFLICT (course_code) DO UPDATE SET
    course_map = learning_trails.course_map || EXCLUDED.course_map,
    title = EXCLUDED.title,
    credits_aula = EXCLUDED.credits_aula,
    credits_trabalho = EXCLUDED.credits_trabalho;
