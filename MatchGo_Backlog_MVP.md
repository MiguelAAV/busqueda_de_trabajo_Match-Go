# Backlog de Producto - Match&Go (MVP)

## Stack Tecnológico

| Capa | Tecnología |
|------|-------------|
| **Frontend** | Next.js (App Router) + TypeScript + Tailwind CSS |
| **Backend** | Next.js API Routes (Server Actions) |
| **ORM** | Prisma |
| **Base de Datos** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Google Provider) |
| **Hosting** | Vercel |
| **Control de Versiones** | GitHub |
| **Notificaciones Push** | Supabase + Expo Notifications |
| **Almacenamiento** | Supabase Storage (S3) |
| **Pagos** | WebPay (Transbank) - API REST |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ENTORNO SUPABASE (Backend-as-a-Service)               │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌───────────────┐ │
│  │    Auth     │   │  Database    │   │   Storage   │   │ Edge Functions│ │
│  │ (Google)    │   │ (PostgreSQL)│   │  (Archivos) │   │ (Lógicanegocio)│ │
│  └─────────────┘   └─────────────┘   └─────────────┘   └───────┬───────┘ │
└───────────────────────────────────────────────┬───────────────┴──────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
┌─────────────────────────┐     ┌─────────────────────────┐    ┌─────────────────────────┐
│   Backend Next.js       │     │   Frontend Next.js       │    │   WebPay (Transbank)   │
│   (Repo GitHub)         │     │   (Repo GitHub)          │    │   (Pagos)              │
│                         │     │                         │    │                         │
│ - Despliegue: Edge      │     │ - Despliegue: Vercel     │    │   API REST             │
│   Functions via         │     │   (Project Web)         │    │                         │
│   Supabase              │     │                         │    │                         │
│ - Conexión: Prisma ORM  │     │ - Comunicación: REST    │    │                         │
│   a Supabase DB         │     │   API a Edge Functions  │    │                         │
└─────────────────────────┘     └─────────────────────────┘    └─────────────────────────┘
```

### Flujo de la Arquitectura

1. **Frontend (Vercel):** El usuario accede a la aplicación web/móvil desde Project Web
2. **Comunicación:** El frontend hace peticiones REST a las Edge Functions de Supabase
3. **Edge Functions:** Contienen la lógica de negocio construída en Next.js
4. **Lógica de Negocio:** Las Edge Functions consultan/interactúan con:
   - **Auth** para autenticación (Google Login)
   - **Database** (PostgreSQL) para datos de empresas, trabajadores, ofertas
   - **Storage** para documentos (certificaciones, logos)
5. **Pagos:** Las Edge Functions se conectan a WebPay (Transbank) para procesar suscripciones

### Componentes Clave

| Componente | Descripción |
|------------|-------------|
| **Supabase Auth** | Manejo de login/registro con Google para empresas y trabajadores |
| **Supabase Database** | Almacena: usuarios, perfiles, ofertas, postulaciones, suscripciones |
| **Supabase Storage** | Almacena: logos empresas, documentos certificaciones |
| **Edge Functions** | Lógica de matching, búsqueda, notificaciones, pagos |
| **Prisma ORM** | Conexión tipada entre código y base de datos |
| **Next.js Backend** | Código desplegado en Edge Functions |
| **Next.js Frontend** | Interfaz desplegada en Vercel |
| **WebPay** | Procesamiento de pagos de suscripciones |

### Modelo de Datos Principal (Supabase)

```
empresas
├── id (uuid)
├── razon_social
├── rut
├── email (auth)
├── region
├── plan_suscripcion
└── fecha_suscripcion

trabajadores
├── id (uuid)
├── nombre_completo
├── rut
├── email (auth)
├── region
├── disponibilidad
├── movilizacion_propia
├── pretension_renta
└── certificaciones (json)

ofertas
├── id (uuid)
├── empresa_id
├── titulo
├── categoria
├── descripcion
├── ubicacion (region, comuna)
├── remuneration
├── tipo_contrato
├── requisitos (json)
└── estado (abierta/cerrada/candidatos)

postulaciones
├── id (uuid)
├── oferta_id
├── trabajador_id
├── score_match
├── estado (pendiente/aceptado/rechazado)
└── fecha_postulacion

suscripciones
├── id (uuid)
├── empresa_id
├── plan
├── fecha_inicio
├── fecha_fin
├── estado (activa/vencida/trial)
└── trial_activo (boolean)
```

---

## Lógica del Negocio

### Flujo Principal: Matching Empresa-Trabajador

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Empresa    │     │  Publica    │     │   Sistema   │     │  Trabajador │
│  crea oferta│────▶│   Oferta    │────▶│   Matching  │────▶│  Recibe     │
│             │     │             │     │   (IA)      │     │  Notificación│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
        │                                           │
        ▼                                           ▼
┌─────────────┐                             ┌─────────────┐
│  Empresa    │                             │  Trabajador │
│  Selecciona │◀────────────────────────────│  Postula    │
│  Candidato  │                             │             │
└─────────────┘                             └─────────────┘
```

### Proceso de Matching (Algoritmo)

El sistema ejecuta matching automático cada vez que:
1. Una empresa publica una nueva oferta
2. Un trabajador actualiza su perfil
3. Cron job cada 15 minutos (verifica nuevas ofertas sin matches)

**Paso 1: Filtrado Inicial (Exclusiones)**
```
- Misma región (obligatorio)
- Certificaciones obligatorias (todas las requeridas)
- Disponibilidad mínima compatible
```

**Paso 2: Cálculo de Score**
```
Score Total = (P_certificacion * 0.40) + (P_disponibilidad * 0.30) + (P_ubicacion * 0.20) + (P_renta * 0.10)

Donde:
- P_certificacion: 
  - 100% si tiene TODAS las certificaciones requeridas
  - 50% si tiene ALGUNA de las requeridas
  - 0% si no tiene ninguna
  
- P_disponibilidad:
  - 100% si disponibilidad coincide exactamente con horario oferta
  - 75% si coincide parcialmente (alguno de los días/horarios)
  - 25% si solo coincide un día
  
- P_ubicacion:
  - 100% misma comuna
  - 70% misma región, diferente comuna
  - 30% región vecina
  - 0% otra región
  
- P_renta:
  - 100% pretensión <= oferta presupuesto
  - 50% pretensión <= presupuesto + 20%
  - 0% pretensión > presupuesto + 20%
```

**Paso 3: Ranking y Notificación**
- Top 10 candidatos se presentan a la empresa
- Workers con score > 70% reciben notificación push

---

