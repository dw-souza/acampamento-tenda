-- Criar tabela para relacionar acampamentos com tendas selecionadas
-- Usado para etapas que não são Kergima

CREATE TABLE camp_tents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    tent_id UUID NOT NULL REFERENCES tents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(camp_id, tent_id)
);

-- Criar índices para melhorar performance
CREATE INDEX idx_camp_tents_camp_id ON camp_tents(camp_id);
CREATE INDEX idx_camp_tents_tent_id ON camp_tents(tent_id);

-- Habilitar RLS
ALTER TABLE camp_tents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para camp_tents
CREATE POLICY "Enable read access for all users" ON camp_tents
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON camp_tents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON camp_tents
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON camp_tents
    FOR DELETE USING (auth.role() = 'authenticated'); 