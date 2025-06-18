-- Atualizar a tabela de acampamentos
ALTER TABLE camps
    ADD COLUMN parish_id UUID REFERENCES parishes(id),
    ADD COLUMN max_families INTEGER NOT NULL DEFAULT 16,
    ADD COLUMN registration_start_date DATE,
    ADD COLUMN registration_end_date DATE,
    DROP COLUMN location,
    DROP COLUMN capacity;

-- Atualizar o tipo de status
ALTER TABLE camps
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN status TYPE TEXT USING status::TEXT;

DROP TYPE camp_status;

ALTER TABLE camps
    ALTER COLUMN status SET DEFAULT 'draft',
    ADD CONSTRAINT camps_status_check 
    CHECK (status IN ('draft', 'open', 'closed', 'in_progress', 'completed'));

-- Criar tabela de inscrições em acampamentos
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

-- Índices
CREATE INDEX idx_camps_stage_id ON camps(stage_id);
CREATE INDEX idx_camps_parish_id ON camps(parish_id);
CREATE INDEX idx_camp_registrations_camp_id ON camp_registrations(camp_id);
CREATE INDEX idx_camp_registrations_family_id ON camp_registrations(family_id);

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