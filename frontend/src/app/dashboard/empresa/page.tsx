'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, Button, Spinner } from '@/components/ui'
import { ofertaApi } from '@/lib/api'

export default function DashboardEmpresa() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ofertas, setOfertas] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, activas: 0, postulaciones: 0 })

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      try {
        const data = await ofertaApi.list()
        setOfertas(data?.slice(0, 5) || [])
        setStats({
          total: data?.length || 0,
          activas: data?.filter((o: any) => o.estado === 'ABIERTA').length || 0,
          postulaciones: 0,
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
            <Link href="/dashboard/empresa/ofertas" className="text-gray-600 hover:text-primary-500">
              Mis Ofertas
            </Link>
            <Link href="/dashboard/empresa/perfil" className="text-gray-600 hover:text-primary-500">
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
            <h3 className="text-gray-500 text-sm">Total Ofertas</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </Card>
          <Card>
            <h3 className="text-gray-500 text-sm">Ofertas Activas</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activas}</p>
          </Card>
          <Card>
            <h3 className="text-gray-500 text-sm">Postulaciones</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.postulaciones}</p>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mis Ofertas Recientes</h2>
          <Link href="/dashboard/empresa/ofertas/nueva">
            <Button>+ Nueva Oferta</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {ofertas.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-500 mb-4">No tienes ofertas publicadas</p>
              <Link href="/dashboard/empresa/ofertas/nueva">
                <Button variant="outline">Crear tu primera oferta</Button>
              </Link>
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
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    oferta.estado === 'ABIERTA' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {oferta.estado}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}