### Flujo de Suscripción y Pagos

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Empresa    │     │   Plan      │     │   WebPay    │     │  Sistema    │
│  Selecciona │────▶│  Selección  │────▶│  Pago (TBK) │────▶│  Activa     │
│  Plan       │     │  + Trial    │     │  o Transfer │     │  Suscripción│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Planes y Límites:**

| Plan | Publicaciones/Mes | Búsquedas Manuales | Workers en Match |
|------|-------------------|-------------------|------------------|
| Básico | 5 | 10 | Top 5 |
| Profesional | 20 | 50 | Top 10 |
| Enterprise | ∞ | ∞ | Top 20 |

**Lógica de Trial:**
- Al注册, toda empresa recibe 30 días de Profesional
- Al día 25:Email recordatorio
- Al día 30:Baja automática a Básico (si no paga)
- Si intenta publicar >5 ofertas durante trial: pedir upgrade

---

### Flujo de Postulación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Trabajador │     │   Sistema   │     │   Empresa   │     │  Sistema    │
│  Ve oferta  │────▶│  Confirma   │────▶│  Revisa y   │────▶│  Notifica   │
│  compatible │     │  Postulación│     │  Selecciona │     │  Resultado  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Estados de Postulación:**
- `pendiente` - Empresa no ha respondido
- `aceptado` - Empresa seleccionó al worker
- `rechazado` - Empresa no lo seleccionó

---

### Reglas de Negocio

| Regla | Descripción |
|-------|-------------|
| R1 | Empresa solo puede ver workers que cumplen requisitos mínimos |
| R2 | Worker solo ve ofertas compatibles con su perfil (score > 50%) |
| R3 | Una oferta puede tener máximo 50 postulaciones |
| R4 | Empresa tiene 7 días para responder postulación |
| R5 | Si oferta expira sin selección, se notifica a postulantes |
| R6 | Worker puede retractar postulación antes de aceptación |
| R7 | Certificación OS10 solo aplica a categoría "Guardia" |
| R8 | Certificación SEC solo aplica a categoría "Electricista" |

---

## Planificación del Backend

### Estructura del Proyecto (Next.js + Edge Functions)

```
workmatch-backend/
├── prisma/
│   ├── schema.prisma          # Definición de modelos de datos
│   └── migrations/            # Migraciones de DB
├── src/
│   ├── lib/
│   │   ├── prisma.ts          # Cliente Prisma singleton
│   │   ├── supabase.ts        # Cliente Supabase
│   │   └── auth.ts            # Funciones de autenticación
│   ├── services/
│   │   ├── matching.service.ts    # Lógica de matching (IA)
│   │   ├── oferta.service.ts      # CRUD ofertas
│   │   ├── empresa.service.ts     # CRUD empresas
│   │   ├── trabajador.service.ts  # CRUD trabajadores
│   │   ├── postulacion.service.ts # Gestión postulaciones
│   │   └── suscripcion.service.ts # Gestión planes y pagos
│   ├── edge/
│   │   ├── auth/
│   │   │   ├── sign-in.ts         # Login Google
│   │   │   ├── sign-up.ts         # Registro
│   │   │   └── sign-out.ts        # Logout
│   │   ├── ofertas/
│   │   │   ├── create.ts          # Crear oferta
│   │   │   ├── list.ts            # Listar ofertas (con filtros)
│   │   │   ├── get.ts             # Ver oferta específica
│   │   │   ├── update.ts          # Editar oferta
│   │   │   └── delete.ts          # Eliminar oferta
│   │   ├── matching/
│   │   │   ├── run.ts             # Ejecutar matching
│   │   │   └── get-matches.ts     # Obtener matches de oferta
│   │   ├── postulaciones/
│   │   │   ├── create.ts          # Postular
│   │   │   ├── list.ts           # Ver postulaciones
│   │   │   ├── accept.ts         # Aceptar worker
│   │   │   └── reject.ts         # Rechazar worker
│   │   └── workers/
│   │       ├── profile.ts        # Perfil worker
│   │       ├── search.ts         # Búsqueda manual
│   │       └── update.ts         # Actualizar perfil
│   ├── utils/
│   │   ├── scoring.ts            # Funciones de cálculo de score
│   │   ├── filters.ts            # Filtros de búsqueda
│   │   └── validation.ts        # Validaciones de datos
│   └── types/
│       └── index.ts              # Tipos y interfaces TS
├── supabase/
│   ├── functions/
│   │   └── .vscode/              # Config Edge Functions
│   └── config.toml               # Config Supabase
├── package.json
├── tsconfig.json
└── .env.example                  # Variables de entorno
```

### Schema de Prisma

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TipoUsuario {
  EMPRESA
  TRABAJADOR
}

enum TipoContrato {
  PLAZO_FIJO
  HONORARIOS
}

enum EstadoOferta {
  ABIERTA
  CERRADA
  CON_CANDIDATOS
  COMPLETADA
}

enum EstadoPostulacion {
  PENDIENTE
  ACEPTADO
  RECHAZADO
}

enum PlanSuscripcion {
  BASICO
  PROFESIONAL
  ENTERPRISE
  TRIAL
}

enum EstadoSuscripcion {
  ACTIVA
  VENCIDA
  CANCELADA
}

model Usuario {
  id            String    @id @default(uuid())
  email         String    @unique
  nombre        String?
  avatar_url    String?
  tipo          TipoUsuario
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  empresa       Empresa?
  trabajador    Trabajador?
}

model Empresa {
  id                  String    @id @default(uuid())
  usuario_id          String    @unique
  usuario             Usuario   @relation(fields: [usuario_id], references: [id])
  razon_social        String
  rut                 String    @unique
  giro                String?
  direccion           String
  telefono            String
  contacto_nombre     String
  region              String
  logo_url            String?
  plan                PlanSuscripcion @default(TRIAL)
  fecha_trial_fin     DateTime?
  publicaciones_usadas Int     @default(0)
  busquedas_usadas    Int      @default(0)
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  ofertas             Oferta[]
  suscripcion         Suscripcion?
}

model Trabajador {
  id                  String    @id @default(uuid())
  usuario_id          String    @unique
  usuario             Usuario   @relation(fields: [usuario_id], references: [id])
  nombre_completo     String
  rut                 String    @unique
  fecha_nacimiento    DateTime?
  telefono            String
  region              String
  comuna              String
  movilizacion_propia Boolean   @default(false)
  disponibilidad      Json      // { dias: [], horarios: [] }
  pretension_renta    Json      // { min, max, tipo }
  experiencia         Json      // [{ empresa, cargo, periodo, descripcion }]
  certificaciones     Json      // [{ nombre, fecha_emision, url_certificado }]
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  postulaciones       Postulacion[]
}

