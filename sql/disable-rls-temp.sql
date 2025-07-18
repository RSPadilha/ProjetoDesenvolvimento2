-- ALTERNATIVA SIMPLES: Desabilitar RLS temporariamente para testes
-- Execute APENAS se você quiser desabilitar a segurança temporariamente
-- Desabilitar RLS na tabela servicos (CUIDADO: reduz a segurança)
ALTER TABLE servicos DISABLE ROW LEVEL SECURITY;
-- Para reabilitar depois:
-- ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;