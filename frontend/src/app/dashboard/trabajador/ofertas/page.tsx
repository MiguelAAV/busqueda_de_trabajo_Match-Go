'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, Button, Spinner, Badge } from '@/components/ui'
import { mockOfertas } from '@/lib/mockData'

export default function OfertasPage() {
  const [loading, setLoading] = useState(true)
  const [ofertas, setOfertas] = useState<any[]>([])
  const [filtros, setFiltros] = useState({
    categoria: '',
    region: '',
    jornada: '',
  })

  useEffect(() => {
    setTimeout(() => {
      let filtered = mockOfertas.filter(o => o.estado === 'ABIERTA')
      
      if (filtros.categoria) {
        filtered = filtered.filter(o => o.categoria === filtros.categoria)
      }
      if (filtros.region) {
        filtered = filtered.filter(o => o.region === filtros.region)
      }
      if (filtros.jornada) {
        filtered = filtered.filter(o => o.jornada === filtros.jornada)
      }
      
      setOfertas(filtered)
      setLoading(false)
    }, 300)
  }, [filtros])

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ofertas de Trabajo</h1>
          <p className="text-gray-600 mt-1">Encuentra el trabajo temporal ideal para ti</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            ⚠️ Modo Demo
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="categoria"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filtros.categoria}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="Guardia">Guardia / Seguridad</option>
              <option value="Conserje">Conserje</option>
              <option value="Temporero">Temporero</option>
              <option value="Aseo">Aseo / Limpieza</option>
              <option value="Niñera">Niñera</option>
              <option value="Carga">Carga / Descarga</option>
            </select>
          </div>
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
              <option value="VI">O'Higgins</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
            <select
              name="jornada"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filtros.jornada}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="full_time">Full Time</option>
              <option value="parcial">Parcial</option>
              <option value="horas">Por Horas</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => setFiltros({ categoria: '', region: '', jornada: '' })}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Resultados */}
      <div className="mb-4 text-gray-500">
        {ofertas.length} ofertas encontradas
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : ofertas.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron ofertas
          </h3>
          <p className="text-gray-500">
            Intenta con otros filtros de búsqueda
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ofertas.map((oferta) => (
            <Card key={oferta.id} className="hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-xl">
                      🏢
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {oferta.titulo}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {oferta.categoria} • {oferta.comuna}, {oferta.region}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {oferta.descripcion}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <span>💰</span>
                      <span className="font-medium text-green-600">
                        ${oferta.remuneration?.monto?.toLocaleString()}/{oferta.remuneration?.forma_pago}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>⏰</span>
                      <span>{oferta.jornada === 'full_time' ? 'Full Time' : oferta.jornada === 'parcial' ? 'Parcial' : 'Por Horas'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{new Date(oferta.created_at).toLocaleDateString('es-CL')}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <Link href={`/dashboard/trabajador/ofertas/${oferta.id}`}>
                    <Button size="sm">Ver Detalle</Button>
                  </Link>
                  <Button size="sm" variant="outline">Postular</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}