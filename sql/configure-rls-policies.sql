-- Script para configurar políticas de segurança no Supabase
-- Execute este script no SQL Editor do Supabase para resolver o erro de RLS
-- 1. Verificar se RLS está habilitado na tabela servicos
-- ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
-- 2. Criar política para permitir SELECT público (visualização dos serviços)
CREATE POLICY IF NOT EXISTS "Permitir visualização pública de serviços" ON servicos FOR
SELECT TO public USING (true);
-- 3. Criar política para permitir INSERT para usuários autenticados
CREATE POLICY IF NOT EXISTS "Permitir criação de serviços para usuários autenticados" ON servicos FOR
INSERT TO authenticated WITH CHECK (true);
-- 4. Criar política para permitir UPDATE para usuários autenticados
CREATE POLICY IF NOT EXISTS "Permitir atualização de serviços para usuários autenticados" ON servicos FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
-- 5. Criar política para permitir DELETE para usuários autenticados
CREATE POLICY IF NOT EXISTS "Permitir exclusão de serviços para usuários autenticados" ON servicos FOR DELETE TO authenticated USING (true);
-- 6. Configurar políticas para o bucket de storage 'servicos'
-- Política para upload de imagens
CREATE POLICY IF NOT EXISTS "Permitir upload de imagens para usuários autenticados" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'servicos');
-- Política para visualização pública de imagens
CREATE POLICY IF NOT EXISTS "Permitir visualização pública de imagens dos serviços" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'servicos');
-- Política para atualização de imagens
CREATE POLICY IF NOT EXISTS "Permitir atualização de imagens para usuários autenticados" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'servicos');
-- Política para exclusão de imagens
CREATE POLICY IF NOT EXISTS "Permitir exclusão de imagens para usuários autenticados" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'servicos');
-- 7. Adicionar coluna 'imagem' se não existir
ALTER TABLE servicos
ADD COLUMN IF NOT EXISTS imagem TEXT;
-- 8. Verificar políticas existentes (comando para debug)
-- SELECT * FROM pg_policies WHERE tablename = 'servicos';
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';