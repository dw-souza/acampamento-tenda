-- Adicionar campo is_coordinator na tabela camp_family_assignments existente
ALTER TABLE camp_family_assignments ADD COLUMN is_coordinator BOOLEAN DEFAULT FALSE;

-- Adicionar campo is_special_team na tabela work_teams se ainda não existir
ALTER TABLE work_teams ADD COLUMN IF NOT EXISTS is_special_team BOOLEAN DEFAULT FALSE;

-- Inserir equipes especiais se ainda não existirem
INSERT INTO work_teams (name, description, color, is_special_team) 
VALUES 
    ('Ensino', 'Responsável pelo ensino e formação durante o acampamento', '#8B5CF6', TRUE),
    ('Confidentes', 'Responsável pelo acompanhamento espiritual e confissões', '#10B981', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Atualizar equipes existentes para marcar como não especiais
UPDATE work_teams SET is_special_team = FALSE WHERE is_special_team IS NULL; 