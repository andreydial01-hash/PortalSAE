import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Cliente con service role para operaciones admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')  ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar que el solicitante está autenticado
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authErr || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Verificar que el solicitante es admin o administrativo
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'administrativo'].includes(profile.role)) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    // Cambiar la contraseña del usuario objetivo
    const { userId, password } = await req.json()
    if (!userId || !password) {
      return new Response('Faltan campos userId o password', { status: 400, headers: corsHeaders })
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password })
    if (error) {
      return new Response(error.message, { status: 400, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500, headers: corsHeaders })
  }
})
