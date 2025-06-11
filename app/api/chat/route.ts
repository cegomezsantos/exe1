import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Inicializar la IA de Google con la clave API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, systemPrompt, userMessage } = body

    // Validar que tenemos los datos necesarios
    if (!userMessage) {
      return NextResponse.json(
        { error: 'Mensaje del usuario es requerido' },
        { status: 400 }
      )
    }
    
    // Validar que tenemos la API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY no configurada' },
        { status: 500 }
      )
    }

    // Obtener el modelo Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Construir el historial de conversación para Gemini
    const validMessages = messages.filter((msg: any) => msg.role !== 'system')
    const history = validMessages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    // Asegurar que si hay historial, el último mensaje no sea del modelo
    // (porque estamos a punto de enviar el nuevo mensaje del usuario)
    if (history.length > 0 && history[history.length - 1].role === 'model') {
      // El último mensaje ya es del modelo, así que quitamos el userMessage del prompt
      // ya que Gemini lo manejará como continuación
    }

    // Crear chat con historial si está disponible y es válido
    let chat
    if (history.length === 0 || history[0].role !== 'user') {
      // Sin historial o historial inválido, crear chat limpio
      chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      })
    } else {
      // Historial válido, crear chat con contexto
      chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      })
    }

    // Construir el prompt completo
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userMessage}` : userMessage

    // Enviar mensaje y obtener respuesta
    const result = await chat.sendMessage(fullPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      success: true,
      message: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 