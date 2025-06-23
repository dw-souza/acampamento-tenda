-- Adicionar suporte a múltiplas paróquias por acampamento
-- Criar tabela de relacionamento many-to-many entre camps e parishes

CREATE TABLE camp_parishes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(camp_id, parish_id)
);

-- Criar índices para melhorar performance
CREATE INDEX idx_camp_parishes_camp_id ON camp_parishes(camp_id);
CREATE INDEX idx_camp_parishes_parish_id ON camp_parishes(parish_id);

-- Migrar dados existentes: criar relacionamentos para acampamentos existentes
INSERT INTO camp_parishes (camp_id, parish_id)
SELECT id, parish_id 
FROM camps 
WHERE parish_id IS NOT NULL;

-- Remover a coluna parish_id da tabela camps
ALTER TABLE camps DROP COLUMN parish_id;

-- Habilitar RLS
ALTER TABLE camp_parishes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para camp_parishes
CREATE POLICY "Enable read access for all users" ON camp_parishes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON camp_parishes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON camp_parishes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON camp_parishes
    FOR DELETE USING (auth.role() = 'authenticated'); 