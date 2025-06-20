-- Migração para corrigir a estrutura da tabela tent_families
-- Removendo a foreign key constraint que obriga referenciar families

-- Primeiro, vamos remover a foreign key constraint existente
ALTER TABLE tent_families 
DROP CONSTRAINT IF EXISTS tent_families_family_id_fkey;

-- Agora vamos alterar a coluna family_id para permitir valores únicos independentes
-- Primeiro, vamos criar uma nova coluna temporária
ALTER TABLE tent_families 
ADD COLUMN family_uuid UUID DEFAULT gen_random_uuid();

-- Copiar os valores existentes (se houver)
UPDATE tent_families 
SET family_uuid = family_id 
WHERE family_id IS NOT NULL;

-- Remover a coluna antiga
ALTER TABLE tent_families 
DROP COLUMN family_id;

-- Renomear a nova coluna
ALTER TABLE tent_families 
RENAME COLUMN family_uuid TO family_id;

-- Adicionar constraint UNIQUE para family_id (opcional, para garantir que cada família seja única)
ALTER TABLE tent_families 
ADD CONSTRAINT tent_families_family_id_unique UNIQUE (family_id);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_tent_families_family_id ON tent_families(family_id);

-- Comentário explicativo
COMMENT ON COLUMN tent_families.family_id IS 'UUID único para identificar a família na tenda, independente da tabela families'; 