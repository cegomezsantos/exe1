import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Simulador Conversacional
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Desarrolla tus habilidades de coordinación educativa a través de 
          escenarios interactivos con inteligencia artificial.
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ¿Cómo funciona?
          </h2>
          <div className="text-left space-y-3">
            <div className="flex items-start space-x-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              <p className="text-gray-700">Contextualización de tu entorno profesional</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              <p className="text-gray-700">Co-creación de un escenario de conflicto realista</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              <p className="text-gray-700">Redacción de un correo de gestión profesional</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
              <p className="text-gray-700">Feedback formativo para mejorar tu comunicación</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
              <p className="text-gray-700">Reflexión sobre el proceso de aprendizaje</p>
            </div>
          </div>
        </div>

        <Link 
          href="/simulacion"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Comenzar Simulación
        </Link>
      </div>
    </div>
  )
} 