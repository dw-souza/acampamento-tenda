
-- Primeiro, vamos desabilitar temporariamente o RLS na tabela admins
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes da tabela admins
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can insert new admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can update admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can delete admins" ON public.admins;

-- Remover a função que estava causando problemas
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- Reabilitar o RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Criar uma política simples que permite que usuários autenticados vejam apenas seus próprios registros de admin
CREATE POLICY "Users can view their own admin status" 
ON public.admins 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Permitir que usuários autenticados insiram registros (isso pode ser restringido mais tarde se necessário)
CREATE POLICY "Authenticated users can insert admin records" 
ON public.admins 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());
