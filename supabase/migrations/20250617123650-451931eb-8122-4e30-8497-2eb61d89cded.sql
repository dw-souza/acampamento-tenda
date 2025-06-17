
-- Remover as políticas atuais
DROP POLICY IF EXISTS "Users can view their own admin status" ON public.admins;
DROP POLICY IF EXISTS "Authenticated users can insert admin records" ON public.admins;

-- Criar uma política mais permissiva para SELECT que permite usuários autenticados verem todos os registros
CREATE POLICY "Authenticated users can view all admins" 
ON public.admins 
FOR SELECT 
TO authenticated
USING (true);

-- Política para INSERT (apenas para usuários autenticados)
CREATE POLICY "Authenticated users can insert admin records" 
ON public.admins 
FOR INSERT 
TO authenticated
WITH CHECK (true);
