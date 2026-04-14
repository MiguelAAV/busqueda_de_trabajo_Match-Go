export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-primary-600 mb-4">
          Match&Go
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Conecta empresas con trabajadores temporales en minutos
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/login"
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Iniciar Sesión
          </a>
          <a
            href="/auth/register"
            className="px-6 py-3 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50"
          >
            Registrarse
          </a>
        </div>
      </div>
    </main>
  )
}