-- Script para criar bucket de armazenamento de imagens no Supabase
-- Execute este script no SQL Editor do Supabase
-- 1. Criar o bucket 'servicos-imagens'
INSERT INTO storage.buckets (
      id,
      name,
      public,
      file_size_limit,
      allowed_mime_types
   )
VALUES (
      'servicos-imagens',
      'servicos-imagens',
      true,
      5242880,
      -- 5MB em bytes
      ARRAY ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
   );
-- 2. Criar política para permitir upload de imagens (para usuários autenticados)
CREATE POLICY "Permitir upload de imagens de serviços" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'servicos-imagens');
-- 3. Criar política para permitir visualização pública das imagens
CREATE POLICY "Permitir visualização pública de imagens" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'servicos-imagens');
-- 4. Criar política para permitir atualização de imagens (para usuários autenticados)
CREATE POLICY "Permitir atualização de imagens de serviços" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'servicos-imagens');
-- 5. Criar política para permitir exclusão de imagens (para usuários autenticados)
CREATE POLICY "Permitir exclusão de imagens de serviços" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'servicos-imagens');
-- 6. Adicionar coluna 'imagem' na tabela 'servicos' se não existir
ALTER TABLE servicos
ADD COLUMN IF NOT EXISTS imagem TEXT;
-- 7. Criar comentário para documentar a coluna
COMMENT ON COLUMN servicos.imagem IS 'URL da imagem do serviço armazenada no Supabase Storage';