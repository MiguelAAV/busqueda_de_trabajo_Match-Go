'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Spinner, Badge, Input } from '@/components/ui'
import { trabajadorApi } from '@/lib/api'
import Link from 'next/link'

export default function CandidatosPage() {
  const [loading, setLoading] = useState(true)
  const [trabajadores, setTrabajadores] = useState<any[]>([])
  const [filtros, setFiltros] = useState({
    region: '',
    certificacion: '',
    disponibilidad: '',
  })

  useEffect(() => {
    loadTrabajadores()
  }, [])

  const loadTrabajadores = async () => {
    try {
      const data = await trabajadorApi.search(filtros)
      setTrabajadores(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const buscar = () => {
    setLoading(true)
    loadTrabajadores()
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
        <h1 className="text-3xl font-bold text-gray-900">Buscar Candidatos</h1>
        <p className="text-gray-600 mt-1">Explora trabajadores disponibles y encuéntralos</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Región"
            name="region"
            options={[
              { value: '', label: 'Todas' },
              { value: 'RM', label: 'Región Metropolitana' },
              { value: 'V', label: 'Valparaíso' },
            ]}
            value={filtros.region}
            onChange={handleFilterChange}
          />
          <Select
            label="Certificación"
            name="certificacion"
            options={[
              { value: '', label: 'Todas' },
              { value: 'OS10', label: 'OS10 (Guardia)' },
              { value: 'SEC', label: 'SEC (Electricista)' },
            ]}
            value={filtros.certificacion}
            onChange={handleFilterChange}
          />
          <Select
            label="Disponibilidad"
            name="disponibilidad"
            options={[
              { value: '', label: 'Cualquiera' },
              { value: 'full_time', label: 'Full Time' },
              { value: 'parcial', label: 'Parcial' },
            ]}
            value={filtros.disponibilidad}
            onChange={handleFilterChange}
          />
          <div className="flex items-end">
            <Button onClick={buscar} fullWidth>
              🔍 Buscar
            </Button>
          </div>
        </div>
      </Card>

      {/* Resultados */}
      <div className="mb-4 text-gray-500">
        {trabajadores.length} candidatos encontrados
      </div>

      {trabajadores.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron candidatos
          </h3>
          <p className="text-gray-500">
            Intenta con otros filtros de búsqueda
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {trabajadores.map((trabajador) => (
            <Card key={trabajador.id} className="hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                      👷
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {trabajador.nombre_completo}
                      </h3>
                      <p className="text-sm text-gray-500">
                        📍 {trabajador.region} • {trabajador.comuna}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {trabajador.certificaciones?.map((cert: string, i: number) => (
                      <Badge key={i} variant="info">{cert}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>💰 Pretensión: ${trabajador.pretension_renta?.min?.toLocaleString()} - ${trabajador.pretension_renta?.max?.toLocaleString()}</span>
                    <span>🚗 Movilización: {trabajador.movilizacion_propia ? 'Sí' : 'No'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button size="sm">Ver Perfil</Button>
                  <Button size="sm" variant="outline">Invitar</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}