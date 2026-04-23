-- ============================================================
-- PORTAL EMPRESARIAL — Esquema inicial
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── EXTENSIONES ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TABLA: profiles ──────────────────────────────────────────
-- Extiende auth.users con nombre, rol y empresa
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  role        TEXT        NOT NULL CHECK (role IN ('admin','administrativo','logistica','operativo')),
  company_id  TEXT        NOT NULL CHECK (company_id IN ('ubuntu','sae')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TABLA: app_data ──────────────────────────────────────────
-- Almacén clave-valor JSON para todos los datos de la app
-- Cada fila contiene los datos de ambas empresas en el JSON
CREATE TABLE IF NOT EXISTS public.app_data (
  key         TEXT        PRIMARY KEY,
  value       JSONB       NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TABLA: recordatorios ─────────────────────────────────────
-- Recordatorios por usuario y empresa (privados)
CREATE TABLE IF NOT EXISTS public.recordatorios (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  TEXT        NOT NULL CHECK (company_id IN ('ubuntu','sae')),
  value       JSONB       NOT NULL DEFAULT '[]',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, company_id)
);

-- ── ÍNDICES ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles (company_id);
CREATE INDEX IF NOT EXISTS idx_recordatorios_user ON public.recordatorios (user_id);

-- ── TRIGGERS: updated_at automático ──────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_app_data_updated ON public.app_data;
CREATE TRIGGER trg_app_data_updated
  BEFORE UPDATE ON public.app_data
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_recordatorios_updated ON public.recordatorios;
CREATE TRIGGER trg_recordatorios_updated
  BEFORE UPDATE ON public.recordatorios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS: habilitar seguridad por fila ────────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_data     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordatorios ENABLE ROW LEVEL SECURITY;

-- ── POLÍTICAS: profiles ───────────────────────────────────────
-- Cualquier usuario autenticado puede leer todos los perfiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Solo se puede insertar el propio perfil (o service role)
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (true);

-- Cada usuario puede actualizar su propio perfil
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ── POLÍTICAS: app_data ───────────────────────────────────────
-- App interna: cualquier usuario autenticado puede leer y escribir
DROP POLICY IF EXISTS "app_data_select" ON public.app_data;
CREATE POLICY "app_data_select" ON public.app_data
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "app_data_all" ON public.app_data;
CREATE POLICY "app_data_all" ON public.app_data
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── POLÍTICAS: recordatorios ──────────────────────────────────
-- Cada usuario solo puede ver y modificar sus propios recordatorios
DROP POLICY IF EXISTS "recordatorios_own" ON public.recordatorios;
CREATE POLICY "recordatorios_own" ON public.recordatorios
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── VISTA: user_emails ────────────────────────────────────────
-- Permite leer emails de auth.users de forma segura
CREATE OR REPLACE VIEW public.user_emails AS
  SELECT id, email FROM auth.users;

GRANT SELECT ON public.user_emails TO authenticated;
