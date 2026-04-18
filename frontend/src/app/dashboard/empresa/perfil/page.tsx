'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { supabase, db, isSupabaseConfigured } from '@/lib/supabase'

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [perfil, setPerfil] = useState<any>(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    loadPerfil()
  }, [])

  const loadPerfil = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          let perfilData = await db.getPerfilEmpresa(user.id)
          
          if (!perfilData) {
            // Crear perfil automáticamente si no existe
            const { error: createError } = await supabase
              .from('empresa')
              .insert({
                usuario_id: user.id,
                razon_social: user.user_metadata?.nombre || 'Mi Empresa',
                rut: '',
                direccion: '',
                telefono: '',
                contacto_nombre: user.user_metadata?.nombre || '',
                region: 'RM',
              })
            
            if (!createError) {
              perfilData = await db.getPerfilEmpresa(user.id)
            }
          }
          setPerfil(perfilData)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPerfil((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      if (isSupabaseConfigured && supabase && perfil) {
        const { error } = await supabase
          .from('empresa')
          .update({
            razon_social: perfil.razon_social,
            rut: perfil.rut,
            giro: perfil.giro,
            direccion: perfil.direccion,
            telefono: perfil.telefono,
            contacto_nombre: perfil.contacto_nombre,
            region: perfil.region,
            updated_at: new Date().toISOString(),
          })
          .eq('id', perfil.id)

        if (error) throw error
        
        setMensaje('✅ Perfil guardado exitosamente')
        setTimeout(() => setMensaje(''), 3000)
      }
      setEditando(false)
    } catch (err: any) {
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
        <p className="text-gray-500 mt-2">Parece que no tienes un perfil de empresa</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Empresa</h1>
          <p className="text-gray-600 mt-1">Gestiona los datos de tu empresa</p>
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
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Datos de la Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                {editando ? (
                  <input name="razon_social" value={perfil?.razon_social || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                ) : (
                  <p className="text-gray-900">{perfil?.razon_social}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                {editando ? (
                  <input name="rut" value={perfil?.rut || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                ) : (
                  <p className="text-gray-900">{perfil?.rut || 'No registrado'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giro</label>
                {editando ? (
                  <input name="giro" value={perfil?.giro || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                ) : (
                  <p className="text-gray-900">{perfil?.giro || 'No registrado'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                {editando ? (
                  <input name="telefono" value={perfil?.telefono || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                ) : (
                  <p className="text-gray-900">{perfil?.telefono}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                {editando ? (
                  <input name="direccion" value={perfil?.direccion || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                ) : (
                  <p className="text-gray-900">{perfil?.direccion}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                {editando ? (
                  <select name="region" value={perfil?.region || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="RM">Región Metropolitana</option>
                    <option value="V">Valparaíso</option>
                    <option value="VI">O'Higgins</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{perfil?.region}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto</label>
                {editando ? (
                  <input name="contacto_nombre" value={perfil?.contacto_nombre || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                ) : (
                  <p className="text-gray-900">{perfil?.contacto_nombre}</p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold mb-4">Plan de Suscripción</h2>
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-primary-600 font-medium">Plan {perfil?.plan || 'TRIAL'}</p>
              <p className="text-sm text-gray-500 mt-1">
                {perfil?.plan === 'TRIAL' 
                  ? 'Período de prueba activo' 
                  : `Publicaciones usadas: ${perfil?.publicaciones_usadas || 0}`}
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
              🏢
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{perfil?.razon_social}</h3>
            <p className="text-gray-500">{perfil?.region}</p>
          </Card>

          <Card>
            <h3 className="font-semibold mb-3">stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Publicaciones</span>
                <span className="font-medium">{perfil?.publicaciones_usadas || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Busquedas</span>
                <span className="font-medium">{perfil?.busquedas_usadas || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Miembro desde</span>
                <span className="font-medium">{new Date(perfil?.created_at).toLocaleDateString('es-CL')}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}