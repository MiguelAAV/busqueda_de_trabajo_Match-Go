# Guía de Trabajo - Miguel Arredondo

## Sprint 1-2: Frontend UI (Diseño y Componentes)

### Requisitos Previos
1. Node.js 18+ instalado
2. Acceso al repo GitHub: `MiguelAAV/busqueda_de_trabajo_Match-Go`

---

## Semana 1: Setup y UI Base

### Día 1: Setup del Entorno
```bash
# 1. Clonar el repo
git clone https://github.com/MiguelAAV/busqueda_de_trabajo_Match-Go.git
cd busqueda_de_trabajo_Match-Go

# 2. Ir a branch de frontend
git checkout feature/frontend-ui

# 3. Instalar dependencias
cd frontend
npm install

# 4. Levantar proyecto
npm run dev
# Abrir http://localhost:3000
```

### Día 2-3:Mejorar Landing Page y Login
**Tareas:**
- [ ] Mejorar diseño de landing page (`src/app/page.tsx`)
- [ ] Mejorar página de login (`src/app/auth/login/page.tsx`)
- [ ] Agregar validación de formularios
- [ ] Mejorar página de registro (`src/app/auth/register/page.tsx`)

### Día 4-5: Dashboard Empresa
**Tareas:**
- [ ] Mejorar `src/app/dashboard/empresa/page.tsx`
- [ ] Crear página de nuevas ofertas
- [ ] Crear formulario de crear oferta
- [ ] Crear página de candidatos

---

## Semana 2: UI de worker y polish

### Día 6-8: Dashboard Trabajador
**Tareas:**
- [ ] Mejorar `src/app/dashboard/trabajador/page.tsx`
- [ ] Crear página de ofertas disponibles
- [ ] Crear página de postulaciones
- [ ] Crear perfil de trabajador

### Día 9-10: UI Components y Polish
**Tareas:**
- [ ] Mejorar componentes UI (`src/components/ui/index.tsx`)
- [ ] Agregar más componentes (Modal, Toast, etc.)
- [ ] Mejorar diseño responsive
- [ ] Testing de UI

---

## Comandos Útiles

```bash
# Levantar frontend
cd frontend
npm run dev

# Build para producción
npm run build

# Commit y push
git add .
git commit -m "feat: improved login UI"
git push origin feature/frontend-ui
```

---

## Estructura de Archivos

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing
│   │   ├── auth/
│   │   │   ├── login/page.tsx    # Login
│   │   │   └── register/page.tsx # Registro
│   │   └── dashboard/
│   │       ├── empresa/page.tsx   # Dashboard empresa
│   │       └── trabajador/page.tsx # Dashboard worker
│   ├── components/ui/             # Componentes reutilizables
│   └── lib/                      # Utilidades
├── tailwind.config.ts            # Configuración de estilos
└── package.json
```

---

## Recursos
- Tailwind CSS: https://tailwindcss.com/docs
- Docs Next.js: https://nextjs.org/docs
- Componentes existentes: `src/components/ui/index.tsx`