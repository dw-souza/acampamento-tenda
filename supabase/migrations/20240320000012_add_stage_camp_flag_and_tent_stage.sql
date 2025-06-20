-- Adicionar flag is_camp na tabela stages
ALTER TABLE stages 
ADD COLUMN is_camp BOOLEAN NOT NULL DEFAULT false;

-- Adicionar campo stage_id na tabela tents
ALTER TABLE tents 
ADD COLUMN stage_id UUID REFERENCES stages(id);

-- Criar índice para melhorar performance
CREATE INDEX idx_tents_stage_id ON tents(stage_id);

-- Atualizar dados existentes para marcar etapas conhecidas como acampamentos
UPDATE stages 
SET is_camp = true 
WHERE name IN ('KERIGMA', 'TABOR', 'SHEKINAH', 'MISSÃO');

-- Atualizar tendas existentes para associar com a etapa KERIGMA (assumindo que tendas existentes são do Kerigma)
UPDATE tents 
SET stage_id = (SELECT id FROM stages WHERE name = 'KERIGMA' LIMIT 1)
WHERE stage_id IS NULL; 