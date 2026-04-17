'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, Button, Spinner, Badge } from '@/components/ui'
import { mockOfertas } from '@/lib/mockData'

export default function OfertaDetallePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [oferta, setOferta] = useState<any>(null)
  const [postulado, setPostulado] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      const found = mockOfertas.find(o => o.id === params.id)
      setOferta(found || mockOfertas[0])
      setLoading(false)
    }, 300)
  }, [params.id])

  const handlePostular = () => {
    setPostulado(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!oferta) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Oferta no encontrada</h2>
        <Link href="/dashboard/trabajador/ofertas">
          <Button className="mt-4">Volver a ofertas</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <Link 
        href="/dashboard/trabajador/ofertas" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        ← Volver a ofertas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-3xl">
                🏢
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{oferta.titulo}</h1>
                <p className="text-gray-500">{oferta.categoria}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="success">Activa</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Descripción */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Descripción del Trabajo</h2>
            <p className="text-gray-700 leading-relaxed">
              {oferta.descripcion}
            </p>
          </Card>

          {/* Requisitos */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Requisitos</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-medium text-gray-900">Ubicación</p>
                  <p className="text-gray-500">{oferta.comuna}, {oferta.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">⏰</span>
                <div>
                  <p className="font-medium text-gray-900">Jornada</p>
                  <p className="text-gray-500">
                    {oferta.jornada === 'full_time' ? 'Full Time' : 
                     oferta.jornada === 'parcial' ? 'Parcial' : 'Por Horas'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <div>
                  <p className="font-medium text-gray-900">Tipo de Contrato</p>
                  <p className="text-gray-500">
                    {oferta.tipo_contrato === 'PLAZO_FIJO' ? 'Plazo Fijo' : 'Honorarios'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Salario */}
          <Card>
            <h3 className="text-sm text-gray-500 mb-1">Remuneración</h3>
            <p className="text-3xl font-bold text-green-600">
              ${oferta.remuneration?.monto?.toLocaleString()}
              <span className="text-base font-normal text-gray-500">/{oferta.remuneration?.forma_pago}</span>
            </p>
          </Card>

          {/* Acción */}
          {postulado ? (
            <Card className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-gray-900">¡Postulado!</h3>
              <p className="text-gray-500 mt-2">
                La empresa ha sido notificada de tu interés
              </p>
              <Link href="/dashboard/trabajador/postulaciones">
                <Button className="mt-4" variant="outline" fullWidth>
                  Ver Mis Postulaciones
                </Button>
              </Link>
            </Card>
          ) : (
            <Card>
              <Button fullWidth size="lg" onClick={handlePostular}>
                Postular a este Trabajo
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Se notificará a la empresa de tu interés
              </p>
            </Card>
          )}

          {/* Info */}
          <Card>
            <h3 className="font-semibold mb-3">Información</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <p>📅 Publicado: {new Date(oferta.created_at).toLocaleDateString('es-CL')}</p>
              <p>👁️ Vistas: {Math.floor(Math.random() * 100) + 50}</p>
              <p>📨 Postulaciones: {oferta._count?.postulaciones || 0}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}