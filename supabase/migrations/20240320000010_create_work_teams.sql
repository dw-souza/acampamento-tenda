-- Criar tabela de equipes de trabalho
CREATE TABLE work_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de designação de tendas para equipes
CREATE TABLE camp_work_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
    tent_id UUID NOT NULL REFERENCES tents(id) ON DELETE CASCADE,
    work_team_id UUID NOT NULL REFERENCES work_teams(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member', 'assistant')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(camp_id, tent_id, work_team_id)
);

-- Criar índices para melhorar performance
CREATE INDEX idx_work_teams_name ON work_teams(name);
CREATE INDEX idx_camp_work_assignments_camp_id ON camp_work_assignments(camp_id);
CREATE INDEX idx_camp_work_assignments_tent_id ON camp_work_assignments(tent_id);
CREATE INDEX idx_camp_work_assignments_work_team_id ON camp_work_assignments(work_team_id);

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_work_teams_updated_at
    BEFORE UPDATE ON work_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_camp_work_assignments_updated_at
    BEFORE UPDATE ON camp_work_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE work_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_work_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para work_teams
CREATE POLICY "Enable read access for all users" ON work_teams
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON work_teams
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON work_teams
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON work_teams
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para camp_work_assignments
CREATE POLICY "Enable read access for all users" ON camp_work_assignments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON camp_work_assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON camp_work_assignments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON camp_work_assignments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Inserir algumas equipes padrão
INSERT INTO work_teams (name, description, color) VALUES
    ('Cozinha', 'Responsável pela preparação das refeições', '#EF4444'),
    ('Secretaria', 'Responsável pela organização e documentação', '#3B82F6'),
    ('Capela', 'Responsável pela liturgia e momentos espirituais', '#8B5CF6'),
    ('Filhos', 'Responsável pelo cuidado e atividades das crianças', '#10B981'),
    ('Limpeza', 'Responsável pela limpeza e organização dos espaços', '#F59E0B'),
    ('Segurança', 'Responsável pela segurança e controle de acesso', '#6B7280'),
    ('Som e Mídia', 'Responsável pelo sistema de som e apresentações', '#EC4899'),
    ('Logística', 'Responsável pelo transporte e organização geral', '#6366F1'); 