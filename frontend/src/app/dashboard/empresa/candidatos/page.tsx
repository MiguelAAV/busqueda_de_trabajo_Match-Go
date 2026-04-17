'use client'

import { useState } from 'react'
import { Card, Button, Badge } from '@/components/ui'
import { mockTrabajadores } from '@/lib/mockData'

export default function CandidatosPage() {
  const [loading, setLoading] = useState(false)
  const [trabajadores, setTrabajadores] = useState(mockTrabajadores)
  const [filtros, setFiltros] = useState({
    region: '',
    certificacion: '',
    disponibilidad: '',
  })

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const buscar = () => {
    setLoading(true)
    // Simular filtrado
    setTimeout(() => {
      let filtered = [...mockTrabajadores]
      
      if (filtros.region) {
        filtered = filtered.filter(t => t.region === filtros.region)
      }
      if (filtros.certificacion) {
        filtered = filtered.filter(t => t.certificaciones?.includes(filtros.certificacion))
      }
      
      setTrabajadores(filtered)
      setLoading(false)
    }, 300)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buscar Candidatos</h1>
        <p className="text-gray-600 mt-1">Explora trabajadores disponibles y encuéntralos</p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
          ⚠️ Modo Demo - Datos de ejemplo
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
            <select
              name="region"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filtros.region}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="RM">Región Metropolitana</option>
              <option value="V">Valparaíso</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificación</label>
            <select
              name="certificacion"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filtros.certificacion}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="OS10">OS10 (Guardia)</option>
              <option value="SEC">SEC (Electricista)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
            <select
              name="disponibilidad"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filtros.disponibilidad}
              onChange={handleFilterChange}
            >
              <option value="">Cualquiera</option>
              <option value="full_time">Full Time</option>
              <option value="parcial">Parcial</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={buscar} fullWidth disabled={loading}>
              {loading ? 'Buscando...' : '🔍 Buscar'}
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