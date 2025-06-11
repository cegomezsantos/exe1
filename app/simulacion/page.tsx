'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getSystemPrompt } from '@/lib/systemPrompts'
import type { Profile, Cargo, Genero, SesionEjercicio, InteraccionUsuario } from '@/lib/supabase'
import SystemStatus from '@/components/SystemStatus'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export default function SimulacionPage() {
  // Estados principales
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(1)
  const [sessionId, setSessionId] = useState<number | null>(null)
  
  // Estados del usuario
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [userCargo, setUserCargo] = useState<Cargo | null>(null)
  const [userGenero, setUserGenero] = useState<Genero | null>(null)
  
  // Estados de debug
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  
  // Referencias
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Función auxiliar para agregar logs tanto a la consola como al estado
  const addDebugLog = (message: string) => {
    console.log(message)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Función auxiliar para agregar mensajes del sistema al chat
  const addSystemMessage = (content: string) => {
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      role: 'system',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, systemMessage])
  }

  // Scroll automático al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus automático cuando el sistema esté listo
  useEffect(() => {
    if (sessionId && inputRef.current) {
      addDebugLog('🎯 Sistema listo, enfocando input')
      inputRef.current.focus()
    }
  }, [sessionId])

  // Inicialización: obtener datos del usuario y crear sesión
  useEffect(() => {
    addDebugLog('🔄 useEffect ejecutándose - inicializando sesión')
    addSystemMessage('🔄 Iniciando simulador conversacional...')
    initializeSession()
  }, [])

  const initializeSession = async () => {
    addDebugLog('🚀 Iniciando sesión...')
    addSystemMessage('📱 Configurando perfil de usuario...')
    
    // Para desarrollo, configurar datos de prueba inmediatamente
    const testProfile: Profile = {
      id: 'test-user',
      nombre_completo: 'María González',
      nombre_preferido: 'María',
      cargo_id: 1,
      genero_id: 1,
      created_at: new Date().toISOString()
    }
    
    addDebugLog('👤 Configurando perfil de prueba: ' + testProfile.nombre_preferido)
    setUserProfile(testProfile)
    setUserCargo({ id: 1, nombre: 'Coordinadora Académica' })
    setUserGenero({ id: 1, nombre: 'femenino' })

    // Asignar sessionId inmediatamente para que el chat funcione
    const tempSessionId = Date.now()
    addDebugLog('🔑 Asignando sessionId temporal: ' + tempSessionId)
    setSessionId(tempSessionId)
    addSystemMessage('🔑 Sesión configurada correctamente')

    try {
      // Intentar crear sesión en Supabase (opcional)
      addDebugLog('🔄 Intentando crear sesión en base de datos...')
      const { data: session, error } = await supabase
        .from('sesiones_ejercicio')
        .insert({
          user_id: 'test-user',
          estado: 'en_progreso'
        })
        .select()
        .single()

      if (session && !error) {
        addDebugLog('✅ Sesión creada en BD: ' + session.id)
        setSessionId(session.id)
      } else {
        addDebugLog('⚠️ No se pudo crear en BD, usando temporal: ' + (error?.message || 'Error desconocido'))
      }
    } catch (dbError) {
      addDebugLog('⚠️ Error de BD, continuando con sesión temporal: ' + String(dbError))
    }

    // Enviar mensaje inicial (siempre, independientemente de la BD)
    addDebugLog('💬 Enviando mensaje inicial...')
    addSystemMessage('💬 Enviando mensaje inicial del asistente...')
    await sendInitialMessage(tempSessionId)
  }

  // Enviar mensaje inicial de la IA
  const sendInitialMessage = async (sessionId: number) => {
    addDebugLog('💬 sendInitialMessage iniciado con sessionId: ' + sessionId)
    
    // Usar datos por defecto si no están disponibles
    const profile = userProfile || {
      id: 'test-user',
      nombre_preferido: 'María',
      nombre_completo: 'María González',
      cargo_id: 1,
      genero_id: 1,
      created_at: new Date().toISOString()
    }
    
    const cargo = userCargo || { id: 1, nombre: 'Coordinadora Académica' }
    const genero = userGenero || { id: 1, nombre: 'femenino' }

    const systemPrompt = getSystemPrompt(
      1, 
      profile.nombre_preferido, 
      cargo.nombre,
      genero.nombre
    )

    addDebugLog('📝 System prompt generado, longitud: ' + systemPrompt.length)

    try {
      addDebugLog('🔄 Llamando a la API de chat...')
      addSystemMessage('🤖 Conectando con el asistente de IA...')
      const startTime = Date.now()
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [],
          systemPrompt,
          userMessage: 'Iniciar conversación'
        }),
      })

      addDebugLog('📡 Respuesta HTTP recibida, status: ' + response.status)

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime
      
      addDebugLog('✅ Respuesta de la API recibida en ' + responseTime + 'ms')
      addDebugLog('📊 Datos de respuesta: ' + JSON.stringify(data).substring(0, 100) + '...')
      
      if (data.success) {
        const initialMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, initialMessage])
        addDebugLog('🎉 Mensaje inicial agregado al chat')
        addSystemMessage('✅ Asistente IA conectado y listo para conversar')
        
        // Intentar guardar en la base de datos (no crítico si falla)
        try {
          await supabase
            .from('interacciones_usuario')
            .insert({
              user_id: profile.id,
              mensaje_usuario: 'Iniciar conversación',
              respuesta_ia: data.message,
              fase_conversacion: 1,
              numero_interaccion: 1,
              sesion_id: sessionId,
              duracion_respuesta_ms: responseTime
            })
          addDebugLog('✅ Interacción guardada en base de datos')
        } catch (dbError) {
          addDebugLog('⚠️ No se pudo guardar en BD, continuando: ' + String(dbError))
        }
      } else {
        addDebugLog('❌ Error en respuesta de la API: ' + (data.error || 'Error desconocido'))
        addSystemMessage('❌ Error: ' + (data.error || 'Error desconocido'))
      }
    } catch (error) {
      addDebugLog('❌ Error enviando mensaje inicial: ' + String(error))
      addSystemMessage('❌ Error conectando con el asistente')
      
      // Mostrar error específico para debug
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `Error técnico: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor revisa la configuración de las variables de entorno (GEMINI_API_KEY) y recarga la página.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
      addDebugLog('❌ Error mostrado al usuario para debug')
    }
  }

  // Enviar mensaje del usuario
  const sendMessage = async () => {
    console.log('📝 Intentando enviar mensaje:', userInput.trim())
    console.log('🔍 Estados:', { isLoading, sessionId, userProfile: !!userProfile, userCargo: !!userCargo, userGenero: !!userGenero })
    
    if (!userInput.trim()) {
      console.log('❌ Mensaje vacío')
      return
    }
    
    if (isLoading) {
      console.log('❌ Ya está cargando')
      return
    }
    
    if (!sessionId) {
      console.log('❌ No hay sessionId')
      return
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    }

    // Actualizar UI inmediatamente
    setMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsLoading(true)

    // Usar datos por defecto si no están disponibles
    const profile = userProfile || {
      id: 'test-user',
      nombre_preferido: 'María',
      nombre_completo: 'María González',
      cargo_id: 1,
      genero_id: 1,
      created_at: new Date().toISOString()
    }
    
    const cargo = userCargo || { id: 1, nombre: 'Coordinadora Académica' }
    const genero = userGenero || { id: 1, nombre: 'femenino' }

    try {
      addDebugLog('🚀 Enviando mensaje: ' + userMessage.content)
      const startTime = Date.now()
      
      // PRIMERO: Determinar la nueva fase ANTES de generar el prompt
      const userMessagesCount = messages.filter(m => m.role === 'user').length + 1 // +1 por el que acabamos de enviar
      addDebugLog(`👤 Mensajes de usuario contados: ${userMessagesCount}`)
      
      let newPhase = currentPhase
      if (userMessagesCount === 1 && currentPhase === 1) {
        newPhase = 2
        addDebugLog('📈 Avanzando a Paso 2 (después de respuesta del usuario al saludo)')
      } else if (userMessagesCount === 2 && currentPhase === 2) {
        newPhase = 3
        addDebugLog('📈 Avanzando a Paso 3 (actividad práctica)')
      } else if (userMessagesCount >= 3 && currentPhase === 3) {
        newPhase = 4
        addDebugLog('📈 Avanzando a Paso 4 (evaluación)')
      } else if (userMessagesCount >= 4 && currentPhase === 4) {
        newPhase = 5
        addDebugLog('📈 Avanzando a Paso 5 (cierre)')
      }
      
      // Actualizar la fase inmediatamente
      if (newPhase !== currentPhase) {
        addDebugLog(`🔄 Cambiando de Paso ${currentPhase} a Paso ${newPhase} ANTES de generar prompt`)
        setCurrentPhase(newPhase)
      }
      
      // SEGUNDO: Usar la nueva fase para generar el prompt
      const phaseToUse = newPhase
      addDebugLog('🎯 Usando fase para prompt: ' + phaseToUse)
      
      const systemPrompt = getSystemPrompt(
        phaseToUse,
        profile.nombre_preferido,
        cargo.nombre,
        genero.nombre
      )

      addDebugLog('📝 Prompt generado para fase: ' + phaseToUse)
      addDebugLog('👤 Usuario: ' + profile.nombre_preferido)
      
      // Preparar historial para la API
      const messageHistory = [...messages, userMessage].map(msg => ({
        role: msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'assistant' : 'system',
        content: msg.content
      }))

      addDebugLog('📋 Historial preparado:')
      messageHistory.forEach((msg, i) => {
        addDebugLog(`  ${i + 1}. ${msg.role}: ${msg.content.substring(0, 50)}...`)
      })

      // Llamar a la API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messageHistory,
          systemPrompt,
          userMessage: userMessage.content
        }),
      })

      const data = await response.json()
      const responseTime = Date.now() - startTime
      
      console.log('📨 Respuesta de API recibida:', { success: data.success, hasMessage: !!data.message })

      if (data.success) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, aiMessage])

        // Guardar la interacción completa en la nueva tabla
        const numeroInteraccion = messages.length + 1; // +1 porque ya agregamos el mensaje del usuario
        
        // Guardar en BD de forma no bloqueante
        try {
          await supabase
            .from('interacciones_usuario')
            .insert({
              user_id: profile.id,
              mensaje_usuario: userMessage.content,
              respuesta_ia: data.message,
              fase_conversacion: currentPhase,
              numero_interaccion: numeroInteraccion,
              sesion_id: sessionId,
              duracion_respuesta_ms: responseTime
            })
          console.log('✅ Interacción guardada en BD')
        } catch (dbError) {
          console.warn('⚠️ No se pudo guardar en BD:', dbError)
        }

        addDebugLog('✅ Interacción completada exitosamente')

      } else {
        console.error('Error en la respuesta de la API:', data.error)
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  // Detectar cambio de fase simplificado
  const detectPhaseChange = (aiMessage: string, currentInteractionNumber: number) => {
    addDebugLog(`🔍 Evaluando cambio de fase - Interacción #${currentInteractionNumber}, Fase actual: ${currentPhase}`)
    
    // Contar solo mensajes de usuario (no incluir mensajes del sistema)
    const userMessagesCount = messages.filter(m => m.role === 'user').length + 1 // +1 por el que acabamos de enviar
    addDebugLog(`👤 Mensajes de usuario contados: ${userMessagesCount}`)
    
    // Lógica simple basada en número de intercambios del usuario
    let newPhase = currentPhase
    
    if (userMessagesCount === 1 && currentPhase === 1) {
      newPhase = 2
      addDebugLog('📈 Avanzando a Paso 2 (después de respuesta del usuario al saludo)')
    } else if (userMessagesCount === 2 && currentPhase === 2) {
      newPhase = 3
      addDebugLog('📈 Avanzando a Paso 3 (actividad práctica)')
    } else if (userMessagesCount >= 3 && currentPhase === 3) {
      newPhase = 4
      addDebugLog('📈 Avanzando a Paso 4 (evaluación)')
    } else if (userMessagesCount >= 4 && currentPhase === 4) {
      newPhase = 5
      addDebugLog('📈 Avanzando a Paso 5 (cierre)')
    }
    
    if (newPhase !== currentPhase) {
      addDebugLog(`🔄 Cambiando de Paso ${currentPhase} a Paso ${newPhase}`)
      setCurrentPhase(newPhase)
    } else {
      addDebugLog(`⏸️ Manteniendo Paso ${currentPhase}`)
    }
  }

  // Manejar envío con Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      console.log('⌨️ Enter presionado, enviando mensaje')
      sendMessage()
    }
  }

  // Manejar envío con botón
  const handleSendClick = () => {
    console.log('🖱️ Botón enviar clickeado')
    sendMessage()
  }

  // Indicador de escritura
  const TypingIndicator = () => (
    <div className="flex items-center space-x-2 p-3">
      <div className="message-bubble message-ai">
        <div className="typing-indicator">
          <div className="typing-dot" style={{ animationDelay: '0ms' }}></div>
          <div className="typing-dot" style={{ animationDelay: '150ms' }}></div>
          <div className="typing-dot" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Simulador Conversacional
              </h1>
              <p className="text-sm text-slate-700 font-medium">
                Paso {currentPhase} de 5 - Sesión 1: Actividad de Entrada
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-700 font-medium">
                {userCargo?.nombre || 'Cargo no especificado'}
              </div>
              {sessionId && (
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-green-600 font-medium">
                    ✅ Sistema listo
                  </div>
                  {/* Botones de debug */}
                  <button
                    onClick={() => {
                      console.log('🔧 Avance manual de paso')
                      setCurrentPhase(prev => Math.min(prev + 1, 5))
                    }}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Siguiente Paso
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔄 Reiniciando conversación')
                      setMessages([])
                      setCurrentPhase(1)
                      setUserInput('')
                      initializeSession()
                    }}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                  >
                    Reiniciar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Debug Panel - solo mostrar si no hay mensajes */}
          {messages.length === 0 && (
            <div className="p-4">
              <SystemStatus />
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' 
                    ? 'justify-end' 
                    : message.role === 'system'
                      ? 'justify-center'
                      : 'justify-start'
                }`}
              >
                <div
                  className={`message-bubble ${
                    message.role === 'user' ? 'message-user' : 
                    message.role === 'system' ? 'bg-amber-100 text-amber-800 border border-amber-300 text-sm font-medium' :
                    'message-ai'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div 
                    className={`text-xs mt-2 font-medium ${
                      message.role === 'user' ? 'text-blue-100' : 
                      message.role === 'system' ? 'text-amber-600' :
                      'text-slate-600'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t p-4">
            <div className="flex space-x-4">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  isLoading 
                    ? "Esperando respuesta..." 
                    : !sessionId 
                      ? "Sistema iniciando..."
                      : "Escribe tu mensaje y presiona Enter..."
                }
                disabled={isLoading || !sessionId}
                className={`flex-1 border-2 rounded-lg px-4 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isLoading 
                    ? 'border-orange-300 bg-orange-50 text-orange-600' 
                    : !sessionId 
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-slate-300 bg-white'
                } disabled:cursor-not-allowed`}
              />
              <button
                onClick={handleSendClick}
                disabled={isLoading || !userInput.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Panel - mostrar logs cuando hay problemas */}
      {debugInfo.length > 0 && (
        <div className="bg-slate-800 text-green-400 p-4 max-h-40 overflow-y-auto">
          <div className="text-xs font-mono">
            <div className="font-bold text-green-300 mb-2">🔧 Debug Log:</div>
            {debugInfo.slice(-10).map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 