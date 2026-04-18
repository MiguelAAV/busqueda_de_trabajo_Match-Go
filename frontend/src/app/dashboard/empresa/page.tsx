'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, Button, Spinner, Badge } from '@/components/ui'
import { db, isSupabaseConfigured } from '@/lib/supabase'

export default function DashboardEmpresa() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ofertas, setOfertas] = useState<any[]>([])
  const [empresa, setEmpresa] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, activas: 0, postulaciones: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      if (isSupabaseConfigured) {
        const data = await db.getOfertas()
        setOfertas(data?.slice(0, 5) || [])
        
        // Obtener datos de empresa
        const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase?.auth.getUser())
        if (user) {
          const empresaData = await db.getPerfilEmpresa(user.id)
          setEmpresa(empresaData)
        }
        
        setStats({
          total: data?.length || 0,
          activas: data?.filter((o: any) => o.estado === 'ABIERTA').length || 0,
          postulaciones: 0,
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase')
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/auth/login')
  }

  const getEstadoBadge = (estado: string) => {
    const config: Record<string, { variant: 'success' | 'error' | 'warning' | 'default'; label: string }> = {
      ABIERTA: { variant: 'success', label: 'Activa' },
      CERRADA: { variant: 'error', label: 'Cerrada' },
      CON_CANDIDATOS: { variant: 'warning', label: 'Con Candidatos' },
      COMPLETADA: { variant: 'default', label: 'Completada' },
    }
    return config[estado] || { variant: 'default', label: estado }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido{empresa?.razon_social ? `, ${empresa.razon_social}` : ''}</h1>
        <p className="text-gray-600 mt-1">Gestiona tus ofertas y encuentra trabajadores</p>
        {!isSupabaseConfigured && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            ⚠️ Modo Demo
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Ofertas</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl">📋</div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Ofertas Activas</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{stats.activas}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">✅</div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Postulaciones</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">{stats.postulaciones}</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-2xl">👥</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/empresa/ofertas/nueva">
          <Card className="cursor-pointer hover:border-primary-500 border-2 border-transparent transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-xl">➕</div>
              <div>
                <h3 className="font-semibold text-gray-900">Publicar Nueva Oferta</h3>
                <p className="text-sm text-gray-500">Encuentra trabajadores temporales</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/dashboard/empresa/candidatos">
          <Card className="cursor-pointer hover:border-primary-500 border-2 border-transparent transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">🔍</div>
              <div>
                <h3 className="font-semibold text-gray-900">Buscar Candidatos</h3>
                <p className="text-sm text-gray-500">Explora trabajadores disponibles</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/dashboard/empresa/perfil">
          <Card className="cursor-pointer hover:border-primary-500 border-2 border-transparent transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl">🏢</div>
              <div>
                <h3 className="font-semibold text-gray-900">Mi Perfil</h3>
                <p className="text-sm text-gray-500">Editar datos de empresa</p>
              </div>
            </div>
          </Card>
        </Link>
        <button onClick={handleSignOut} className="cursor-pointer">
          <Card className="hover:border-red-500 border-2 border-transparent transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-xl">🚪</div>
              <div>
                <h3 className="font-semibold text-gray-900">Cerrar Sesión</h3>
                <p className="text-sm text-gray-500">Salir de la cuenta</p>
              </div>
            </div>
          </Card>
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Mis Ofertas Recientes</h2>
          <Link href="/dashboard/empresa/ofertas">
            <Button variant="ghost" size="sm">Ver todas →</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {ofertas.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes ofertas publicadas</h3>
              <Link href="/dashboard/empresa/ofertas/nueva">
                <Button>Crear Primera Oferta</Button>
              </Link>
            </Card>
          ) : (
            ofertas.map((oferta) => {
              const badge = getEstadoBadge(oferta.estado)
              return (
                <Link key={oferta.id} href={`/dashboard/empresa/ofertas/${oferta.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{oferta.titulo}</h3>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>🏷️ {oferta.categoria}</span>
                          <span>📍 {oferta.region}</span>
                          <span>💰 ${oferta.remuneration?.monto?.toLocaleString()}/{oferta.remuneration?.forma_pago}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}