'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Input, Textarea } from '@/components/ui'

const categorias = [
  { value: '', label: 'Selecciona una categoría' },
  { value: 'Guardia', label: 'Guardia / Seguridad' },
  { value: 'Conserje', label: 'Conserje' },
  { value: 'Temporero', label: 'Temporero' },
  { value: 'Aseo', label: 'Aseo / Limpieza' },
  { value: 'Niñera', label: 'Niñera / Cuidado de niños' },
  { value: 'Carga', label: 'Carga / Descarga' },
  { value: 'Otro', label: 'Otro' },
]

const regiones = [
  { value: '', label: 'Selecciona una región' },
  { value: 'RM', label: 'Región Metropolitana' },
  { value: 'V', label: 'Valparaíso' },
  { value: 'VI', label: "O'Higgins" },
]

const jornadas = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'horas', label: 'Por Horas' },
]

const formaPago = [
  { value: 'mes', label: 'Por Mes' },
  { value: 'jornada', label: 'Por Jornada' },
  { value: 'hora', label: 'Por Hora' },
]

export default function NuevaOfertaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [form, setForm] = useState({
    titulo: '',
    categoria: '',
    descripcion: '',
    region: '',
    comuna: '',
    jornada: 'full_time',
    remuneration_monto: '',
    remuneration_forma_pago: 'mes',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simular guardado
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/empresa'), 1500)
    }, 1000)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="text-center p-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Oferta Publicada!</h2>
          <p className="text-gray-500">Redirigiendo al dashboard...</p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Publicar Nueva Oferta</h1>
        <p className="text-gray-600 mt-1">Completa los detalles del trabajo que necesitas</p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
          ⚠️ Modo Demo
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Información del Trabajo</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título del puesto *</label>
                  <input
                    name="titulo"
                    placeholder="Ej: Guardia de seguridad para evento"
                    value={form.titulo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {categorias.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                  <textarea
                    name="descripcion"
                    placeholder="Describe las funciones y requisitos del puesto..."
                    value={form.descripcion}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Ubicación</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Región *</label>
                  <select
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {regiones.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comuna *</label>
                  <input
                    name="comuna"
                    placeholder="Ej: Santiago Centro"
                    value={form.comuna}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Detalles del Pago</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($) *</label>
                  <input
                    name="remuneration_monto"
                    type="number"
                    placeholder="Ej: 500000"
                    value={form.remuneration_monto}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pago</label>
                  <select
                    name="remuneration_forma_pago"
                    value={form.remuneration_forma_pago}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {formaPago.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Tipo de Trabajo</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
                <select
                  name="jornada"
                  value={form.jornada}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {jornadas.map(j => (
                    <option key={j.value} value={j.value}>{j.label}</option>
                  ))}
                </select>
              </div>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" fullWidth loading={loading}>
                Publicar Oferta
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                fullWidth
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}