model Oferta {
  id              String      @id @default(uuid())
  empresa_id      String
  empresa         Empresa     @relation(fields: [empresa_id], references: [id])
  titulo          String
  categoria       String      // Guardia, Conserje, Temporero, etc.
  descripcion     String
  region          String
  comuna          String
  fecha_inicio    DateTime
  fecha_fin       DateTime?
  jornada         String      // parcial, full_time, horas
  horario         String?
  remuneration    Json        // { monto, forma_pago }
  tipo_contrato   TipoContrato
  requisitos      Json        // { certificaciones, experiencia_min, movilizacion }
  estado          EstadoOferta @default(ABIERTA)
  score_promedio  Float?
  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt
  
  postulaciones   Postulacion[]
}

model Postulacion {
  id              String              @id @default(uuid())
  oferta_id       String
  oferta          Oferta              @relation(fields: [oferta_id], references: [id])
  trabajador_id  String
  trabajador      Trabajador          @relation(fields: [trabajador_id], references: [id])
  score_match     Float
  mensaje         String?
  estado          EstadoPostulacion   @default(PENDIENTE)
  created_at      DateTime            @default(now())
  updated_at      DateTime            @updatedAt
  
  @@unique([oferta_id, trabajador_id])
}

model Suscripcion {
  id              String            @id @default(uuid())
  empresa_id      String            @unique
  empresa         Empresa           @relation(fields: [empresa_id], references: [id])
  plan            PlanSuscripcion
  fecha_inicio    DateTime
  fecha_fin       DateTime
  estado          EstadoSuscripcion @default(ACTIVA)
  transacciones   Transaccion[]
  created_at      DateTime          @default(now())
}

model Transaccion {
  id              String    @id @default(uuid())
  suscripcion_id  String
  suscripcion     Suscripcion @relation(fields: [suscripcion_id], references: [id])
  monto           Int
  metodo_pago     String    // webpay, transferencia
  estado          String    // pendiente, completada, fallida
  external_id     String?   // ID de WebPay
  created_at      DateTime  @default(now())
}
```

### API Endpoints (Edge Functions)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/sign-in` | Login con Google | Público |
| POST | `/auth/sign-up` | Registro usuario | Público |
| POST | `/auth/sign-out` | Logout | Requiere Auth |
| GET | `/auth/me` | Obtener usuario actual | Requiere Auth |
| POST | `/empresas` | Crear perfil empresa | Requiere Auth |
| GET | `/empresas/:id` | Ver perfil empresa | Requiere Auth |
| PUT | `/empresas/:id` | Actualizar perfil | Requiere Auth |
| POST | `/trabajadores` | Crear perfil worker | Requiere Auth |
| GET | `/trabajadores/:id` | Ver perfil worker | Requiere Auth |
| PUT | `/trabajadores/:id` | Actualizar perfil | Requiere Auth |
| GET | `/trabajadores/compatibles` | Ver workers compatibles | Requiere Auth |
| POST | `/ofertas` | Crear oferta | Requiere Auth (Empresa) |
| GET | `/ofertas` | Listar ofertas (filtros) | Requiere Auth |
| GET | `/ofertas/:id` | Ver oferta específica | Requiere Auth |
| PUT | `/ofertas/:id` | Actualizar oferta | Requiere Auth |
| DELETE | `/ofertas/:id` | Eliminar oferta | Requiere Auth |
| POST | `/ofertas/:id/matching` | Ejecutar matching | Sistema |
| GET | `/ofertas/:id/matches` | Ver matches de oferta | Requiere Auth |
| POST | `/postulaciones` | Postular a oferta | Requiere Auth (Worker) |
| GET | `/postulaciones` | Ver mis postulaciones | Requiere Auth |
| PUT | `/postulaciones/:id/accept` | Aceptar worker | Requiere Auth (Empresa) |
| PUT | `/postulaciones/:id/reject` | Rechazar worker | Requiere Auth (Empresa) |
| GET | `/suscripcion` | Ver suscripción actual | Requiere Auth |
| POST | `/suscripcion/upgrade` | Cambiar plan | Requiere Auth |
| POST | `/pagos/webpay/init` | Iniciar pago WebPay | Requiere Auth |
| POST | `/pagos/webpay/confirm` | Confirmar pago WebPay | WebPay Callback |
| POST | `/pagos/transferencia` | Registrar transferencia | Requiere Auth |

### Configuración de Edge Functions (supabase/functions/)

```typescript
// supabase/functions/<nombre-funcion>/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Obtener token del header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verificar usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Tu lógica aquí...
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

### Variables de Entorno (.env)

```env
# Supabase
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
SUPABASE_URL="https://[project].supabase.co"
SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"

# WebPay (Transbank)
WEBPAY Commerce Code=
WEBPAY API Key=
WEBPAY Environment=integration # sandbox
WEBPAY Callback URL=

# App
NEXT_PUBLIC_APP_URL="https://workmatch.cl"
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"

# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Planificación del Frontend

### Estructura del Proyecto (Next.js App Router)

```
workmatch-frontend/
├── public/
│   ├── images/                  # Imágenes estáticas
│   └── icons/                   # Iconos SVG
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── empresa/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── ofertas/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── nueva/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── candidatos/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── suscripcion/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── perfil/
│   │   │   │       └── page.tsx
│   │   │   ├── trabajador/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── ofertas/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── postulaciones/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── perfil/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── ajustes/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                  # Componentes base (Button, Input, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/              # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── forms/               # Formularios complejos
│   │   │   ├── OfertaForm.tsx
│   │   │   ├── PerfilEmpresaForm.tsx
│   │   │   ├── PerfilTrabajadorForm.tsx
│   │   │   └── SuscripcionForm.tsx
│   │   ├── cards/               # Tarjetas de contenido
│   │   │   ├── OfertaCard.tsx
│   │   │   ├── TrabajadorCard.tsx
│   │   │   ├── PostulacionCard.tsx
│   │   │   └── PlanCard.tsx
│   │   └── features/            # Componentes de-features
│   │       ├── MatchingBadge.tsx
│   │       ├── CertificacionTag.tsx
│   │       ├── DisponibilidadBadge.tsx
│   │       └── FilterPanel.tsx
│   ├── lib/
│   │   ├── supabase.ts          # Cliente Supabase
│   │   ├── auth.ts              # Funciones de auth
│   │   ├── api.ts               # Funciones API wrapper
│   │   └── utils.ts             # Utilidades generales
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useOfertas.ts
│   │   ├── usePostulaciones.ts
│   │   └── useMatch.ts
│   ├── store/                   # Estado global (Zustand)
│   │   ├── authStore.ts
│   │   ├── ofertasStore.ts
│   │   └── uiStore.ts
│   ├── types/                   # Tipos TypeScript
│   │   ├── index.ts
│   │   ├── empresa.ts
│   │   ├── trabajador.ts
│   │   ├── oferta.ts
│   │   └── postulacion.ts
│   └── styles/
│       └── globals.css          # Estilos globales (Tailwind)
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Rutas y Páginas

#### Rutas Públicas
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Landing Page | Página principal |
| `/login` | LoginPage | Login con Google |
| `/register` | RegisterPage | Registro (selección tipo usuario) |

#### Rutas Empresa (Dashboard)
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/empresa/dashboard` | DashboardEmpresa | Resumen: ofertas, postulaciones, suscripción |
| `/empresa/ofertas` | OfertasList | Lista de ofertas publicadas |
| `/empresa/ofertas/nueva` | NuevaOferta | Formulario crear oferta |
| `/empresa/ofertas/[id]` | DetalleOferta | Ver oferta y postulaciones |
| `/empresa/ofertas/[id]/editar` | EditarOferta | Editar oferta |
| `/empresa/candidatos` | CandidatosPage | Búsqueda manual de candidatos |
| `/empresa/suscripcion` | SuscripcionPage | Planes y payment |
| `/empresa/perfil` | PerfilEmpresa | Editar datos empresa |

