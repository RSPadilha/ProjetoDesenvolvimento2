-- Script para atualizar tabela existente de "observacao" para "descricao"
-- Execute este script se você já tinha a tabela criada com o campo "observacao"
-- 1. Verificar se a coluna "observacao" existe e renomeá-la para "descricao"
DO $$ BEGIN -- Verificar se a coluna "observacao" existe na tabela pedidos_anonimos
IF EXISTS (
   SELECT 1
   FROM information_schema.columns
   WHERE table_name = 'pedidos_anonimos'
      AND column_name = 'observacao'
) THEN -- Renomear a coluna de "observacao" para "descricao"
ALTER TABLE pedidos_anonimos
   RENAME COLUMN observacao TO descricao;
RAISE NOTICE 'Coluna "observacao" renomeada para "descricao" na tabela pedidos_anonimos';
ELSE RAISE NOTICE 'Coluna "observacao" não encontrada na tabela pedidos_anonimos';
END IF;
END $$;
-- 2. Se você tem uma tabela "pedidos" principal, faça o mesmo
DO $$ BEGIN -- Verificar se a coluna "observacao" existe na tabela pedidos
IF EXISTS (
   SELECT 1
   FROM information_schema.columns
   WHERE table_name = 'pedidos'
      AND column_name = 'observacao'
) THEN -- Renomear a coluna de "observacao" para "descricao"
ALTER TABLE pedidos
   RENAME COLUMN observacao TO descricao;
RAISE NOTICE 'Coluna "observacao" renomeada para "descricao" na tabela pedidos';
ELSE RAISE NOTICE 'Coluna "observacao" não encontrada na tabela pedidos';
END IF;
END $$;