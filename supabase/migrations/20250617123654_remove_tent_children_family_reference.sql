-- Migração para remover a referência de family_child_id da tabela tent_children
-- Isso torna os filhos das tendas independentes dos filhos das famílias dos acampamentos

-- Primeiro, vamos remover a foreign key constraint existente
ALTER TABLE tent_children 
DROP CONSTRAINT IF EXISTS tent_children_family_child_id_fkey;

-- Remover a coluna family_child_id que não é mais necessária
ALTER TABLE tent_children 
DROP COLUMN IF EXISTS family_child_id;

-- Remover o índice relacionado
DROP INDEX IF EXISTS idx_tent_children_family_child_id;

-- Comentário explicativo
COMMENT ON TABLE tent_children IS 'Filhos das famílias das tendas, independentes dos filhos das famílias dos acampamentos'; 