#### Rutas Trabajador (Dashboard)
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/trabajador/dashboard` | DashboardTrabajador | Resumen: ofertas, postulaciones |
| `/trabajador/ofertas` | OfertasCompatibles | Lista de ofertas compatibles |
| `/trabajador/postulaciones` | MisPostulaciones | Estado de mis postulaciones |
| `/trabajador/perfil` | PerfilTrabajador | Editar perfil laboral |
| `/trabajador/ajustes` | AjustesWorker | Notificaciones, privacidad |

### Componentes UI Principales

#### Buttons
- `Button` - Variantes: primary, secondary, outline, ghost, danger
- `GoogleButton` - Botón específico para login Google

#### Forms
- `Input` - Text, number, email, password
- `Select` - Dropdown simple
- `MultiSelect` - Selección múltiple (certificaciones)
- `DatePicker` - Selección de fechas
- `TextArea` - Texto largo

#### Cards
- `OfertaCard` - Muestra oferta en lista
  - Props: oferta, scoreMatch?, onPostular?
- `TrabajadorCard` - Muestra worker en búsqueda
  - Props: trabajador, score, onSeleccionar?
- `PostulacionCard` - Muestra postulación
  - Props: postulacion, onAceptar?, onRechazar?

#### Feedback
- `Toast` - Notificaciones temporales (éxito/error/info)
- `Modal` - Ventanas modales
- `Spinner` - Loading states
- `EmptyState` - Sin contenido

### Flujo de Autenticación (Frontend)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Landing    │────▶│  Login/     │────▶│  Register   │
│  Page       │     │  Register   │     │  (Google)   │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                       ┌─────────────┐     ┌─────────────┐
                       │   Redirect  │◀────│  Supabase   │
                       │   al dash   │     │  Auth       │
                       └─────────────┘     └─────────────┘
```

### Gestión de Estado

**Zustand Store - authStore**
```typescript
interface AuthStore {
  user: User | null
  empresa: Empresa | null
  trabajador: Trabajador | null
  isLoading: boolean
  setUser: (user: User) => void
  setEmpresa: (empresa: Empresa) => void
  setTrabajador: (trabajador: Trabajador) => void
  logout: () => void
}
```

**Zustand Store - ofertasStore**
```typescript
interface OfertasStore {
  ofertas: Oferta[]
  filtros: FiltrosOferta
  isLoading: boolean
  setOfertas: (ofertas: Oferta[]) => void
  setFiltros: (filtros: FiltrosOferta) => void
  fetchOfertas: () => Promise<void>
}
```

### Integración con Backend

```typescript
// lib/api.ts - Wrapper para llamadas a Edge Functions

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = await getSession() // obtener token de sesión
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_ANON_KEY,
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Error en la solicitud')
  }
  
  return response.json()
}

// Ejemplo de uso
export const getOfertas = (filtros?: FiltrosOferta) => 
  fetchAPI('ofertas', { 
    method: 'GET',
    query: filtros 
  })

export const createOferta = (data: CreateOfertaDTO) => 
  fetchAPI('ofertas', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  })
```

### Estilos (Tailwind CSS)

