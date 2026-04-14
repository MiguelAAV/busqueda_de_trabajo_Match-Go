'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, Button, Spinner } from '@/components/ui'
import { ofertaApi } from '@/lib/api'

export default function DashboardTrabajador() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ofertas, setOfertas] = useState<any[]>([])
  const [stats, setStats] = useState({ disponibles: 0, postuladas: 0, aceptadas: 0 })

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      try {
        const data = await ofertaApi.list()
        setOfertas(data?.slice(0, 10) || [])
        setStats({
          disponibles: data?.filter((o: any) => o.estado === 'ABIERTA').length || 0,
          postuladas: 0,
          aceptadas: 0,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary-600">Match&Go</h1>
          <nav className="flex gap-4 items-center">
            <Link href="/dashboard/trabajador/ofertas" className="text-gray-600 hover:text-primary-500">
              Ofertas
            </Link>
            <Link href="/dashboard/trabajador/postulaciones" className="text-gray-600 hover:text-primary-500">
              Mis Postulaciones
            </Link>
            <Link href="/dashboard/trabajador/perfil" className="text-gray-600 hover:text-primary-500">
              Mi Perfil
            </Link>
            <button onClick={handleSignOut} className="text-gray-600 hover:text-red-500">
              Cerrar Sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-gray-500 text-sm">Ofertas Disponibles</h3>
            <p className="text-3xl font-bold text-green-600">{stats.disponibles}</p>
          </Card>
          <Card>
            <h3 className="text-gray-500 text-sm">Postuladas</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.postuladas}</p>
          </Card>
          <Card>
            <h3 className="text-gray-500 text-sm">Aceptadas</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.aceptadas}</p>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ofertas Recientes</h2>
          <Link href="/dashboard/trabajador/ofertas">
            <Button variant="outline">Ver Todas</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {ofertas.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-500">No hay ofertas disponibles en este momento</p>
            </Card>
          ) : (
            ofertas.map((oferta) => (
              <Card key={oferta.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{oferta.titulo}</h3>
                    <p className="text-gray-500">{oferta.categoria} • {oferta.region}</p>
                    <p className="text-primary-600 font-medium">
                      ${oferta.remuneration?.monto?.toLocaleString()} / {oferta.remuneration?.forma_pago}
                    </p>
                  </div>
                  <Link href={`/dashboard/trabajador/ofertas/${oferta.id}`}>
                    <Button>Ver Detalle</Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}