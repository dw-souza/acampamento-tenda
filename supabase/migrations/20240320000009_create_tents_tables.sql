-- Criar tabela de tendas
CREATE TABLE tents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    formation_date DATE NOT NULL,
    guardian_husband_name TEXT NOT NULL,
    guardian_wife_name TEXT NOT NULL,
    parish_id UUID NOT NULL REFERENCES parishes(id),
    meeting_date DATE,
    meeting_location TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disbanded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de famílias da tenda (dados atualizados)
CREATE TABLE tent_families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tent_id UUID NOT NULL REFERENCES tents(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    esposo_nome TEXT NOT NULL,
    esposa_nome TEXT NOT NULL,
    esposo_phone TEXT,
    esposo_email TEXT,
    esposo_profissao TEXT,
    esposa_phone TEXT,
    esposa_email TEXT,
    esposa_profissao TEXT,
    address TEXT,
    bairro TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    data_casamento DATE,
    contato_principal TEXT NOT NULL CHECK (contato_principal IN ('esposo', 'esposa')),
    joined_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'left')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tent_id, family_id)
);

-- Criar tabela de filhos da tenda (dados atualizados)
CREATE TABLE tent_children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tent_family_id UUID NOT NULL REFERENCES tent_families(id) ON DELETE CASCADE,
    family_child_id UUID REFERENCES family_children(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    birth_date DATE,
    vai_encontros BOOLEAN DEFAULT true,
    dietary_restrictions TEXT,
    special_needs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para melhorar performance
CREATE INDEX idx_tents_parish_id ON tents(parish_id);
CREATE INDEX idx_tents_status ON tents(status);
CREATE INDEX idx_tent_families_tent_id ON tent_families(tent_id);
CREATE INDEX idx_tent_families_family_id ON tent_families(family_id);
CREATE INDEX idx_tent_families_status ON tent_families(status);
CREATE INDEX idx_tent_children_tent_family_id ON tent_children(tent_family_id);
CREATE INDEX idx_tent_children_family_child_id ON tent_children(family_child_id);

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_tents_updated_at
    BEFORE UPDATE ON tents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tent_families_updated_at
    BEFORE UPDATE ON tent_families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tent_children_updated_at
    BEFORE UPDATE ON tent_children
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE tents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tent_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE tent_children ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tents
CREATE POLICY "Enable read access for all users" ON tents
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON tents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON tents
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON tents
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para tent_families
CREATE POLICY "Enable read access for all users" ON tent_families
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON tent_families
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON tent_families
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON tent_families
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para tent_children
CREATE POLICY "Enable read access for all users" ON tent_children
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON tent_children
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON tent_children
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON tent_children
    FOR DELETE USING (auth.role() = 'authenticated'); 