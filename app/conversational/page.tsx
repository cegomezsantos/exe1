'use client'

import React, { useState, useEffect, useRef } from 'react'
import { getConversationalPrompt } from '@/lib/conversationalPrompts'
import { formatChatText } from '@/lib/textUtils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ConversationalChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('María')
  const [sessionStarted, setSessionStarted] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!sessionStarted) {
      sendInitialMessage()
      setSessionStarted(true)
    }
  }, [sessionStarted])

  const sendInitialMessage = async () => {
    const systemPrompt = getConversationalPrompt(userName, 'Coordinadora Académica')
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          systemPrompt,
          userMessage: 'Iniciar conversación de forma natural'
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        const initialMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: formatChatText(data.message),
          timestamp: new Date()
        }
        setMessages([initialMessage])
      }
          } catch (error) {
        // Error manejado silenciosamente
      }
  }

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsLoading(true)

    try {
      // Construir todo el contexto de la conversación
      const conversationHistory = [...messages, userMessage]
      
      // Preparar historial para la API (solo user y assistant)
      const apiHistory = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const systemPrompt = getConversationalPrompt(userName, 'Coordinadora Académica') + 
        `\n\nCONTEXTO ACTUAL: Esta conversación ya tiene ${apiHistory.length} mensajes. Lee todo el historial y responde SOLO a lo que el usuario acaba de decir, sin repetir información ya establecida.`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      }
    } catch (error) {
      // Error manejado silenciosamente
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chat Conversacional - Inteligencia Artificial
              </h1>
              <p className="text-sm text-slate-700 font-medium">
                Sesión 1: Actividad de Entrada - Flujo Natural
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-700 font-medium">
                Coordinadora Académica
              </div>
              <div className="text-xs text-green-600 font-medium">
                💬 Conversación fluida activada
              </div>
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
                    : "Escribe tu mensaje de forma natural..."
                }
                disabled={isLoading}
                className={`flex-1 border-2 rounded-lg px-4 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isLoading 
                    ? 'border-blue-300 bg-blue-50 text-blue-600' 
                    : 'border-slate-300 bg-white'
                } disabled:cursor-not-allowed`}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !userInput.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
            
            <div className="mt-2 text-xs text-slate-600 text-center">
              💡 Esta conversación fluye naturalmente - Alex se adaptará a tu ritmo
            </div>
          </div>

          {/* Quick restart */}
          <div className="bg-slate-100 p-2 text-center">
            <button
              onClick={() => {
                setMessages([])
                setSessionStarted(false)
                setUserInput('')
              }}
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