-- Script para verificar e configurar autenticação anônima no Supabase
-- 1. Verificar se a autenticação anônima está habilitada
-- Este script deve ser executado no SQL Editor do Supabase Dashboard
-- Para habilitar autenticação anônima, você precisa:
-- 1. Ir para Authentication > Settings no Dashboard do Supabase
-- 2. Habilitar "Enable anonymous sign-ins" na seção "User Signups"
-- 2. Opcional: Criar uma tabela para rastrear pedidos anônimos
CREATE TABLE IF NOT EXISTS pedidos_anonimos (
   id BIGSERIAL PRIMARY KEY,
   user_id UUID REFERENCES auth.users(id),
   servico_id BIGINT,
   endereco JSONB NOT NULL,
   descricao TEXT,
   status VARCHAR(50) DEFAULT 'pendente',
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Habilitar RLS (Row Level Security) para a tabela
ALTER TABLE pedidos_anonimos ENABLE ROW LEVEL SECURITY;
-- 4. Criar políticas de segurança para usuários anônimos e autenticados
CREATE POLICY "Usuários podem criar seus próprios pedidos" ON pedidos_anonimos FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver seus próprios pedidos" ON pedidos_anonimos FOR
SELECT USING (auth.uid() = user_id);
-- 5. Opcional: Função para limpar usuários anônimos antigos (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_anonymous_users() RETURNS void AS $$ BEGIN -- Remove usuários anônimos criados há mais de 30 dias
DELETE FROM auth.users
WHERE is_anonymous = true
   AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;