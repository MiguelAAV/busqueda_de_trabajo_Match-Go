# Match&Go - Guía de Inicio Rápido

## Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Google Cloud Console](https://console.cloud.google.com) para OAuth

---

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/MiguelAAV/busqueda_de_trabajo_Match-Go.git
cd busqueda_de_trabajo_Match-Go
```

---

## Paso 2: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Click en **"New Project"**
3. Completa:
   - **Name:** `matchgo`
   - **Database Password:** (genera una segura)
   - **Region:** `South America (São Paulo)`
4. Click **"Create new project"**
5. Espera ~2 minutos hasta que esté listo

---

## Paso 3: Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` con tus datos:

```env
# Supabase - Obtén estos de Project Settings > API
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"

# Google OAuth - Obtén de Google Cloud Console
GOOGLE_CLIENT_ID="tu-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"

# WebPay (Transbank) - Para producción
WEBPAY_COMMERCE_CODE=""
WEBPAY_API_KEY=""
WEBPAY_ENVIRONMENT="integration"
WEBPAY_CALLBACK_URL="http://localhost:3000/api/webpay/callback"
```

### ¿Dónde encontrar las claves de Supabase?
1. Ve a tu proyecto en Supabase
2. **Settings** → **API**
3. Copia:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

---

## Paso 4: Configurar Auth en Supabase

### 4.1 Habilitar Google OAuth

1. En Supabase Dashboard → **Authentication** → **Providers**
2. Click en **Google**
3. Toggle **Enable Google OAuth** a ON
4. Ingresa:
   - **Client ID:** (de Google Cloud Console)
   - **Client Secret:** (de Google Cloud Console)
5. En **Authorized Redirect URI** copia: `https://[PROJECT-REF].supabase.co/auth/v1/callback`
6. Click **Save**

### 4.2 Configurar en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea nuevo proyecto o selecciona existente
3. **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: `Match&Go`
   - Support email: tu email
4. **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Match&Go Web`
   - Authorized redirect URIs: `https://[PROJECT-REF].supabase.co/auth/v1/callback`
5. Copia **Client ID** y **Client Secret** al `.env`

---

## Paso 5: Crear Base de Datos

### 5.1 Ejecutar Migraciones de Prisma

```bash
# Generar cliente Prisma
npx prisma generate --schema=./prisma/schema.prisma

# Crear tablas en Supabase
npx prisma db push --schema=./prisma/schema.prisma
```

### 5.2 Verificar en Supabase

1. Ve a **Table Editor** en Supabase Dashboard
2. Deberías ver las tablas:
   - `Usuario`
   - `Empresa`
   - `Trabajador`
   - `Oferta`
   - `Postulacion`
   - `Suscripcion`
   - `Transaccion`

---

## Paso 6: Habilitar Row Level Security (RLS)

En Supabase Dashboard → **Table Editor** → Selecciona cada tabla → **Policies**

### Políticas básicas (ejemplo para tabla `Empresa`):

```sql
-- Solo usuarios autenticados pueden ver empresas
CREATE POLICY "Usuarios autenticados pueden ver empresas"
ON public."Empresa"
FOR SELECT
TO authenticated
USING (true);

-- Usuarios pueden insertar su propia empresa
CREATE POLICY "Usuarios pueden crear empresa"
ON public."Empresa"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Usuarios pueden actualizar su empresa
CREATE POLICY "Usuarios pueden actualizar empresa"
ON public."Empresa"
FOR UPDATE
TO authenticated
USING (true);
```

Repite para cada tabla según las reglas de negocio.

---

## Paso 7: Desplegar Edge Functions

### 7.1 Instalar Supabase CLI

```bash
npm install -g supabase
```

### 7.2 Login

```bash
supabase login
```

### 7.3 Link al proyecto

```bash
supabase link --project-ref=[PROJECT-REF]
```

### 7.4 Desplegar funciones

```bash
supabase functions deploy
```

---

## Paso 8: Configurar Storage (opcional)

Para subir logos y certificados:

1. En Supabase → **Storage** → **New bucket**
2. Nombre: `documents`
3. Public: YES
4. Agrega policies para acceso autenticado

---

## Paso 9: Probar el Backend

### 9.1 Usando el CLI de Supabase

```bash
# Probar función de ejemplo
supabase functions serve auth/me --env-file=.env
```

### 9.2 Verificar en Dashboard

1. Ve a **Edge Functions** en Supabase
2. Verifica que todas las funciones estén desplegadas
3. Revisa **Logs** para errores

---

## Comandos Útiles

```bash
# Desarrollo local de Edge Functions
supabase functions serve --env-file=.env

# Regenerar Prisma Client
npx prisma generate

# Ver estado de migraciones
npx prisma migrate status

# Abrir Prisma Studio (GUI de DB)
npx prisma studio

# Tests
npm run test

# Linting
npm run lint
```

---

## Solución de Problemas

### Error: "Connection refused"
- Verifica que el proyecto de Supabase esté activo
- Revisa el `DATABASE_URL` en `.env`

### Error: "Invalid JWT"
- Regenera las claves en Supabase Settings
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` sea correcto

### Error: "Google OAuth not configured"
- Verifica que habilitaste Google en Authentication → Providers
- Revisa que el redirect URI en Google Cloud Console sea correcto

### Edge Functions no responden
- Revisa los logs en Supabase Dashboard
- Verifica que todas las variables de entorno estén configuradas

---

## Próximos Pasos

1. Configurar frontend Next.js
2. Integrar WebPay para pagos
3. Configurar notificaciones push
4. Implementar tests automatizados
5. Desplegar a producción

---

## Recursos

- [Documentación Supabase](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Google Cloud Console](https://console.cloud.google.com)
- [Transbank WebPay](https://www.transbankdevelopers.cl/)
