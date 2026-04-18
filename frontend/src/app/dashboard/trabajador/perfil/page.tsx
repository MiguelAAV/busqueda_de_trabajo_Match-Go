'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Badge } from '@/components/ui'
import { supabase, db, isSupabaseConfigured } from '@/lib/supabase'

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [perfil, setPerfil] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    loadPerfil()
  }, [])

  const loadPerfil = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          setUser(authUser)
          const perfilData = await db.getPerfilTrabajador(authUser.id)
          
          if (!perfilData) {
            // Crear perfil automáticamente si no existe
            const { error: createError } = await supabase
              .from('trabajador')
              .insert({
                usuario_id: authUser.id,
                nombre_completo: authUser.user_metadata?.nombre || '',
                rut: '',
                telefono: '',
                region: 'RM',
                comuna: '',
                disponibilidad: { dias: [], horarios: [] },
                pretension_renta: { min: 0, max: 0, tipo: 'mes' },
              })
            
            if (!createError) {
              const newPerfil = await db.getPerfilTrabajador(authUser.id)
              setPerfil(newPerfil)
            }
          } else {
            setPerfil(perfilData)
          }
        }
      } else {
        const { mockTrabajadores } = await import('@/lib/mockData')
        setPerfil(mockTrabajadores[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPerfil((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      if (isSupabaseConfigured && supabase && perfil) {
        const { error } = await supabase
          .from('trabajador')
          .update({
            nombre_completo: perfil.nombre_completo,
            telefono: perfil.telefono,
            region: perfil.region,
            comuna: perfil.comuna,
            movilizacion_propia: perfil.movilizacion_propia,
            disponibilidad: perfil.disponibilidad,
            pretension_renta: perfil.pretension_renta,
            updated_at: new Date().toISOString(),
          })
          .eq('id', perfil.id)

        if (error) throw error
        
        setMensaje('✅ Perfil guardado exitosamente')
        setTimeout(() => setMensaje(''), 3000)
      }
      setEditando(false)
    } catch (err: any) {
      console.error(err)
      setMensaje('❌ Error al guardar: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Perfil no encontrado</h2>
        <p className="text-gray-500 mt-2">Parece que no tienes un perfil creado</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Gestiona tu información personal y profesional</p>
          {!isSupabaseConfigured && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              ⚠️ Modo Demo
            </div>
          )}
        </div>
        <Button 
          variant={editando ? 'primary' : 'outline'}
          onClick={() => editando ? handleGuardar() : setEditando(true)}
          loading={guardando}
        >
          {editando ? 'Guardar Cambios' : 'Editar Perfil'}
        </Button>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-lg mb-6 ${mensaje.includes('✅') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {mensaje}
        </div>
      )}

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
                <p className="text-gray-900">{perfil?.rut || 'No registrado'}</p>
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
                    onChange={(e) => {
                      const min = parseInt(e.target.value)
                      setPerfil((prev: any) => ({
                        ...prev,
                        pretension_renta: { ...prev.pretension_renta, min }
                      }))
                    }}
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
                    onChange={(e) => {
                      const max = parseInt(e.target.value)
                      setPerfil((prev: any) => ({
                        ...prev,
                        pretension_renta: { ...prev.pretension_renta, max }
                      }))
                    }}
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
                  <p className="font-medium text-gray-900">{exp.cargo}</p>
                  <p className="text-gray-500">{exp.empresa}</p>
                  <p className="text-sm text-gray-400">{exp.periodo}</p>
                  <p className="text-sm text-gray-600 mt-2">{exp.descripcion}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Sin experiencia registrada</p>
            )}
            {editando && (
              <Button variant="outline" size="sm" className="mt-4">
                + Agregar Experiencia
              </Button>
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
            {editando ? (
              <div className="space-y-2">
                {['OS10', 'Primeros Auxilios', 'SEC', 'Manipulación de Alimentos'].map(cert => (
                  <label key={cert} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={perfil?.certificaciones?.includes(cert)}
                      onChange={(e) => {
                        const certs = perfil?.certificaciones || []
                        const newCerts = e.target.checked
                          ? [...certs, cert]
                          : certs.filter((c: string) => c !== cert)
                        setPerfil((prev: any) => ({ ...prev, certificaciones: newCerts }))
                      }}
                      className="w-4 h-4"
                    />
                    <span>{cert}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {perfil?.certificaciones?.length > 0 ? (
                  perfil.certificaciones.map((cert: string, i: number) => (
                    <Badge key={i} variant="info">{cert}</Badge>
                  ))
                ) : (
                  <p className="text-gray-500">Sin certificaciones</p>
                )}
              </div>
            )}
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={perfil?.movilizacion_propia || false}
                  onChange={(e) => setPerfil((prev: any) => ({ ...prev, movilizacion_propia: e.target.checked }))}
                  disabled={!editando}
                  className="w-4 h-4"
                />
                <span>Movilización propia</span>
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}