# Guía de Trabajo - Nicolas Iturrieta

## Sprint 1-2: Auth + Perfiles + Frontend

### Requisitos Previos
1. Node.js 18+ instalado
2. Acceso a cuenta de Supabase
3. Acceso al repo GitHub: `MiguelAAV/busqueda_de_trabajo_Match-Go`

---

## Semana 1: Configuración y Auth

### Día 1: Setup del Entorno
```bash
# 1. Clonar el repo
git clone https://github.com/MiguelAAV/busqueda_de_trabajo_Match-Go.git
cd busqueda_de_trabajo_Match-Go

# 2. Installar dependencias del frontend
cd frontend
npm install

# 3. Crear archivo .env.local
cp .env.local.example .env.local
```

### Día 2-3: Integrar Auth API
```bash
# 1. Ir a la branch de trabajo
git checkout feature/auth-perfiles

# 2. Completar credenciales en .env.local
```

**Tareas técnicas:**
- [ ] Verificar que Auth sign-in/sign-up funcionan
- [ ] Proteger rutas de dashboard
- [ ] Testing de login con email/password y Google

### Día 4-5: Perfiles de Usuario
**Tareas técnicas:**
- [ ] Revisar Edge Functions de empresas
- [ ] Revisar Edge Functions de trabajadores
- [ ] Testing de CRUD de perfiles

---

## Semana 2: Matching y Ofertas

### Día 6-8: CRUD Ofertas
**Tareas:**
- [ ] Revisar Edge Functions de ofertas
- [ ] Testing CRUD completo de ofertas
- [ ] Integrar con UI del frontend

### Día 9-10: Matching Engine
**Tareas:**
- [ ] Revisar algoritmo de matching
- [ ] Testing de scoring
- [ ] UI de resultados

---

## Comandos Útiles

```bash
# Levantar frontend
cd frontend
npm run dev

# Commit y push
git add .
git commit -m "tu mensaje"
git push origin feature/auth-perfiles
```

---

## Endpoints a Testear

| Servicio | Endpoint | Método |
|----------|----------|--------|
| Auth | `/auth/sign-in` | POST |
| Auth | `/auth/sign-up` | POST |
| Ofertas | `/ofertas/list` | GET |
| Ofertas | `/ofertas/create` | POST |
| Matching | `/matching/run` | POST |
| Matching | `/matching/get-matches` | GET |

---

## Recursos
- Documentación: `MatchGo_Backlog_MVP.md`
- Backend Functions: `supabase/functions/`
- Schema DB: `prisma/schema.prisma`