'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getConversationalPrompt } from '@/lib/conversationalPrompts'
import { formatChatText } from '@/lib/textUtils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function SimulatorPage() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [isValidAccess, setIsValidAccess] = useState<boolean | null>(null)
  const [userName, setUserName] = useState<string>('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Validar acceso desde aula virtual
  useEffect(() => {
    const maxParam = searchParams.get('max')
    const namParam = searchParams.get('nam')
    
    // Validar que existe el parámetro max con el valor correcto
    if (maxParam === '719387') {
      setIsValidAccess(true)
      // Extraer y formatear el nombre del usuario
      if (namParam) {
        const cleanName = decodeURIComponent(namParam).trim()
        setUserName(cleanName)
      } else {
        setUserName('Estudiante')
      }
    } else {
      setIsValidAccess(false)
    }
  }, [searchParams])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startSession = async () => {
    if (hasStarted) return
    
    setHasStarted(true)
    const tempSessionId = Date.now()
    setSessionId(tempSessionId)

    // Crear sesión en Supabase (opcional)
    try {
      const { data: session, error } = await supabase
        .from('sesiones_ejercicio')
        .insert({
          user_id: userName || 'test-user',
          estado: 'en_progreso'
        })
        .select()
        .single()

      if (session && !error) {
        setSessionId(session.id)
      }
    } catch (dbError) {
      // Continuar con sesión temporal
    }

    // Enviar mensaje inicial con el nombre del usuario
    await sendInitialMessage(tempSessionId)
  }

  const sendInitialMessage = async (sessionId: number) => {
    // Usar el nombre del usuario obtenido de los parámetros URL
    const systemPrompt = getConversationalPrompt(userName || 'Estudiante', 'Coordinadora Académica')

    try {
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

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        const initialMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: formatChatText(data.message),
          timestamp: new Date()
        }
        
        setMessages([initialMessage])
        setTimeout(scrollToBottom, 100)
        
        // Enfocar input
        setTimeout(() => inputRef.current?.focus(), 200)
        
        // Guardar en BD (opcional)
        try {
          await supabase
            .from('interacciones_usuario')
            .insert({
              user_id: userName || 'test-user',
              mensaje_usuario: 'Iniciar conversación',
              respuesta_ia: data.message,
              fase_conversacion: 1,
              numero_interaccion: 1,
              sesion_id: sessionId,
              duracion_respuesta_ms: 0
            })
        } catch (dbError) {
          // BD opcional
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'Lo siento, parece que hay un problema técnico. Por favor, revisa tu conexión e intenta de nuevo.',
        timestamp: new Date()
      }
      
      setMessages([errorMessage])
      setTimeout(scrollToBottom, 100)
    }
  }

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading || !sessionId) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsLoading(true)
    setTimeout(scrollToBottom, 100)

    try {
      const conversationHistory = [...messages, userMessage]
      const apiHistory = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const systemPrompt = getConversationalPrompt(userName || 'Estudiante', 'Coordinadora Académica') + 
        `\n\nCONTEXTO ACTUAL: Esta conversación ya tiene ${apiHistory.length} mensajes. Lee todo el historial y responde SOLO a lo que el usuario acaba de decir, sin repetir información ya establecida.`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiHistory,
          systemPrompt,
          userMessage: userMessage.content
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: formatChatText(data.message),
          timestamp: new Date()
        }

        setMessages(prev => [...prev, aiMessage])
        setTimeout(scrollToBottom, 100)

        // Guardar en BD (opcional)
        try {
          await supabase
            .from('interacciones_usuario')
            .insert({
              user_id: userName || 'test-user',
              mensaje_usuario: userMessage.content,
              respuesta_ia: data.message,
              fase_conversacion: Math.ceil(apiHistory.length / 2),
              numero_interaccion: apiHistory.length,
              sesion_id: sessionId,
              duracion_respuesta_ms: 0
            })
        } catch (dbError) {
          // BD opcional
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
      setTimeout(scrollToBottom, 100)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleRestart = () => {
    setMessages([])
    setHasStarted(false)
    setSessionId(null)
    setUserInput('')
  }

  // Pantalla de acceso denegado
  if (isValidAccess === false) {
    return (
      <div className="flex flex-col h-screen access-denied-screen">
        <header className="bg-white shadow-sm border-b border-red-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-primary-blue">
                Simulador Conversacional IA
              </h1>
              <p className="text-sm text-gray-700 font-medium">
                Sesión 1: Actividad de Entrada - Inteligencia Artificial para Coordinadores Educativos
              </p>
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-6">
              <div className="icon-warning">
                <span>⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Acceso No Autorizado
              </h2>
              <p className="text-white mb-6 text-lg">
                Este simulador debe ser accedido desde el aula virtual del curso. 
                Por favor, regresa al curso y haz clic en el enlace correspondiente.
              </p>
              <div className="bg-white bg-opacity-90 rounded-lg p-4 text-sm mb-6">
                <p className="text-gray-800 font-medium">
                  <strong>Instrucciones:</strong>
                </p>
                <ol className="text-left text-gray-700 mt-2 space-y-1">
                  <li>1. Ve al aula virtual del curso</li>
                  <li>2. Busca la sección del simulador</li>
                  <li>3. Haz clic en el enlace oficial</li>
                </ol>
              </div>
            </div>
            
            <button
                onClick={() => (window.location.href = "https://platform.ecala.net/course/view.php?id=37820")}
                className="btn-secondary"
              >
                Regresar al Curso
              
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading mientras verifica acceso
  if (isValidAccess === null) {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
            <p className="mt-4 text-slate-600">Verificando acceso...</p>
          </div>
        </div>
      </div>
    )
  }

  // Página de bienvenida
  if (!hasStarted) {
    return (
      <div className="flex flex-col h-screen welcome-screen">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-primary-blue">
                  Simulador Conversacional IA
                </h1>
                <p className="text-sm text-gray-700 font-medium">
                  Sesión 1: Actividad de Entrada - Inteligencia Artificial para Coordinadores Educativos
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-700 font-medium">
                  Coordinadora Académica
                </div>
                <div className="text-xs text-success-green font-medium">
                  ✅ {userName}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="icon-welcome">
                <span>🙏</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                ¡Bienvenida {userName}!
              </h2>
              <p className="text-white text-lg leading-relaxed">
                Prepárate para conversar con Alex, tu asistencia de IA educativo. 
                Aprenderás sobre prompts efectivos y comunicación digital.
              </p>
            </div>
            
            <button
              onClick={startSession}
              className="btn-primary"
            >
              Comenzar Conversación
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary-blue">
                Simulador Conversacional IA
              </h1>
              <p className="text-sm text-gray-700 font-medium">
                Sesión 1: Actividad de Entrada - Inteligencia Artificial para Coordinadores Educativos
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-700 font-medium">
                Coordinadora Académica
              </div>
              <div className="text-xs text-success-green font-medium">
                ✅ {userName}
              </div>
              {sessionId && (
                <div className="text-xs text-success-green font-medium">
                  Sesión activa
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden chat-container">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`message-bubble ${
                    message.role === 'user' ? 'message-user' : 'message-ai'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div 
                    className={`text-xs mt-2 font-medium ${
                      message.role === 'user' ? 'text-gray-600' : 'text-red-100'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="message-bubble message-ai">
                  <div className="flex items-center space-x-2">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot" style={{animationDelay: '0.1s'}}></div>
                      <div className="typing-dot" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-red-100">Alex está escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
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
                onKeyPress={handleKeyPress}
                placeholder={
                  isLoading 
                    ? "Alex está escribiendo..." 
                    : !sessionId 
                      ? "Iniciando sesión..."
                      : "Escribe tu mensaje"
                }
                disabled={isLoading || !sessionId}
                className={`flex-1 border-2 rounded-lg px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue ${
                  isLoading 
                    ? 'border-blue-300 bg-blue-50 text-blue-600' 
                    : !sessionId 
                      ? 'border-gray-300 bg-gray-50 text-gray-600'
                      : 'border-gray-300 bg-white'
                } disabled:cursor-not-allowed`}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !userInput.trim() || !sessionId}
                className="btn-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-600 text-center">
              💬 Conversación con Alex - Tu asistente educativo en inteligencia artificial
            </div>
          </div>

          {/* Quick restart */}
          <div className="bg-gray-100 p-2 text-center">
            <button
              onClick={handleRestart}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              🔄 Reiniciar conversación
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 