```
// tailwind.config.ts
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',      // Primary brand color
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: '#64748b',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

## definition of Ready (DoR)

Una Historia de Usuario está lista para entrar a sprint cuando cumple:

### Criterios Obligatorios
- [ ] Tiene título claro y descripción (Como/Quiero/Para)
- [ ] Tiene criterios de aceptación claros y medibles
- [ ] Tiene estimación de puntos de historia asignada
- [ ] Tiene criterios de test definidos
- [ ] Está priorizada en el backlog
- [ ] No tiene dependencias sin resolver con otras HU

### Criterios Técnicos
- [ ] Tiene los wireframes/mockups definidos (si aplica)
- [ ] Tiene las user flows definidas (si aplica)
- [ ] Tiene las validaciones de negocio claras
- [ ] Tiene los casos de borde identificados

---

## Definition of Done (DoD)

Una Historia de Usuario se considera completada cuando:

### Criterios de Desarrollo
- [ ] Código desarrollado y revisado (peer review)
- [ ] Tests unitarios覆盖率 > 80%
- [ ] Código formateado y linting pasado
- [ ] Tipos TypeScript correctos

### Criterios de Calidad
- [ ] Tests de integración pasados
- [ ] QA manual completado
- [ ] Funcionalidad probada en entorno staging
- [ ] Sin bugs críticos o blockers

### Criterios de Despliegue
- [ ] Desplegado a entorno de staging
- [ ] Documentación actualizada
- [ ] Peer review aprobado

---

## definition of Ready (DoR)

Una Historia de Usuario está lista para entrar a sprint cuando cumple:

### Criterios Obligatorios
- [ ] Tiene título claro y descripción (Como/Quiero/Para)
- [ ] Tiene criterios de aceptación claros y medibles
- [ ] Tiene estimación de puntos de historia asignada
- [ ] Tiene criterios de test definidos
- [ ] Está priorizada en el backlog
- [ ] No tiene dependencias sin resolver con otras HU

### Criterios Técnicos
- [ ] Tiene los wireframes/mockups definidos (si aplica)
- [ ] Tiene las user flows definidas (si aplica)
- [ ] Tiene las validaciones de negocio claras
- [ ] Tiene los casos de borde identificados

---

## Definition of Done (DoD)

Una Historia de Usuario se considera completada cuando:

### Criterios de Desarrollo
- [ ] Código desarrollado y revisado (peer review)
- [ ] Tests unitarios覆盖率 > 80%
- [ ] Código formateado y linting pasado
- [ ] Tipos TypeScript correctos

### Criterios de Calidad
- [ ] Tests de integración pasados
- [ ] QA manual completado
- [ ] Funcionalidad probada en entorno staging
- [ ] Sin bugs críticos o blockers

### Criterios de Despliegue
- [ ] Desplegado a entorno de staging
- [ ] Documentación actualizada
- [ ] Peer review aprobado

---

## Definition of Done (DoD)

Una Historia de Usuario se considera completada cuando:

### Criterios de Desarrollo
- [ ] Código desarrollado y revisado (peer review)
- [ ] Tests unitarios覆盖率 > 80%
- [ ] Código formateado y linting pasado
- [ ] Tipos TypeScript correctos

### Criterios de Calidad
- [ ] Tests de integración pasados
- [ ] QA manual completado
- [ ] Funcionalidad probada en entorno staging
- [ ] Sin bugs críticos o blockers

### Criterios de Despliegue
- [ ] Desplegado a entorno de staging
- [ ] Documentación actualizada
- [ ] Peer review aprobado

---

## Definition of Done (DoD)

Una Historia de Usuario se considera completada cuando:

### Criterios de Desarrollo
- [ ] Código desarrollado y revisado (peer review)
- [ ] Tests unitarios覆盖率 > 80%
- [ ] Código formateado y linting pasado
- [ ] Tipos TypeScript correctos

### Criterios de Calidad
- [ ] Tests de integración pasados
- [ ] QA manual completado
- [ ] Funcionalidad probada en entorno staging
- [ ] Sin bugs críticos o blockers

### Criterios de Despliegue
- [ ] Desplegado a entorno de staging
- [ ] Documentación actualizada
- [ ] Peer review aprobado

---

## Definition of Done (DoD)

Una Historia de Usuario se considera completada cuando:

### Criterios de Desarrollo
- [ ] Código desarrollado y revisado (peer review)
- [ ] Tests unitarios覆盖率 > 80%
- [ ] Código formateado y linting pasado
- [ ] Tipos TypeScript correctos

### Criterios de Calidad
- [ ] Tests de integración pasados
- [ ] QA manual completado
- [ ] Funcionalidad probada en entorno staging
- [ ] Sin bugs críticos o blockers

### Criterios de Despliegue
- [ ] Desplegado a entorno de staging
- [ ] Documentación actualizada
- [ ] Peer review aprobado

---

## Definition of Done (DoD)

Una Historia de Usuario se considera completada cuando:

### Criterios de Desarrollo
- [ ] Código desarrollado y revisado (peer review)
- [ ] Tests unitarios覆盖率 > 80%
- [ ] Código formateado y linting pasado
- [ ] Tipos TypeScript correctos

### Criterios de Calidad
- [ ] Tests de integración pasados
- [ ] QA manual completado
- [ ] Funcionalidad probada en entorno staging
- [ ] Sin bugs críticos o blockers

### Criterios de Despliegue
- [ ] Desplegado a entorno de staging
- [ ] Documentación actualizada
- [ ] Peer review aprobado

---

## Definition of Done (DoD)

Una Historia de Usuario se considera completada cuando:

### Criterios de Desarrollo
- [ ] Código desarrollado y revisado (peer review)
- [ ] Tests unitarios覆盖率 > 80%
- [ ] Código formateado y linting pasado
- [ ] Tipos TypeScript correctos

### Criterios de Calidad
- [ ] Tests de integración pasados
- [ ] QA manual completado
- [ ] Funcionalidad probada en entorno staging
- [ ] Sin bugs críticos o blockers

### Criterios de Despliegue
- [ ] Desplegado a entorno de staging
- [ ] Documentación actualizada
- [ ] Peer review aprobado

---

### ÉPICA 1: AUTENTICACIÓN Y PERFILES

---

#### HU1.1 - Registro de Empresa con Google
**Como** empresa,
**Quiero** registrarme en la plataforma usando mi cuenta Google,
**Para** acceder rápidamente a la funcionalidad de publicación de trabajos.

**Criterios de Aceptación:**
- [ ] El usuario puede iniciar registro con botón "Registrarse con Google"
- [ ] El sistema captura email, nombre y foto de perfil de Google
- [ ] El usuario debe aceptar Términos y Condiciones para completar registro
- [ ] El sistema muestra mensaje de éxito y redirige al onboarding de empresa
- [ ] Si el email ya existe, el sistema permite iniciar sesión

**Criterios Técnicos:**
- Usar Supabase Auth con provider Google
- Manejar sesión con NextAuth.js o Supabase SSR
- Manejar errores: cuenta ya existente, login cancelado

---

#### HU1.2 - Registro de Trabajador con Google
**Como** trabajador,
**Quiero** registrarme en la plataforma usando mi cuenta Google,
**Para** crear mi perfil laboral y acceder a ofertas de trabajo.

**Criterios de Aceptación:**
- [ ] El usuario puede iniciar registro con botón "Registrarse con Google"
- [ ] El sistema captura email, nombre y foto de perfil de Google
- [ ] El usuario debe aceptar Términos y Condiciones
- [ ] El sistema muestra mensaje de éxito y redirige a completar perfil
- [ ] Si el email ya existe, el sistema permite iniciar sesión

---

#### HU1.3 - Completar Perfil de Empresa
**Como** empresa,
**Quiero** completar mi perfil empresarial,
**Para** poder publicar trabajos y gestionar mi cuenta.

**Criterios de Aceptación:**
- [ ] El usuario puede ingresar: razón social, RUT, dirección, teléfono, área de contacto
- [ ] El usuario puede seleccionar región de operación (RM, V, VI)
- [ ] El usuario puede subir logo de empresa
- [ ] Los campos obligatorios están marcados con *
- [ ] El sistema valida formato de RUT chileno
- [ ] El sistema permite guardar perfil incompleto y completarlo después

**Campos:**
- Razón Social (obligatorio)
- RUT empresa (obligatorio, formato XX.XXX.XXX-X)
- Giro (opcional)
- Dirección (obligatorio)
- Teléfono de contacto (obligatorio)
- Persona de contacto (obligatorio)
- Región (obligatorio, selector)
- Logo (opcional, imagen máx 2MB)

---

#### HU1.4 - Completar Perfil de Trabajador
**Como** trabajador,
**Quiero** completar mi perfil laboral,
**Para** que las empresas puedan considerarme para sus trabajos.

**Criterios de Aceptación:**
- [ ] El usuario puede ingresar datos personales: nombre completo, RUT, fecha nacimiento
- [ ] El usuario puede agregar experiencia laboral (empresa, cargo, período)
- [ ] El usuario puede especificar disponibilidad semanal (días y horarios)
- [ ] El usuario puede indicar si tiene movilización propia (sí/no)
- [ ] El usuario puede definir pretensión de renta (rango en pesos)
- [ ] El usuario puede cargar certificaciones (lista predefinida + otras)
- [ ] El sistema valida RUT chileno
- [ ] El sistema guarda automáticamente cada sección

**Campos:**
- Datos Personales:
  - Nombre completo (obligatorio)
  - RUT (obligatorio, formato Chile)
  - Fecha nacimiento (opcional)
  - Teléfono (obligatorio)
  - Comuna de residencia (obligatorio)
- Experiencia Laboral (puede agregar múltiples):
  - Empresa (texto)
  - Cargo (texto)
  - Período (fecha inicio - fin)
  - Descripción (textarea)
- Disponibilidad:
  - Días de la semana (checkbox)
  - Horario (mañana/tarde/noche/full time)
- Datos Adicionales:
  - Movilización propia (sí/no)
  - Pretensión de renta (selector rango: $0-$150k, $150k-$300k, $300k-$500k, $500k+)
- Certificaciones (selector múltiple):
  - OS10 (Guardias)
  - SEC (Electricistas)
  - others...

---

### ÉPICA 2: GESTIÓN DE OFERTAS (EMPRESAS)

---

#### HU2.1 - Crear Oferta de Trabajo
**Como** empresa,
**Quiero** publicar un trabajo con todos los detalles requeridos,
**Para** encontrar trabajadores que cumplan mis requisitos.

**Criterios de Aceptación:**
- [ ] El formulario incluye todos los campos obligatorios
- [ ] El usuario puede seleccionar tipo de trabajo (selector): Guardia, Conserje, Temporero, Aseo, Niñera, Carga/Descarga, Otro
- [ ] El usuario puede describir el trabajo (textarea)
- [ ] El usuario puede indicar fecha de inicio y término (o indefinido)
- [ ] El usuario puede especificar jornada: parcial, full time, por horas
- [ ] El usuario puede definir pago (monto y forma: hora/jornada/mes)
- [ ] El usuario puede seleccionar tipo contrato: plazo fijo / honorarios
- [ ] El usuario puede indicar ubicación (región + comuna)
- [ ] El usuario puede agregar requisitos obligatorios (certificaciones, experiencia)
- [ ] El sistema muestra vista previa antes de publicar
- [ ] El sistema guarda como borrador si no está lista para publicar

**Campos del Formulario:**
- Título del trabajo (obligatorio)
- Categoría (selector obligatorio)
- Descripción (textarea obligatorio)
- Ubicación:
  - Región (selector obligatorio)
  - Comuna (selector obligatorio)
- Fechas:
  - Fecha inicio (date obligatorio)
  - Fecha fin (date opcional, indicar "indefinido")
- Jornada:
  - Tipo (selector: parcial/full time/horas)
  - Horario específico (texto libre)
- Remuneración:
  - Monto (número obligatorio)
  - Forma de pago (selector: hora/jornada/mes)
- Tipo de contrato (selector: plazo fijo/honorarios)
- Requisitos:
  - Certificaciones requeridas (multi-selector)
  - Años de experiencia (número)
  - Movilización propia (sí/no)
  - Otros requisitos (texto)

---

#### HU2.2 - Ver Postulaciones Recibidas
**Como** empresa,
**Quiero** ver la lista de trabajadores que se postularon a mis ofertas,
**Para** evaluar y seleccionar candidatos.

**Criterios de Aceptación:**
- [ ] La empresa ve lista de postulaciones por cada oferta publicada
- [ ] Cada postulación muestra: nombre worker, certificación match, disponibilidad, pretensión renta
- [ ] La empresa puede filtrar por oferta
- [ ] La empresa puede ordenar por: fecha postulación, match score, pretensión renta
- [ ] Al hacer click, la empresa ve perfil completo del trabajador

---

#### HU2.3 - Aceptar o Rechazar Trabajador
**Como** empresa,
**Quiero** aceptar o rechazar a un trabajador que se postuló,
**Para** notificar al trabajador y avanzar en el proceso de contratación.

**Criterios de Aceptación:**
- [ ] La empresa puede aceptar un trabajador (botón)
- [ ] La empresa puede rechazar un trabajador (botón + motivo opcional)
- [ ] El sistema notifica al trabajador por push + email
- [ ] El trabajador ve el cambio en su historial de postulaciones
- [ ] La oferta se marca como "con candidato seleccionado" o se cierra

---

#### HU2.4 - Búsqueda Manual de Candidatos
**Como** empresa,
**Quiero** buscar manualmente trabajadores que cumplan requisitos mínimos,
**Para** encontrar candidatos cuando el matching automático no entregue resultados satisfactorios.

**Criterios de Aceptación:**
- [ ] La empresa puede buscar por: certificación, disponibilidad, región, pretensión renta
- [ ] El sistema muestra solo trabajadores que cumplen TODOS los filtros mínimos
- [ ] El resultado muestra: nombre, certificación, puntuación match, distancia
- [ ] La empresa puede ver perfil del trabajador
- [ ] La empresa puede enviar invitación directa a un trabajador

---

#### HU2.5 - Editar/Eliminar Oferta
**Como** empresa,
**Quiero** modificar o eliminar una oferta publicada,
**Para** mantener actualizadas mis publicaciones.

**Criterios de Aceptación:**
- [ ] La empresa puede editar cualquier campo de la oferta
- [ ] Si la oferta tiene postulaciones, el sistema avisa que editarla puede afectar matches
- [ ] La empresa puede eliminar la oferta (confirmación requerida)
- [ ] Al eliminar, se notifica a los postulantes

---

### ÉPICA 3: MATCHING Y NOTIFICACIONES

---

#### HU3.1 - Matching Automático (Core)
**Como** sistema,
**Quiero** ejecutar algoritmo de matching entre ofertas y trabajadores,
**Para** generar recomendaciones de candidatos a las empresas.

**Criterios de Aceptación:**
- [ ] El sistema ejecuta matching cuando se publica nueva oferta
- [ ] El matching considera: certificación (40%), disponibilidad (30%), ubicación (20%), pretensión renta (10%)
- [ ] El sistema genera un "score de compatibilidad" (0-100%)
- [ ] El sistema filtra: workers en misma región, que cumplan requisitos mínimos obligatorios
- [ ] El sistema muestra top 10 candidatos a la empresa
- [ ] El matching se ejecuta cada 15 minutos (cron job)

**Ponderación del Algoritmo:**
```
Score = (Certificación * 0.40) + (Disponibilidad * 0.30) + (Ubicación * 0.20) + (Renta * 0.10)

