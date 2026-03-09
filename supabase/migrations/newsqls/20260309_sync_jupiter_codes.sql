-- Protocol Síncrotron v4.20: Sync JupiterWeb Codes
-- Processos Criativos em Ciências: 4300350 -> 4300220

-- 1. Atualizar o código principal
UPDATE public.learning_trails 
SET course_code = '4300220', 
    title = 'Processos Criativos em Ciências: da Imaginação à Divulgação Científica'
WHERE course_code = '4300350';

-- 2. Propagar a mudança nos pré-requisitos de outras disciplinas
-- Usamos array_replace para trocar o código antigo pelo novo nos arrays de requisitos
UPDATE public.learning_trails
SET prerequisites = array_replace(prerequisites, '4300350', '4300220')
WHERE '4300350' = ANY(prerequisites);
