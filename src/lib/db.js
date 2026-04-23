import { supabase } from './supabase.js'

// ── AUTH ─────────────────────────────────────────────────────────────────────

export const db = {

  // Iniciar sesión con email + contraseña
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (pErr || !profile) throw new Error('Perfil no encontrado.')

    return {
      user: {
        id:      data.user.id,
        name:    profile.name,
        email:   data.user.email,
        role:    profile.role,
      },
      companyId: profile.company_id,
    }
  },

  // Cerrar sesión
  signOut: async () => {
    await supabase.auth.signOut()
  },

  // Recuperar sesión existente (al recargar la página)
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!profile) return null

    return {
      user: {
        id:    session.user.id,
        name:  profile.name,
        email: session.user.email,
        role:  profile.role,
      },
      companyId: profile.company_id,
    }
  },

  // ── DATOS DE LA APLICACIÓN (por empresa) ──────────────────────────────────

  // Leer un bloque de datos (portal_obras, portal_cuentas, etc.)
  loadData: async (key, defaultValue) => {
    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', key)
      .maybeSingle()

    if (error) { console.error('loadData error:', key, error); return defaultValue }
    return data ? data.value : defaultValue
  },

  // Guardar un bloque de datos
  saveData: async (key, value) => {
    const { error } = await supabase
      .from('app_data')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) console.error('saveData error:', key, error)
  },

  // ── RECORDATORIOS (por usuario) ───────────────────────────────────────────

  // Leer recordatorios de un usuario en una empresa
  loadUserData: async (userId, companyId, defaultValue) => {
    const { data, error } = await supabase
      .from('recordatorios')
      .select('value')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .maybeSingle()

    if (error) { console.error('loadUserData error:', error); return defaultValue }
    return data ? data.value : defaultValue
  },

  // Guardar recordatorios de un usuario
  saveUserData: async (userId, companyId, value) => {
    const { error } = await supabase
      .from('recordatorios')
      .upsert(
        { user_id: userId, company_id: companyId, value, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,company_id' }
      )

    if (error) console.error('saveUserData error:', error)
  },

  // ── GESTIÓN DE USUARIOS ───────────────────────────────────────────────────

  // Obtener todos los usuarios de una empresa
  getCompanyUsers: async (companyId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, company_id')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true })

    if (error) { console.error('getCompanyUsers error:', error); return [] }

    // Enrich with email from auth.users via RPC
    // (perfiles no almacenan email directamente por seguridad — lo añadimos desde auth si está disponible)
    return (data || []).map(p => ({
      id:         p.id,
      name:       p.name,
      email:      p.email || '',   // puede estar vacío si no se puede leer auth.users
      role:       p.role,
      company_id: p.company_id,
    }))
  },

  // Crear nuevo usuario (llama a Supabase Auth signUp + inserta perfil)
  createUser: async (email, password, { name, role, companyId }) => {
    // 1. Crear cuenta en Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (!data.user) throw new Error('No se pudo crear el usuario.')

    // 2. Insertar perfil
    const { error: pErr } = await supabase.from('profiles').insert({
      id:         data.user.id,
      name,
      role,
      company_id: companyId,
    })
    if (pErr) throw pErr

    return { id: data.user.id, name, email, role, company_id: companyId }
  },

  // Actualizar perfil (nombre y rol)
  updateProfile: async (userId, { name, role }) => {
    const { error } = await supabase
      .from('profiles')
      .update({ name, role })
      .eq('id', userId)

    if (error) throw error
  },

  // Cambiar contraseña vía Edge Function (requiere VITE_SUPABASE_URL)
  updatePassword: async (userId, newPassword) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No hay sesión activa.')

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-update-user`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, password: newPassword }),
      }
    )
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || 'Error al cambiar contraseña.')
    }
  },
}
