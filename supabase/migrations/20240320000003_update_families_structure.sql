-- Atualiza a estrutura da tabela families
ALTER TABLE families
  -- Remove campos antigos
  DROP COLUMN IF EXISTS main_contact_name,
  DROP COLUMN IF EXISTS main_contact_email,
  DROP COLUMN IF EXISTS main_contact_phone,
  DROP COLUMN IF EXISTS phone_fixo,
  DROP COLUMN IF EXISTS has_children,
  -- Adiciona novos campos
  ADD COLUMN IF NOT EXISTS esposo_nome text NOT NULL,
  ADD COLUMN IF NOT EXISTS esposo_phone text,
  ADD COLUMN IF NOT EXISTS esposo_email text,
  ADD COLUMN IF NOT EXISTS esposo_profissao text,
  ADD COLUMN IF NOT EXISTS esposa_nome text NOT NULL,
  ADD COLUMN IF NOT EXISTS esposa_phone text,
  ADD COLUMN IF NOT EXISTS esposa_email text,
  ADD COLUMN IF NOT EXISTS esposa_profissao text,
  ADD COLUMN IF NOT EXISTS contato_principal text NOT NULL CHECK (contato_principal IN ('esposo', 'esposa'));

-- Atualiza a estrutura da tabela participants
ALTER TABLE participants
  -- Remove campos relacionados a pajens (serão tratados em outra tabela)
  DROP COLUMN IF EXISTS is_pajem,
  DROP COLUMN IF EXISTS pajem_idade,
  DROP COLUMN IF EXISTS pajem_parentesco,
  DROP COLUMN IF EXISTS pajem_phone,
  DROP COLUMN IF EXISTS marital_status,
  -- Torna campos obrigatórios
  ALTER COLUMN family_id SET NOT NULL,
  ALTER COLUMN is_child SET NOT NULL;

-- Cria índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_families_esposo_nome ON families(esposo_nome);
CREATE INDEX IF NOT EXISTS idx_families_esposa_nome ON families(esposa_nome);
CREATE INDEX IF NOT EXISTS idx_participants_family_id ON participants(family_id);
CREATE INDEX IF NOT EXISTS idx_participants_is_child ON participants(is_child); 