-- Remover o prefixo "Paróquia" dos nomes das paróquias
UPDATE parishes 
SET name = TRIM(SUBSTRING(name FROM 9)) -- Remove "Paróquia " (8 caracteres + espaço)
WHERE name LIKE 'Paróquia %';

-- Verificar se há algum nome que ainda começa com "Paróquia" (sem espaço)
UPDATE parishes 
SET name = TRIM(SUBSTRING(name FROM 9)) -- Remove "Paróquia" (8 caracteres)
WHERE name LIKE 'Paróquia%' AND name NOT LIKE 'Paróquia %'; 