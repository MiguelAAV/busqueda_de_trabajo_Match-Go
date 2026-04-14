'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button, Input } from '@/components/ui'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tipo, setTipo] = useState<'EMPRESA' | 'TRABAJADOR'>('TRABAJADOR')
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          scopes: 'email profile',
        },
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-primary-600 mb-8">
          Match&Go
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Crear Cuenta</h2>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setTipo('TRABAJADOR')}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  tipo === 'TRABAJADOR' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Trabajador
              </button>
              <button
                type="button"
                onClick={() => setTipo('EMPRESA')}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  tipo === 'EMPRESA' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Empresa
              </button>
            </div>
            
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="my-6 text-center text-gray-500">o</div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleSignup}
          >
            Registrarse con Google
          </Button>

          <p className="mt-6 text-center text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <a href="/auth/login" className="text-primary-500 hover:underline">
              Inicia Sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}