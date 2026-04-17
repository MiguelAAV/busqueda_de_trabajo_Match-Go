'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Input, Select, Textarea } from '@/components/ui'
import { ofertaApi } from '@/lib/api'

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
  { value: 'VII', label: 'Maule' },
  { value: 'VIII', label: 'Biobío' },
]

const jornadas = [
  { value: 'parcial', label: 'Parcial (Mañana/Tarde)' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'horas', label: 'Por Horas' },
]

const tipoContrato = [
  { value: 'PLAZO_FIJO', label: 'Plazo Fijo' },
  { value: 'HONORARIOS', label: 'Honorarios' },
]

const formaPago = [
  { value: 'hora', label: 'Por Hora' },
  { value: 'jornada', label: 'Por Jornada' },
  { value: 'mes', label: 'Por Mes' },
]

export default function NuevaOfertaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [form, setForm] = useState({
    titulo: '',
    categoria: '',
    descripcion: '',
    region: '',
    comuna: '',
    jornada: 'full_time',
    remuneration_monto: '',
    remuneration_forma_pago: 'mes',
    tipo_contrato: 'PLAZO_FIJO',
    requisitos_certificaciones: [] as string[],
    requisitos_experiencia_min: '0',
    requisitos_movilizacion: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        titulo: form.titulo,
        categoria: form.categoria,
        descripcion: form.descripcion,
        region: form.region,
        comuna: form.comuna,
        fecha_inicio: new Date().toISOString(),
        jornada: form.jornada,
        remuneration: {
          monto: parseInt(form.remuneration_monto),
          forma_pago: form.remuneration_forma_pago,
        },
        tipo_contrato: form.tipo_contrato,
        requisitos: {
          certificaciones: form.requisitos_certificaciones,
          experiencia_min: parseInt(form.requisitos_experiencia_min),
          movilizacion: form.requisitos_movilizacion,
        },
      }

      await ofertaApi.create(payload)
      router.push('/dashboard/empresa')
    } catch (err: any) {
      setError(err.message || 'Error al crear la oferta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Publicar Nueva Oferta</h1>
        <p className="text-gray-600 mt-1">Completa los detalles del trabajo que necesitas</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Información del Trabajo</h2>
              
              <div className="space-y-4">
                <Input
                  label="Título del puesto"
                  name="titulo"
                  placeholder="Ej: Guardia de seguridad para evento"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                />

                <Select
                  label="Categoría"
                  name="categoria"
                  options={categorias}
                  value={form.categoria}
                  onChange={handleChange}
                  required
                />

                <Textarea
                  label="Descripción"
                  name="descripcion"
                  placeholder="Describe las funciones y requisitos del puesto..."
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Ubicación</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Región"
                  name="region"
                  options={regiones}
                  value={form.region}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Comuna"
                  name="comuna"
                  placeholder="Ej: Santiago Centro"
                  value={form.comuna}
                  onChange={handleChange}
                  required
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Requisitos</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Años de experiencia mínima
                  </label>
                  <Input
                    name="requisitos_experiencia_min"
                    type="number"
                    min="0"
                    value={form.requisitos_experiencia_min}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requisitos_movilizacion"
                    name="requisitos_movilizacion"
                    checked={form.requisitos_movilizacion}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500"
                  />
                  <label htmlFor="requisitos_movilizacion" className="text-sm text-gray-700">
                    Require movilización propia
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Detalles del Pago</h2>
              
              <div className="space-y-4">
                <Input
                  label="Monto ($)"
                  name="remuneration_monto"
                  type="number"
                  placeholder="Ej: 500000"
                  value={form.remuneration_monto}
                  onChange={handleChange}
                  required
                />

                <Select
                  label="Forma de pago"
                  name="remuneration_forma_pago"
                  options={formaPago}
                  value={form.remuneration_forma_pago}
                  onChange={handleChange}
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Tipo de Trabajo</h2>
              
              <div className="space-y-4">
                <Select
                  label="Jornada"
                  name="jornada"
                  options={jornadas}
                  value={form.jornada}
                  onChange={handleChange}
                />

                <Select
                  label="Tipo de contrato"
                  name="tipo_contrato"
                  options={tipoContrato}
                  value={form.tipo_contrato}
                  onChange={handleChange}
                />
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