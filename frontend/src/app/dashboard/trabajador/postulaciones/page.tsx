'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Spinner, Badge } from '@/components/ui'
import { mockPostulaciones, mockOfertas } from '@/lib/mockData'

export default function PostulacionesPage() {
  const [loading, setLoading] = useState(true)
  const [postulaciones, setPostulaciones] = useState<any[]>([])

  useEffect(() => {
    setTimeout(() => {
      // Enriquecer postulaciones con datos de ofertas
      const enriched = mockPostulaciones.map(p => ({
        ...p,
        oferta: mockOfertas.find(o => o.id === p.oferta_id)
      }))
      setPostulaciones(enriched)
      setLoading(false)
    }, 300)
  }, [])

  const getEstadoBadge = (estado: string) => {
    const config: Record<string, { variant: 'success' | 'error' | 'warning' | 'default'; label: string }> = {
      PENDIENTE: { variant: 'warning', label: 'Pendiente' },
      ACEPTADO: { variant: 'success', label: 'Aceptado' },
      RECHAZADO: { variant: 'error', label: 'Rechazado' },
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Postulaciones</h1>
        <p className="text-gray-600 mt-1">Sigue el estado de tus postulaciones</p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
          ⚠️ Modo Demo
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-3xl font-bold text-gray-900">{postulaciones.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">
            {postulaciones.filter(p => p.estado === 'PENDIENTE').length}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Aceptadas</p>
          <p className="text-3xl font-bold text-green-600">
            {postulaciones.filter(p => p.estado === 'ACEPTADO').length}
          </p>
        </Card>
      </div>

      {/* Lista */}
      {postulaciones.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes postulaciones
          </h3>
          <p className="text-gray-500 mb-6">
            Explora las ofertas disponibles y postula a las que te interesen
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {postulaciones.map((postulacion) => {
            const badge = getEstadoBadge(postulacion.estado)
            return (
              <Card key={postulacion.id} className="hover:shadow-lg transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-xl">
                        🏢
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {postulacion.oferta?.titulo || 'Oferta'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {postulacion.oferta?.categoria} • {postulacion.oferta?.region}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                      <span>📅 Postulado: {new Date(postulacion.created_at).toLocaleDateString('es-CL')}</span>
                      <span>🎯 Score: {postulacion.score_match}%</span>
                    </div>
                    
                    {postulacion.mensaje && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Mensaje:</strong> {postulacion.mensaje}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <Button size="sm" variant="ghost">Ver Oferta</Button>
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