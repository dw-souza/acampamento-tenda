-- Adicionar campos de valores ao acampamento
ALTER TABLE camps
    ADD COLUMN couple_price DECIMAL(10,2) NOT NULL DEFAULT 250.00,
    ADD COLUMN child_price DECIMAL(10,2) NOT NULL DEFAULT 25.00;

-- Remover campos de valores da tabela de famílias (se existirem)
ALTER TABLE families
    DROP COLUMN IF EXISTS couple_price,
    DROP COLUMN IF EXISTS child_price,
    DROP COLUMN IF EXISTS total_price; 