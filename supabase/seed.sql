-- ============================================================
-- SEED: Perfiles de administradores iniciales
-- ============================================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → Authentication → Users
-- 2. Crea manualmente los dos admins:
--      admin@ubuntu.mx  (contraseña que elijas)
--      admin@saeco.mx   (contraseña que elijas)
-- 3. Copia sus UUIDs y reemplaza los valores de abajo
-- 4. Ejecuta este SQL en Supabase Dashboard → SQL Editor

INSERT INTO public.profiles (id, name, role, company_id)
VALUES
  -- Reemplaza 'UUID-DEL-ADMIN-UBUNTU' con el UUID real de admin@ubuntu.mx
  ('UUID-DEL-ADMIN-UBUNTU', 'Admin Ubuntu', 'admin', 'ubuntu'),
  -- Reemplaza 'UUID-DEL-ADMIN-SAE' con el UUID real de admin@saeco.mx
  ('UUID-DEL-ADMIN-SAE',    'Admin SAE',   'admin', 'sae')
ON CONFLICT (id) DO NOTHING;
