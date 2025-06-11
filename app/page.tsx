'use client'

import React, { useState, useRef } from 'react'
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
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
          user_id: 'test-user',
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

    // Enviar mensaje inicial
    await sendInitialMessage(tempSessionId)
  }

  const sendInitialMessage = async (sessionId: number) => {
    const systemPrompt = getConversationalPrompt('María', 'Coordinadora Académica')

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
              user_id: 'test-user',
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

      const systemPrompt = getConversationalPrompt('María', 'Coordinadora Académica') + 
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
              user_id: 'test-user',
              mensaje_usuario: userMessage.content,
              respuesta_ia: data.message,
              fase_conversacion: 1,
              numero_interaccion: messages.length + 1,
              sesion_id: sessionId,
              duracion_respuesta_ms: 0
            })
        } catch (dbError) {
          // BD opcional
        }
      }
    } catch (error) {
      // Error manejado silenciosamente
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
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
    setUserInput('')
    setSessionId(null)
  }

  if (!hasStarted) {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Simulador Conversacional IA
                </h1>
                <p className="text-sm text-slate-700 font-medium">
                  Sesión 1: Actividad de Entrada - Inteligencia Artificial para Coordinadores Educativos
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-700 font-medium">
                  Coordinadora Académica
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Bienvenida al Simulador!
              </h2>
              <p className="text-gray-600">
                Prepárate para conversar con Alex, tu asistente de IA educativo. 
                Aprenderás sobre prompts efectivos y comunicación digital.
              </p>
            </div>
            
            <button
              onClick={startSession}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Comenzar Conversación
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Simulador Conversacional IA
              </h1>
              <p className="text-sm text-slate-700 font-medium">
                Sesión 1: Actividad de Entrada - Inteligencia Artificial para Coordinadores Educativos
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-700 font-medium">
                Coordinadora Académica
              </div>
              {sessionId && (
                <div className="text-xs text-green-600 font-medium">
                  ✅ Sesión activa
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-slate-900 border border-blue-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div 
                    className={`text-xs mt-2 font-medium ${
                      message.role === 'user' ? 'text-blue-100' : 'text-slate-600'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-900 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-slate-600">Alex está escribiendo...</span>
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
                      : "Escribe tu mensaje..."
                }
                disabled={isLoading || !sessionId}
                className={`flex-1 border-2 rounded-lg px-4 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isLoading 
                    ? 'border-blue-300 bg-blue-50 text-blue-600' 
                    : !sessionId 
                      ? 'border-gray-300 bg-gray-50 text-gray-600'
                      : 'border-slate-300 bg-white'
                } disabled:cursor-not-allowed`}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !userInput.trim() || !sessionId}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
            
            <div className="mt-2 text-xs text-slate-600 text-center">
              💬 Conversación con Alex - Tu asistente educativo en inteligencia artificial
            </div>
          </div>

          {/* Quick restart */}
          <div className="bg-slate-100 p-2 text-center">
            <button
              onClick={handleRestart}
              className="text-sm text-slate-600 hover:text-slate-900 underline"
            >
              🔄 Reiniciar conversación
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 