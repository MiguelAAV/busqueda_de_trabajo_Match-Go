'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Badge } from '@/components/ui'
import { mockTrabajadores } from '@/lib/mockData'

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [perfil, setPerfil] = useState<any>(null)

  useEffect(() => {
    setTimeout(() => {
      setPerfil(mockTrabajadores[0])
      setLoading(false)
    }, 300)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPerfil((prev: any) => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Gestiona tu información personal y profesional</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            ⚠️ Modo Demo
          </div>
        </div>
        <Button 
          variant={editando ? 'primary' : 'outline'}
          onClick={() => setEditando(!editando)}
        >
          {editando ? 'Guardar Cambios' : 'Editar Perfil'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Personal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                {editando ? (
                  <input
                    name="nombre_completo"
                    value={perfil?.nombre_completo || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900">{perfil?.nombre_completo}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                <p className="text-gray-900">{perfil?.rut}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                {editando ? (
                  <input
                    name="telefono"
                    value={perfil?.telefono || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900">{perfil?.telefono}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                {editando ? (
                  <select
                    name="region"
                    value={perfil?.region || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="RM">Región Metropolitana</option>
                    <option value="V">Valparaíso</option>
                    <option value="VI">O'Higgins</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{perfil?.region}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                {editando ? (
                  <input
                    name="comuna"
                    value={perfil?.comuna || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900">{perfil?.comuna}</p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold mb-4">Pretensión de Renta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Mínimo</label>
                {editando ? (
                  <input
                    type="number"
                    name="min"
                    value={perfil?.pretension_renta?.min || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-green-600">
                    ${perfil?.pretension_renta?.min?.toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Máximo</label>
                {editando ? (
                  <input
                    type="number"
                    name="max"
                    value={perfil?.pretension_renta?.max || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900 font-medium text-green-600">
                    ${perfil?.pretension_renta?.max?.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold mb-4">Experiencia Laboral</h2>
            {perfil?.experiencia?.length > 0 ? (
              perfil.experiencia.map((exp: any, i: number) => (
                <div key={i} className="border-b last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{exp.cargo}</p>
                      <p className="text-gray-500">{exp.empresa}</p>
                      <p className="text-sm text-gray-400">{exp.periodo}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{exp.descripcion}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Sin experiencia registrada</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar */}
          <Card className="text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
              👷
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {perfil?.nombre_completo}
            </h3>
            <p className="text-gray-500">{perfil?.region}</p>
            {editando && (
              <Button variant="outline" size="sm" className="mt-4">
                Cambiar Foto
              </Button>
            )}
          </Card>

          {/* Certificaciones */}
          <Card>
            <h3 className="font-semibold mb-3">Certificaciones</h3>
            <div className="flex flex-wrap gap-2">
              {perfil?.certificaciones?.map((cert: string, i: number) => (
                <Badge key={i} variant="info">{cert}</Badge>
              ))}
            </div>
          </Card>

          {/* Disponibilidad */}
          <Card>
            <h3 className="font-semibold mb-3">Disponibilidad</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Días:</strong> {perfil?.disponibilidad?.dias?.join(', ') || 'No definido'}</p>
              <p><strong>Horario:</strong> {perfil?.disponibilidad?.horarios?.join(', ') || 'No definido'}</p>
            </div>
          </Card>

          {/* Otros */}
          <Card>
            <h3 className="font-semibold mb-3">Otros</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                🚗{' '}
                <span>Movilización propia:</span>
                <span className="font-medium">
                  {perfil?.movilizacion_propia ? 'Sí' : 'No'}
                </span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}