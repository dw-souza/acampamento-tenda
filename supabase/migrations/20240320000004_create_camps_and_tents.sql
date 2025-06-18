-- Tabela de acampamentos
CREATE TABLE camps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    stage_id UUID NOT NULL REFERENCES stages(id),
    parish_id UUID NOT NULL REFERENCES parishes(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_families INTEGER NOT NULL DEFAULT 16,
    registration_start_date DATE NOT NULL,
    registration_end_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'closed', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de inscrições em acampamentos
CREATE TABLE camp_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'waitlist', 'cancelled')),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(camp_id, family_id)
);

-- Tabela de tendas
CREATE TABLE tents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES stages(id),
    parish_id UUID NOT NULL REFERENCES parishes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de membros da tenda
CREATE TABLE tent_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tent_id UUID NOT NULL REFERENCES tents(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('leader', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tent_id, family_id)
);

-- Índices
CREATE INDEX idx_camps_stage_id ON camps(stage_id);
CREATE INDEX idx_camps_parish_id ON camps(parish_id);
CREATE INDEX idx_camp_registrations_camp_id ON camp_registrations(camp_id);
CREATE INDEX idx_camp_registrations_family_id ON camp_registrations(family_id);
CREATE INDEX idx_tents_camp_id ON tents(camp_id);
CREATE INDEX idx_tents_stage_id ON tents(stage_id);
CREATE INDEX idx_tents_parish_id ON tents(parish_id);
CREATE INDEX idx_tent_members_tent_id ON tent_members(tent_id);
CREATE INDEX idx_tent_members_family_id ON tent_members(family_id);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_camps_updated_at
    BEFORE UPDATE ON camps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_camp_registrations_updated_at
    BEFORE UPDATE ON camp_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tents_updated_at
    BEFORE UPDATE ON tents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tent_members_updated_at
    BEFORE UPDATE ON tent_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 