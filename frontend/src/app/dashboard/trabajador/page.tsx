'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, Button, Spinner } from '@/components/ui'
import { db, isSupabaseConfigured } from '@/lib/supabase'

export default function DashboardTrabajador() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ofertas, setOfertas] = useState<any[]>([])
  const [trabajador, setTrabajador] = useState<any>(null)
  const [stats, setStats] = useState({ disponibles: 0, postuladas: 0, aceptadas: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      if (isSupabaseConfigured) {
        const data = await db.getOfertas({ estado: 'ABIERTA' })
        setOfertas(data?.slice(0, 5) || [])
        
        // Obtener datos del trabajador
        const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase?.auth.getUser())
        if (user) {
          const trabajadorData = await db.getPerfilTrabajador(user.id)
          setTrabajador(trabajadorData)
        }
        
        setStats({
          disponibles: data?.length || 0,
          postuladas: 0,
          aceptadas: 0,
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
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido{trabajador?.nombre_completo ? `, ${trabajador.nombre_completo}` : ''}</h1>
        <p className="text-gray-600 mt-1">Encuentra trabajos temporales que matchean contigo</p>
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
              <p className="text-gray-500 text-sm">Ofertas Disponibles</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{stats.disponibles}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">💼</div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Postuladas</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{stats.postuladas}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl">📨</div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Aceptadas</p>
              <p className="text-4xl font-bold text-primary-600 mt-2">{stats.aceptadas}</p>
            </div>
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-2xl">✅</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/trabajador/ofertas">
          <Card className="cursor-pointer hover:border-primary-500 border-2 border-transparent transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl">🔍</div>
              <div>
                <h3 className="font-semibold text-gray-900">Buscar Ofertas</h3>
                <p className="text-sm text-gray-500">Explora trabajos disponibles</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/dashboard/trabajador/postulaciones">
          <Card className="cursor-pointer hover:border-primary-500 border-2 border-transparent transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">📋</div>
              <div>
                <h3 className="font-semibold text-gray-900">Mis Postulaciones</h3>
                <p className="text-sm text-gray-500">Ver estado de tus postulaciones</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/dashboard/trabajador/perfil">
          <Card className="cursor-pointer hover:border-primary-500 border-2 border-transparent transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">👷</div>
              <div>
                <h3 className="font-semibold text-gray-900">Mi Perfil</h3>
                <p className="text-sm text-gray-500">Editar datos personales</p>
              </div>
            </div>
          </Card>
        </Link>
        <button onClick={handleSignOut} className="cursor-pointer text-left">
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
          <h2 className="text-xl font-bold text-gray-900">Ofertas Recientes</h2>
          <Link href="/dashboard/trabajador/ofertas">
            <Button variant="ghost" size="sm">Ver todas →</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {ofertas.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay ofertas disponibles</h3>
            </Card>
          ) : (
            ofertas.map((oferta) => (
              <Link key={oferta.id} href={`/dashboard/trabajador/ofertas/${oferta.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-lg">🏢</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{oferta.titulo}</h3>
                          <p className="text-sm text-gray-500">{oferta.categoria} • {oferta.comuna}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>💰 ${oferta.remuneration?.monto?.toLocaleString()}/{oferta.remuneration?.forma_pago}</span>
                        <span>📅 {new Date(oferta.created_at).toLocaleDateString('es-CL')}</span>
                      </div>
                    </div>
                    <Button size="sm">Ver</Button>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}