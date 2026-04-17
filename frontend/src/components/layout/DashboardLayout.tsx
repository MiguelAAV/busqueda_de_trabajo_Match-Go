'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'empresa' | 'trabajador'
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
      }
    }
    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const empresaLinks = [
    { href: '/dashboard/empresa', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/empresa/ofertas', label: 'Mis Ofertas', icon: '📋' },
    { href: '/dashboard/empresa/ofertas/nueva', label: 'Nueva Oferta', icon: '➕' },
    { href: '/dashboard/empresa/candidatos', label: 'Candidatos', icon: '👥' },
    { href: '/dashboard/empresa/perfil', label: 'Mi Perfil', icon: '🏢' },
  ]

  const trabajadorLinks = [
    { href: '/dashboard/trabajador', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/trabajador/ofertas', label: 'Ofertas', icon: '💼' },
    { href: '/dashboard/trabajador/postulaciones', label: 'Postulaciones', icon: '📨' },
    { href: '/dashboard/trabajador/perfil', label: 'Mi Perfil', icon: '👷' },
  ]

  const links = role === 'empresa' ? empresaLinks : trabajadorLinks

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <Link href="/" className="text-2xl font-bold text-primary-500">
            Match&Go
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            {role === 'empresa' ? 'Panel Empresa' : 'Panel Trabajador'}
          </p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg w-full"
          >
            <span>🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white border-b p-4 md:hidden">
          <div className="flex justify-between items-center">
            <span className="font-bold text-primary-500">Match&Go</span>
            <button onClick={handleSignOut} className="text-gray-600">
              Salir
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}