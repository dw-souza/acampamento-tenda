-- Corrigir políticas RLS para camp_tents
-- Permitir acesso sem autenticação para operações básicas

-- Remover políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON camp_tents;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON camp_tents;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON camp_tents;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON camp_tents;

-- Criar novas políticas mais permissivas
CREATE POLICY "Enable read access for all users" ON camp_tents
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON camp_tents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON camp_tents
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON camp_tents
    FOR DELETE USING (true); 