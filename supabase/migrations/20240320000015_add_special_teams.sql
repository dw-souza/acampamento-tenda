-- Adicionar campo para identificar equipes especiais (que trabalham com casais individuais)
ALTER TABLE work_teams ADD COLUMN is_special_team BOOLEAN DEFAULT FALSE;

-- Criar tabela para designações de casais individuais para equipes especiais
CREATE TABLE camp_family_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES tent_families(id) ON DELETE CASCADE,
    work_team_id UUID NOT NULL REFERENCES work_teams(id) ON DELETE CASCADE,
    is_coordinator BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(camp_id, family_id, work_team_id)
);

-- Criar índices para melhorar performance
CREATE INDEX idx_camp_family_assignments_camp_id ON camp_family_assignments(camp_id);
CREATE INDEX idx_camp_family_assignments_family_id ON camp_family_assignments(family_id);
CREATE INDEX idx_camp_family_assignments_work_team_id ON camp_family_assignments(work_team_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_camp_family_assignments_updated_at
    BEFORE UPDATE ON camp_family_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE camp_family_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para camp_family_assignments
CREATE POLICY "Enable read access for all users" ON camp_family_assignments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON camp_family_assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON camp_family_assignments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON camp_family_assignments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Inserir equipes especiais
INSERT INTO work_teams (name, description, color, is_special_team) VALUES
    ('Ensino', 'Responsável pelo ensino e formação durante o acampamento', '#8B5CF6', TRUE),
    ('Confidentes', 'Responsável pelo acompanhamento espiritual e confissões', '#10B981', TRUE);

-- Atualizar equipes existentes para marcar como não especiais
UPDATE work_teams SET is_special_team = FALSE WHERE is_special_team IS NULL; 