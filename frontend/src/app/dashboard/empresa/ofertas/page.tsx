'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Button, Spinner, Badge } from '@/components/ui'
import { ofertaApi } from '@/lib/api'

export default function OfertasListPage() {
  const [loading, setLoading] = useState(true)
  const [ofertas, setOfertas] = useState<any[]>([])

  useEffect(() => {
    loadOfertas()
  }, [])

  const loadOfertas = async () => {
    try {
      const data = await ofertaApi.list()
      setOfertas(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Ofertas</h1>
          <p className="text-gray-600 mt-1">Gestiona todas tus ofertas publicadas</p>
        </div>
        <Link href="/dashboard/empresa/ofertas/nueva">
          <Button>+ Nueva Oferta</Button>
        </Link>
      </div>

      {ofertas.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes ofertas todavía
          </h3>
          <p className="text-gray-500 mb-6">
            Crea tu primera oferta para encontrar trabajadores
          </p>
          <Link href="/dashboard/empresa/ofertas/nueva">
            <Button>Crear Oferta</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ofertas.map((oferta) => {
            const badge = getEstadoBadge(oferta.estado)
            return (
              <Card key={oferta.id} className="hover:shadow-lg transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {oferta.titulo}
                      </h3>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <span>🏷️ {oferta.categoria}</span>
                      <span>📍 {oferta.region} • {oferta.comuna}</span>
                      <span>💰 ${oferta.remuneration?.monto?.toLocaleString()}/{oferta.remuneration?.forma_pago}</span>
                      <span>📅 {new Date(oferta.created_at).toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-primary-500 font-medium">
                      {oferta._count?.postulaciones || 0} postulaciones
                    </span>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/empresa/ofertas/${oferta.id}`}>
                        <Button size="sm" variant="outline">Ver</Button>
                      </Link>
                      <Button size="sm" variant="ghost">Editar</Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}