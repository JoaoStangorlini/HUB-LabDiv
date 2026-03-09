-- Protocol Síncrotron v4.20: Seed Equivalency Data
-- Mapeamento N-para-1 (Licenciatura -> Bacharelado/Médica)

-- Física I (Bach)
UPDATE public.learning_trails 
SET equivalency_map = '{"lic": {"codes": ["4300151", "4300153"], "logic": "AND"}}'::jsonb 
WHERE course_code = '4302111';

-- Física II (Bach)
UPDATE public.learning_trails 
SET equivalency_map = '{"lic": {"codes": ["4300159", "4300357"], "logic": "AND"}}'::jsonb 
WHERE course_code = '4302112';

-- Física III (Bach)
UPDATE public.learning_trails 
SET equivalency_map = '{"lic": {"codes": ["4300270", "4300271"], "logic": "AND"}}'::jsonb 
WHERE course_code = '4302211';

-- Física IV (Bach)
UPDATE public.learning_trails 
SET equivalency_map = '{"lic": {"codes": ["4300160", "4300372", "4300374"], "logic": "AND"}}'::jsonb 
WHERE course_code = '4302212';

-- Física Quântica (Bach) - CASO ESPECIAL OR
UPDATE public.learning_trails 
SET equivalency_map = '{"lic": {"codes": ["4300375", "4300371"], "logic": "OR"}}'::jsonb 
WHERE course_code = '4302311';

-- Física Experimental I (Bach)
UPDATE public.learning_trails 
SET equivalency_map = '{"lic": {"codes": ["4300152", "4300254"], "logic": "AND"}}'::jsonb 
WHERE course_code = '4302113';

-- Física Experimental III (Bach)
UPDATE public.learning_trails 
SET equivalency_map = '{"lic": {"codes": ["4300373"], "logic": "AND"}}'::jsonb 
WHERE course_code = '4302213';

-- Física Experimental V (Bach)
UPDATE public.learning_trails 
SET equivalency_map = '{"lic": {"codes": ["4300377"], "logic": "AND"}}'::jsonb 
WHERE course_code = '4302313';
