'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button, Input } from '@/components/ui'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tipo, setTipo] = useState<'EMPRESA' | 'TRABAJADOR'>('TRABAJADOR')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!email) newErrors.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido'
    
    if (!password) newErrors.password = 'La contraseña es requerida'
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres'
    
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden'
    
    if (!aceptaTerminos) newErrors.terminos = 'Debes aceptar los términos'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validate()) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            tipo,
          },
        },
      })

      if (error) throw error
      router.push('/auth/login?registered=true')
    } catch (err: any) {
      setError(err.message === 'User already registered' 
        ? 'Ya tienes una cuenta, inicia sesión' 
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    if (!aceptaTerminos) {
      setErrors({ ...errors, terminos: 'Debes aceptar los términos para continuar' })
      return
    }
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            tipo: tipo,
          },
        },
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Imagen lateral */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-500 items-center justify-center p-12">
        <div className="text-white text-center">
          <h2 className="text-4xl font-bold mb-4">
            {tipo === 'TRABAJADOR' ? 'Encuentra tu próximo trabajo' : 'Encuentra los mejores talentos'}
          </h2>
          <p className="text-xl opacity-90">
            {tipo === 'TRABAJADOR' 
              ? 'Crea tu perfil y recibe ofertas que coinciden contigo'
              : 'Publica ofertas y encuentra trabajadores ideales'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-primary-600">
              Match&Go
            </Link>
            <h1 className="text-2xl font-semibold mt-6 text-gray-900">
              Crear Cuenta
            </h1>
            <p className="text-gray-600 mt-2">
              Completa tus datos para comenzar
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Selector de tipo */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setTipo('TRABAJADOR')}
              className={`p-4 rounded-xl border-2 transition-all ${
                tipo === 'TRABAJADOR' 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">👷</div>
              <div className="font-medium">Trabajador</div>
              <div className="text-xs opacity-70">Busco empleo</div>
            </button>
            <button
              type="button"
              onClick={() => setTipo('EMPRESA')}
              className={`p-4 rounded-xl border-2 transition-all ${
                tipo === 'EMPRESA' 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🏢</div>
              <div className="font-medium">Empresa</div>
              <div className="text-xs opacity-70">Busco trabajadores</div>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
            
            <Input
              label="Confirmar Contraseña"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <div className={`p-3 rounded-lg ${errors.terminos ? 'bg-red-50' : 'bg-gray-50'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  Acepto los{' '}
                  <a href="#" className="text-primary-500 hover:underline">Términos y Condiciones</a>
                  {' '}y{' '}
                  <a href="#" className="text-primary-500 hover:underline">Política de Privacidad</a>
                </span>
              </label>
              {errors.terminos && (
                <p className="text-red-500 text-sm mt-1">{errors.terminos}</p>
              )}
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Crear Cuenta
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">o</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            fullWidth
            onClick={handleGoogleSignup}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrarse con Google
          </Button>

          <p className="mt-8 text-center text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-primary-500 font-medium hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}