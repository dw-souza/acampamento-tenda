-- Criar nova tabela family_children
CREATE TABLE family_children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    birth_date DATE,
    vai_acampamento BOOLEAN DEFAULT true,
    dietary_restrictions TEXT,
    special_needs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar nova tabela tent_children
CREATE TABLE tent_children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tent_id UUID NOT NULL REFERENCES tents(id) ON DELETE CASCADE,
    family_child_id UUID NOT NULL REFERENCES family_children(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tent_id, family_child_id)
);

-- Migrar dados da tabela participants para family_children
INSERT INTO family_children (
    id,
    family_id,
    full_name,
    birth_date,
    vai_acampamento,
    dietary_restrictions,
    special_needs,
    created_at,
    updated_at
)
SELECT 
    id,
    family_id,
    full_name,
    birth_date::DATE,
    vai_acampamento,
    dietary_restrictions,
    special_needs,
    created_at,
    updated_at
FROM participants
WHERE is_child = true;

-- Criar índices para melhorar performance
CREATE INDEX idx_family_children_family_id ON family_children(family_id);
CREATE INDEX idx_tent_children_tent_id ON tent_children(tent_id);
CREATE INDEX idx_tent_children_family_child_id ON tent_children(family_child_id);

-- Adicionar triggers para atualizar updated_at
CREATE TRIGGER update_family_children_updated_at
    BEFORE UPDATE ON family_children
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tent_children_updated_at
    BEFORE UPDATE ON tent_children
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar RLS policies
ALTER TABLE family_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE tent_children ENABLE ROW LEVEL SECURITY;

-- Policies para family_children
CREATE POLICY "Enable read access for all users" ON family_children
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON family_children
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON family_children
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON family_children
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para tent_children
CREATE POLICY "Enable read access for all users" ON tent_children
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON tent_children
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON tent_children
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON tent_children
    FOR DELETE USING (auth.role() = 'authenticated');

-- Remover a tabela participants após a migração
DROP TABLE IF EXISTS participants; 