-- Migration: Map prerequisites data for IF disciplines
-- Project: IF-USP Hub Lab-Div

-- Eixo Bacharelado / Física Médica
UPDATE public.learning_trails SET prerequisites = ARRAY['4302111'] WHERE course_code = '4302112';
UPDATE public.learning_trails SET prerequisites = ARRAY['4302113', 'MAT2453'] WHERE course_code = '4302114';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT2453'] WHERE course_code = 'MAT2454';
UPDATE public.learning_trails SET prerequisites = ARRAY['4302111'] WHERE course_code = '4300208';
UPDATE public.learning_trails SET prerequisites = ARRAY['4302111', 'MAT0112', 'MAT2454'] WHERE course_code = '4302211';
UPDATE public.learning_trails SET prerequisites = ARRAY['4302114', 'MAT2454'] WHERE course_code = '4302213';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT2454'] WHERE course_code = 'MAT0216';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT2454', 'MAT0112'] WHERE course_code = '4302204';
UPDATE public.learning_trails SET prerequisites = ARRAY['4302211', '4302112'] WHERE course_code = '4302212';
UPDATE public.learning_trails SET prerequisites = ARRAY['4302211', '4302213'] WHERE course_code = '4302214';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT0216'] WHERE course_code = 'MAT0226';
UPDATE public.learning_trails SET prerequisites = ARRAY['4302112', 'MAT2454'] WHERE course_code = '4302305';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT0216'] WHERE course_code = '4302311';
UPDATE public.learning_trails SET prerequisites = ARRAY['4302214'] WHERE course_code = '4302313';
UPDATE public.learning_trails SET prerequisites = ARRAY['4302212', 'MAT0216'] WHERE course_code = '4302303';
UPDATE public.learning_trails SET prerequisites = ARRAY['4302112', '4300208', 'MAT2454'] WHERE course_code = '4302401';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT0122', '4302311', '4302204'] WHERE course_code = '4302403';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT2453', '4300218'] WHERE course_code = 'MAP0214';

-- Eixo Licenciatura
UPDATE public.learning_trails SET prerequisites = ARRAY['4300151', 'MAT1351'] WHERE course_code = '4300153';
UPDATE public.learning_trails SET prerequisites = ARRAY['4300151', 'MAT1351'] WHERE course_code = '4300156';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT1351'] WHERE course_code = 'MAT1352';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT1352'] WHERE course_code = '4300159';
UPDATE public.learning_trails SET prerequisites = ARRAY['4300152', '4300153'] WHERE course_code = '4300254';
UPDATE public.learning_trails SET prerequisites = ARRAY['4300153'] WHERE course_code = '4300255';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT1352', 'MAT0105'] WHERE course_code = 'MAT2351';
UPDATE public.learning_trails SET prerequisites = ARRAY['4300159'] WHERE course_code = '4300259';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT2351', 'MAT1352'] WHERE course_code = '4300270';
UPDATE public.learning_trails SET prerequisites = ARRAY['MAT2351'] WHERE course_code = 'MAT2352';
UPDATE public.learning_trails SET prerequisites = ARRAY['4300270'] WHERE course_code = '4300271';
UPDATE public.learning_trails SET prerequisites = ARRAY['4300152', '4300270'] WHERE course_code = '4300373';
UPDATE public.learning_trails SET prerequisites = ARRAY['4300271'] WHERE course_code = '4300372';
UPDATE public.learning_trails SET prerequisites = ARRAY['4300271'] WHERE course_code = '4300374';
