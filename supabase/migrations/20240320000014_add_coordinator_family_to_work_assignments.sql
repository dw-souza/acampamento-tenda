-- Adicionar campo coordinator_family_id na tabela camp_work_assignments
ALTER TABLE camp_work_assignments 
ADD COLUMN coordinator_family_id UUID REFERENCES tent_families(id);

-- Criar índice para melhorar performance
CREATE INDEX idx_camp_work_assignments_coordinator_family_id ON camp_work_assignments(coordinator_family_id);

-- Remover o campo role que não será mais usado
ALTER TABLE camp_work_assignments 
DROP COLUMN role; 