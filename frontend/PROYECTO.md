# Match&Go - Guía del Proyecto

## Información General

**Repo:** https://github.com/MiguelAAV/busqueda_de_trabajo_Match-Go  
**Stack:** Next.js + Supabase (Edge Functions) + Prisma + Tailwind CSS  
**Equipo:** Luis Tasso, Nicolas Iturrieta, Miguel Arredondo

---

## Estructura del Proyecto

```
busqueda_de_trabajo_Match-Go/
├── frontend/                 # Frontend Next.js (¡aquí trabajan!)
│   ├── src/
│   │   ├── app/            # Páginas (App Router)
│   │   ├── components/    # Componentes UI
│   │   ├── lib/           # API y Supabase client
│   │   └── types/         # Tipos TypeScript
│   ├── GUIA_LUIS.md       # Guía de Luis
│   ├── GUIA_NICOLAS.md    # Guía de Nicolas
│   └── GUIA_MIGUEL.md     # Guía de Miguel
│
├── supabase/               # Edge Functions (Backend existente)
│   └── functions/
│       ├── auth/          # ✓ Listo
│       ├── empresas/       # ✓ Listo
│       ├── trabajadores/  # ✓ Listo
│       ├── ofertas/       # ✓ Listo
│       ├── matching/      # ✓ Listo
│       └── postulaciones/# ✓ Listo
│
├── prisma/
│   └── schema.prisma     # Schema de Base de Datos
│
├── MatchGo_Backlog_MVP.md           # Documentación funcional
└── MatchGo_Informe_Tecnico_Arquitectura.md  # Documentación técnica
```

---

## Branches

| Branch | Para quién |
|--------|-----------|
| main | Producción (protegida) |
| dev | Desarrollo |
| qa | Testing |
| feature/auth-perfiles | Luis + Nicolas |
| feature/ofertas-matching | Luis + Nicolas |
| feature/postulaciones-chat | Luis + Nicolas |
| feature/frontend-ui | Miguel |

---

## Cómo Empezar

### 1. Clonar el repo
```bash
git clone https://github.com/MiguelAAV/busqueda_de_trabajo_Match-Go.git
cd busqueda_de_trabajo_Match-Go
```

### 2. Instalar frontend
```bash
cd frontend
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.local.example .env.local
# Editar con tus credenciales de Supabase
```

### 4. Levantar proyecto
```bash
npm run dev
# Abrir http://localhost:3000
```

---

## Credenciales de Supabase (pedir a Luis)

Necesitas:
- `NEXT_PUBLIC_SUPABASE_URL` - URL del proyecto
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave pública

---

## Timeline (4 Semanas)

| Semana | Luis + Nicolas | Miguel |
|--------|---------------|--------|
| 1 | Setup + Auth + Perfiles | UI base (Login, Register) |
| 2 | Matching + Ofertas CRUD | Dashboards + Componentes |
| 3 | Testing + Fixes | UI Perfiles + Postulaciones |
| 4 | Testing + Documentación | Polish + Testing |

---

## Endpoints de API

| Servicio | Endpoint |
|----------|----------|
| Auth | `/auth/sign-in`, `/auth/sign-up` |
| Empresas | `/empresas/*` |
| Trabajadores | `/trabajadores/*` |
| Ofertas | `/ofertas/*` |
| Matching | `/matching/*` |
| Postulaciones | `/postulaciones/*` |

---

## Contacto

- **Luis Tasso** (GitHub: LTassoD) - Backend + Matching
- **Nicolas Iturrieta** (GitHub: Nicolasiturrieta) - Backend + Testing
- **Miguel Arredondo** (GitHub: MiguelAAV) - Frontend + UI