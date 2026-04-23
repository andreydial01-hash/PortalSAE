# Portal Empresarial

Portal de gestión para **Ubuntu Constructora** y **SAE & CO Marketing**.  
Stack: React 18 + Vite · Supabase (Auth + DB) · Vercel

---

## Configuración paso a paso

### 1. Supabase — Crear proyecto

1. Ve a [supabase.com](https://supabase.com) → **New project**
2. Elige nombre, contraseña de DB y región (us-east-1 recomendado para México)
3. Espera ~2 min a que el proyecto esté listo

### 2. Supabase — Ejecutar el schema SQL

1. En tu proyecto Supabase → **SQL Editor** → **New query**
2. Copia y pega el contenido de `supabase/migrations/001_schema.sql`
3. Click **Run**

### 3. Supabase — Crear usuarios administradores iniciales

**Primero crea las cuentas en Auth:**
1. Supabase → **Authentication** → **Users** → **Add user**
2. Crea:
   - Email: `admin@ubuntu.mx` | Contraseña: (la que elijas)
   - Email: `admin@saeco.mx`  | Contraseña: (la que elijas)
3. Copia los **UUIDs** que aparecen en la columna "UID"

**Luego crea sus perfiles:**
1. Abre `supabase/seed.sql`
2. Reemplaza `UUID-DEL-ADMIN-UBUNTU` y `UUID-DEL-ADMIN-SAE` con los UUIDs reales
3. Ejecuta el archivo en SQL Editor

### 4. Supabase — Deshabilitar confirmación de email

Para que los nuevos usuarios creados desde la app funcionen sin confirmación de email:

1. Supabase → **Authentication** → **Settings**
2. En **"Enable email confirmations"** → **desactivar**
3. Save

### 5. Supabase — Obtener credenciales

1. Supabase → **Settings** → **API**
2. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public** key → `VITE_SUPABASE_ANON_KEY`

### 6. Variables de entorno locales

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales reales:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 7. Instalar y correr localmente

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Deploy en Vercel

### Opción A — Vercel CLI (más rápido)

```bash
npm install -g vercel
vercel
# En las preguntas, acepta los defaults
# Cuando pregunte por env vars, ingresa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
```

### Opción B — GitHub + Vercel (recomendado para cambios continuos)

1. Sube el proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Portal Empresarial inicial"
   git remote add origin https://github.com/tu-usuario/portal-empresarial.git
   git push -u origin main
   ```

2. Ve a [vercel.com](https://vercel.com) → **New Project** → importa tu repo

3. En **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key de Supabase

4. Click **Deploy**

Cada `git push` a `main` desplegará automáticamente.

---

## Supabase — Edge Function (cambio de contraseñas desde admin)

Para que el módulo de Usuarios pueda cambiar contraseñas:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link tu proyecto (el ID está en Settings → General)
supabase link --project-ref TU_PROJECT_ID

# Deploy de la función
supabase functions deploy admin-update-user
```

Si no despliegas la función, el portal funciona igual — solo el campo de "nueva contraseña" en edición de usuarios no hará nada.

---

## Estructura del proyecto

```
portal-empresarial/
├── src/
│   ├── main.jsx              # Entrada React (no tocar)
│   ├── App.jsx               # Todo el código del portal
│   └── lib/
│       ├── supabase.js       # Cliente Supabase
│       └── db.js             # Funciones de base de datos
├── supabase/
│   ├── migrations/
│   │   └── 001_schema.sql    # Esquema de la DB
│   ├── functions/
│   │   └── admin-update-user/
│   │       └── index.ts      # Edge Function
│   └── seed.sql              # Datos iniciales
├── index.html
├── vite.config.js
├── vercel.json               # Routing SPA
├── package.json
├── .env.example              # Plantilla de variables de entorno
└── .gitignore
```

## Roles y permisos

| Rol | Etiqueta | Módulos |
|-----|----------|---------|
| `admin` | Director General | Todo |
| `administrativo` | Administrativo General | Obras, Caja, Inventario, Vehículos* |
| `logistica` | Logística | Caja, Actividades, Inventario, Vehículos* |
| `operativo` | Administrativo | Caja, Actividades, Inventario, Vehículos* |

*Solo en SAE

## Credenciales demo (después de setup)

- Ubuntu: `admin@ubuntu.mx` / (la contraseña que configuraste)
- SAE: `admin@saeco.mx` / (la contraseña que configuraste)
