-- Update is_admin function to include new roles
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'labdiv adm' OR
        auth.jwt() ->> 'role' = 'moderador' OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'labdiv adm', 'moderador')
        )
    );
END;
$function$;

-- Ensure RLS policy for profiles allows administrators (new and old) to update
DROP POLICY IF EXISTS "Admins manage profiles" ON profiles;
CREATE POLICY "Admins manage profiles" ON profiles
    FOR ALL
    TO public
    USING (is_admin())
    WITH CHECK (is_admin());
