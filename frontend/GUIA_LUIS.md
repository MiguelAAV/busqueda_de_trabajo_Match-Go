# Guía de Trabajo - Luis Tasso

## Sprint 1-2: Auth + Perfiles + Frontend

### Requisitos Previos
1. Node.js 18+ instalado
2. Acceso a cuenta de Supabase (project URL, anon key, service role key)
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

# 3. Crear archivo .env.local con credenciales de Supabase
# Copiar de .env.local.example y completar
cp .env.local.example .env.local
```

### Día 2-3: Integrar Auth API
```bash
# 1. Ir a la branch de trabajo
git checkout feature/auth-perfiles

# 2. Editar src/lib/supabase.ts con tus credenciales
# NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

**Tareas técnicas:**
- [ ] Verificar que Auth sign-in/sign-up funcionan
- [ ] Integrar Google OAuth en frontend
- [ ] Proteger rutas de dashboard

### Día 4-5: Perfiles de Usuario
**Tareas técnicas:**
- [ ] Crear formulario de perfil empresa
- [ ] Crear formulario de perfil trabajador
- [ ] Guardar datos en Supabase vía Edge Functions

---

## Semana 2: Matching y Ofertas

### Día 6-8: CRUD Ofertas
**Tareas:**
- [ ] Crear página de listar ofertas
- [ ] Crear formulario de nueva oferta
- [ ] Conectar con Edge Functions de ofertas

### Día 9-10: Matching UI
**Tareas:**
- [ ] Crear UI de tarjetas swipe para workers
- [ ] Implementar aceptar/rechazar trabajadores
- [ ] Mostrar score de matching

---

## Comandos Útiles

```bash
# Levantar frontend en desarrollo
cd frontend
npm run dev

# Ver estado de cambios
git status

# Hacer commit de cambios
git add .
git commit -m "tu mensaje"

# Subir cambios a GitHub
git push origin feature/auth-perfiles

# Traer últimos cambios
git pull origin dev
```

---

## Endpoints de API a Usar

| Servicio | Endpoint | Método |
|----------|----------|--------|
| Auth | `/auth/sign-in` | POST |
| Auth | `/auth/sign-up` | POST |
| Empresa | `/empresas/get` | GET |
| Empresa | `/empresas/create` | POST |
| Trabajador | `/trabajadores/get` | GET |
| Trabajador | `/trabajadores/create` | POST |
| Ofertas | `/ofertas/list` | GET |
| Ofertas | `/ofertas/create` | POST |
| Matching | `/matching/run` | POST |

---

## Dónde Pedir Ayuda
- Documentación: `MatchGo_Backlog_MVP.md`
- Arquitectura: `MatchGo_Informe_Tecnico_Arquitectura.md`
- Edge Functions: `supabase/functions/`