Donde:
- Certificación: 100% si tiene todas las requeridas, 0% si no tiene ninguna
- Disponibilidad: 100% si coincide exactamente, % parcial si coincide parcialmente
- Ubicación: 100% misma comuna, 70% misma región, 0% otra región
- Renta: 100% dentro del rango, % menor si está fuera
```

---

#### HU3.2 - Notificaciones al Trabajador
**Como** trabajador,
**Quiero** recibir notificaciones cuando haya un match con mi perfil,
**Para** saber que hay empleos disponibles para mí.

**Criterios de Aceptación:**
- [ ] El sistema envía push notification al worker cuando hay nuevo match
- [ ] La notificación incluye: nombre empresa, tipo trabajo, puntuación match
- [ ] Al hacer click en notificación, va directamente a la oferta
- [ ] El worker puede activar/desactivar notificaciones en settings

---

#### HU3.3 - Ver Ofertas Compatibles (Trabajador)
**Como** trabajador,
**Quiero** ver las ofertas de trabajo compatibles con mi perfil,
**Para** postular a las que me interesen.

**Criterios de Aceptación:**
- [ ] El worker ve lista de ofertas filtradas por su perfil
- [ ] Muestra: empresa, tipo trabajo, ubicación, pago, score de compatibilidad
- [ ] Puede ordenar por: más recientes, mayor score, mejor pago
- [ ] Puede quitar filtros para ver todas las ofertas (verificando que no califica)

---

#### HU3.4 - Postular a Oferta
**Como** trabajador,
**Quiero** postular a una oferta de trabajo,
**Para** ser considerado por la empresa.

**Criterios de Aceptación:**
- [ ] El worker puede postular con un click (botón "Postular")
- [ ] El sistema confirma postulación con toast
- [ ] El worker puede retractar postulación antes de que la empresa responda
- [ ] El worker ve sus postulaciones en "Mis Postulaciones"

---

### ÉPICA 4: SUSCRIPCIÓN Y PAGOS

---

#### HU4.1 - Planes de Suscripción
**Como** empresa,
**Quiero** elegir un plan de suscripción según mis necesidades,
**Para** acceder a la plataforma.

**Planes Sugeridos:**

| Plan | Precio | Publicaciones/Mes | Búsquedas Manuales | Soporte |
|------|--------|------------------|-------------------|---------|
| Básico | $50.000 | 5 | 10 | Email |
| Profesional | $120.000 | 20 | 50 | Email + Chat |
| Enterprise | $250.000 | Ilimitadas | Ilimitadas | Prioritario |

**Criterios de Aceptación:**
- [ ] La empresa ve los 3 planes con sus características
- [ ] La empresa puede seleccionar un plan
- [ ] El sistema muestra precio mensual
- [ ] El sistema indica "período de prueba 30 días gratis"

---

#### HU4.2 - Trial de 30 Días
**Como** empresa nueva,
**Quiero** probar la plataforma gratis por 30 días,
**Para** evaluar si me sirve antes de pagar.

**Criterios de Aceptación:**
- [ ] Al registrarse, la empresa tiene acceso automático a plan Profesional por 30 días
- [ ] El sistema muestra countdown de días restantes
- [ ] Al día 25, el sistema envía recordatorio por email
- [ ] Al día 30, el sistema permite seguir con plan gratuito (limitado) o付费

---

#### HU4.3 - Integración WebPay
**Como** empresa,
**Quiero** pagar con tarjeta de crédito/débito,
**Para** activar mi suscripción.

**Criterios de Aceptación:**
- [ ] El usuario puede seleccionar WebPay como medio de pago
- [ ] El sistema redirecciona a WebPay (Transbank)
- [ ] Al confirmar pago, el sistema activa suscripción
- [ ] El sistema guarda registro de transacción

---

#### HU4.4 - Integración Transferencia
**Como** empresa,
**Quiero** pagar por transferencia bancaria,
**Para** activar mi suscripción.

**Criterios de Aceptación:**
- [ ] El sistema muestra datos bancarios para transferencia
- [ ] El usuario debe subir comprobante de transferencia
- [ ] El admin valida manualmente el pago
- [ ] Al validar, se activa suscripción

---

### ÉPICA 5: LEGAL

---

#### HU5.1 - Términos y Condiciones
**Como** usuario,
**Quiero** leer y aceptar los términos y condiciones,
**Para** usar la plataforma.

**Criterios de Aceptación:**
- [ ] El registro requiere aceptar T&C (checkbox)
- [ ] Los T&C son accesibles desde footer
- [ ] Los T&C incluyen cláusula de responsabilidad

---

#### HU5.2 - Cláusula de Responsabilidad
**Como** plataforma,
**Quiero** dejar constancia de que no me hago responsable de problemas entre empresa y trabajador,
**Para** protegerme legalmente.

**Texto propuesto para T&C:**
> "Match&Go es una plataforma de conexión entre empresas y trabajadores. No interviene en la relación laboral, no garantiza el cumplimiento de las obligaciones de ninguna de las partes, y no se hace responsable por daños, incumplimientos o disputes que puedan surgir entre el trabajador y la empresa. La verificación de antecedentes, certificaciones y calidad del trabajo es responsabilidad exclusiva de la empresa contratante."

---

## Plan de Sprints - MVP (4 Meses)

**Supuestos:**
- Equipo: 3 desarrolladores (1 Frontend Web, 1 Frontend Mobile, 1 Fullstack/Backend)
- Duración sprint: 2 semanas
- Total sprints: 8

---

### Sprint 1 (Semanas 1-2): Fundamentos

**Objetivo:** Configurar infraestructura, auth básico, base de datos

| HU | Descripción | Estimación |
|----|-------------|------------|
| - | Setup proyecto (repo, gitflow, CI/CD base) | 16h |
| - | Configurar AWS/Cloud y DB PostgreSQL | 16h |
| - | Configurar Firebase Auth | 8h |
| HU1.1 | Registro/Login Google Empresa | 24h |
| HU1.2 | Registro/Login Google Trabajador | 24h |
| HU1.3 | Completar Perfil Empresa | 16h |

**Total:** 104h (equivalente a 2 sprints para 3 personas = 192h disponibles)

---

### Sprint 2 (Semanas 3-4): Perfiles y Datos

**Objetivo:** Completar perfiles, estructura de datos

| HU | Descripción | Estimación |
|----|-------------|------------|
| HU1.4 | Completar Perfil Trabajador | 40h |
| - | Diseño UI/UX perfiles y dashboard | 24h |
| - | Setup API REST con NestJS | 16h |
| - | Tests unitarios auth | 8h |

**Total:** 88h

---

### Sprint 3 (Semanas 5-6): Gestión de Ofertas

**Objetivo:** Crear y gestionar ofertas desde empresa

| HU | Descripción | Estimación |
|----|-------------|------------|
| HU2.1 | Crear Oferta de Trabajo | 40h |
| HU2.5 | Editar/Eliminar Oferta | 16h |
| HU2.2 | Ver Postulaciones | 24h |
| - | Dashboard empresa (básico) | 24h |

**Total:** 104h

---

### Sprint 4 (Semanas 7-8): Matching Core

**Objetivo:** Algoritmo de matching y worker app básica

| HU | Descripción | Estimación |
|----|-------------|------------|
| HU3.1 | Matching Automático | 48h |
| HU3.3 | Ver Ofertas Compatibles (Worker) | 32h |
| HU3.4 | Postular a Oferta | 24h |
| - | Setup Firebase Cloud Messaging | 16h |

**Total:** 120h

---

### Sprint 5 (Semanas 9-10): Notificaciones y UX

**Objetivo:** Notificaciones push, mejorar UX

| HU | Descripción | Estimación |
|----|-------------|------------|
| HU3.2 | Notificaciones al Trabajador | 24h |
| HU2.3 | Aceptar/Rechazar Trabajador | 32h |
| - | Mejora UI/UX - Web | 24h |
| - | Mejora UI/UX - App | 24h |

**Total:** 104h

---

### Sprint 6 (Semanas 11-12): Búsqueda y Planes

**Objetivo:** Búsqueda manual, planes de suscripción

| HU | Descripción | Estimación |
|----|-------------|------------|
| HU2.4 | Búsqueda Manual | 32h |
| HU4.1 | Planes de Suscripción (UI) | 24h |
| HU4.2 | Trial 30 días | 16h |
| - | Dashboard empresa (avanzado) | 24h |
| - | Dashboard worker | 16h |

**Total:** 112h

---

### Sprint 7 (Semanas 13-14): Pagos

**Objetivo:** Integrar WebPay y transferencia

| HU | Descripción | Estimación |
|----|-------------|------------|
| HU4.3 | Integración WebPay | 40h |
| HU4.4 | Integración Transferencia | 24h |
| - | Panel de suscripciones (admin) | 32h |
| - | Tests de integración | 16h |

**Total:** 112h

---

### Sprint 8 (Semanas 15-16): Legal y Cierre MVP

**Objetivo:** Legal, ajustes finales, despliegue

| HU | Descripción | Estimación |
|----|-------------|------------|
| HU5.1 | Términos y Condiciones | 8h |
| HU5.2 | Cláusula de Responsabilidad | 8h |
| - | Ajustes UI/UX finales | 32h |
| - | QA Testing completo | 40h |
| - | Despliegue a producción | 16h |
| - | Documentación técnica | 16h |

**Total:** 120h

---

## Resumen de capacidad vs demanda

| Sprint | Horas Estimadas | Horas Disponibles (3 personas) | Balance |
|--------|-----------------|--------------------------------|---------|
| S1 | 104 | 192 | ✓ |
| S2 | 88 | 192 | ✓ |
| S3 | 104 | 192 | ✓ |
| S4 | 120 | 192 | ✓ |
| S5 | 104 | 192 | ✓ |
| S6 | 112 | 192 | ✓ |
| S7 | 112 | 192 | ✓ |
| S8 | 120 | 192 | ✓ |

**Buffer:** ~560h de holgura para imprevistos y ajustes.

---

## Estimación de Presupuesto

### Parámetros del mercado chileno (2026):

| Rol | Rango mensual CLP | Nota |
|-----|-------------------|------|
| Junior Developer | $800.000 - $1.200.000 | 0-2 años experiencia |
| Mid Developer | $1.200.000 - $1.800.000 | 2-4 años experiencia |
| Senior Developer | $1.800.000 - $2.800.000 | 4+ años experiencia |

### Escenarios de presupuesto (MVP - 4 meses):

---

**ESCENARIO 1: Equipo Interno Completo (3 seniors)**
| Mes | Cantidad | Costo unitario | Total mes | Total 4 meses |
|-----|----------|----------------|-----------|---------------|
| Mes 1-4 | 3 | $2.500.000 | $7.500.000 | $30.000.000 |

---

**ESCENARIO 2: Equipo Interno Mixto (1 senior + 2 mid)**
| Mes | Cantidad | Costo unitario | Total mes | Total 4 meses |
|-----|----------|----------------|-----------|---------------|
| Mes 1-4 | 1 senior | $2.200.000 | $2.200.000 | |
| | 2 mid | $1.500.000 c/u | $3.000.000 | |
| **Total** | | | **$5.200.000** | **$20.800.000** |

---

**ESCENARIO 3: Producto Minimal (1 senior + 2 juniors)**
| Mes | Cantidad | Costo unitario | Total mes | Total 4 meses |
|-----|----------|----------------|-----------|---------------|
| Mes 1-4 | 1 senior | $2.000.000 | $2.000.000 | |
| | 2 juniors | $900.000 c/u | $1.800.000 | |
| **Total** | | | **$3.800.000** | **$15.200.000** |

---

### Costos adicionales (mensuales):

| Servicio | Costo mensual CLP |
|----------|-------------------|
| AWS/GCP (cloud) | $200.000 - $400.000 |
| Firebase (Auth, FCM) | $0 - $50.000 |
| Dominio y SSL | $30.000 |
| WebPay (Transbank) | Sin costo (comisión por transacción) |
| **Total cloud** | **$230.000 - $480.000/mes** |

---

### Resumen total MVP (4 meses):

| Escenario | Desarrollo | Cloud (4 meses) | **Total** |
|-----------|------------|-----------------|-----------|
| 1 (3 seniors) | $30.000.000 | $1.500.000 | **$31.500.000** |
| 2 (mixto) | $20.800.000 | $1.500.000 | **$22.300.000** |
| 3 (minimal) | $15.200.000 | $1.500.000 | **$16.700.000** |

---

### Estimación versión final (10 meses):

Multiplicando por factor 2.5 (margen por escalabilidad y features adicionales):

| Escenario | Estimación 10 meses |
|-----------|---------------------|
| 1 (3 seniors) | $78.000.000 - $85.000.000 |
| 2 (mixto) | $55.000.000 - $60.000.000 |
| 3 (minimal) | $40.000.000 - $45.000.000 |

---

## Recomendaciones

1. **Equipo mínimo viable:** 1 senior (tech lead) + 1 mid (fullstack) + 1 junior (frontend)
2. **Iniciar con escenario 2** ($22M) y ajustar según disponibilidad
3. **Considerar MVP con empresa externa** si el equipo interno no tiene experiencia en este stack
4. **Reservar 15%** del presupuesto para imprevistos

---

*Documento generado para validación con Product Owner*
*Versión: 1.0*
*Fecha: Marzo 2026*