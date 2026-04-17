'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">Match&Go</h1>
          <nav className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Registrarse</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Encuentra o publica{' '}
              <span className="text-primary-500">trabajos temporales</span>{' '}
              en minutos
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              La plataforma de matching que conecta empresas con trabajadores temporales 
              de forma rápida, segura y sin complicaciones.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg">Comenzar Gratis</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">Ya tengo cuenta</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              ¿Por qué usar Match&Go?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">Matching Instantáneo</h4>
                <p className="text-gray-600">
                  Nuestro algoritmo te conecta con los mejores candidatos o ofertas en segundos.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">Perfiles Verificados</h4>
                <p className="text-gray-600">
                  Trabajadores y empresas con perfiles verificados para mayor seguridad.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">Fácil de Usar</h4>
                <p className="text-gray-600">
                  Interfaz intuitiva desde tu celular o computadora. Sin complicaciones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              ¿Cómo funciona?
            </h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-xl font-semibold text-primary-600 mb-4">Para Trabajadores</h4>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                    <div>
                      <strong>Crea tu perfil</strong>
                      <p className="text-gray-600 text-sm">Agrega tu experiencia, disponibilidad y certificaciones</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                    <div>
                      <strong>Recibe matches</strong>
                      <p className="text-gray-600 text-sm">Te notificamos cuando haya ofertas compatibles</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                    <div>
                      <strong>Postula y conecta</strong>
                      <p className="text-gray-600 text-sm">Contacta directamente con las empresas</p>
                    </div>
                  </li>
                </ol>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-primary-600 mb-4">Para Empresas</h4>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                    <div>
                      <strong>Publica tu oferta</strong>
                      <p className="text-gray-600 text-sm">Describe el trabajo y requisitos necesarios</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                    <div>
                      <strong>Recibe candidatos</strong>
                      <p className="text-gray-600 text-sm">Nuestro matching te muestra los mejores perfiles</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                    <div>
                      <strong>Elige y contacta</strong>
                      <p className="text-gray-600 text-sm">Selecciona al candidato ideal y contrátalo</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 bg-primary-500 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h3 className="text-3xl font-bold mb-4">¿Listo para empezar?</h3>
            <p className="text-xl mb-8 opacity-90">
              Únete a miles de empresas y trabajadores que ya usan Match&Go
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/register">
                <Button variant="outline" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Crear Cuenta Gratis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-white font-bold text-lg">Match&Go</span>
              <p className="text-sm mt-1">Conectando talentos con oportunidades</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white">Términos</a>
              <a href="#" className="hover:text-white">Privacidad</a>
              <a href="#" className="hover:text-white">Ayuda</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm">
            © 2024 Match&Go. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}