-- Estrutura de TRUNCATE CASCADE do V4.0 Golden Master
-- Deleta rigorosamente todos os submissions e metadados auxiliares, resets e tabelas acessórias.

CREATE OR REPLACE FUNCTION reset_nuclear_v4()
RETURNS void AS $$
BEGIN
  -- A força do CASCADE vai remover dependências em `submission_tags`, `comments`, `reactions`, etc.
  TRUNCATE TABLE submissions CASCADE;
  TRUNCATE TABLE tags CASCADE;
  TRUNCATE TABLE comentarios CASCADE;
  TRUNCATE TABLE reactions CASCADE;
  TRUNCATE TABLE perguntas CASCADE;
  
  -- Lembre-se que profiles E usersauth NÃO devem ser dropados para nâo quebrar as contas de administração
  -- Quaisquer dependencias das tabelas acimas com perfis serão mantidas soltas com ON DELETE CASCADE nas fks,
  -- Então isso é seguro para limpar as informações em si.
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
