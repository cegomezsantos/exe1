'use client'

import { useState } from 'react'

export default function SystemStatus() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<string>('')

  const testAPI = async () => {
    setTesting(true)
    setResult('')
    
    try {
      console.log('🧪 Probando API de chat...')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [],
          systemPrompt: 'Eres un asistente de prueba. Responde solo: "Sistema funcionando correctamente"',
          userMessage: 'Test'
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult('✅ API funcionando: ' + data.message)
      } else {
        setResult('❌ Error en API: ' + data.error)
      }
    } catch (error) {
      setResult('❌ Error de conexión: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
      <h3 className="font-semibold text-slate-800 mb-2">🔧 Debug del Sistema</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Variables de entorno:</strong>
        </div>
        <div className="ml-4">
          • NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Falta'}
        </div>
        <div className="ml-4">
          • NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Falta'}
        </div>
        
        <div className="mt-3">
          <button
            onClick={testAPI}
            disabled={testing}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
          >
            {testing ? 'Probando...' : 'Probar API de Gemini'}
          </button>
        </div>
        
        {result && (
          <div className="mt-2 p-2 bg-white rounded border">
            {result}
          </div>
        )}
      </div>
    </div>
  )
} 