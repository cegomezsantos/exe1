import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

// Tipos para las tablas de la base de datos
export interface Profile {
  id: string
  nombre_completo: string
  nombre_preferido: string
  cargo_id: number
  genero_id: number
  created_at: string
}

export interface Cargo {
  id: number
  nombre: string
}

export interface Genero {
  id: number
  nombre: string
}

export interface SesionEjercicio {
  id: number
  user_id: string
  estado: string
  created_at: string
}

export interface InteraccionUsuario {
  id: number
  user_id: string
  fecha_hora: string
  mensaje_usuario: string
  respuesta_ia: string
  fase_conversacion: number
  numero_interaccion: number
  sesion_id?: number
  duracion_respuesta_ms?: number
  created_at: string
}

export interface Conversacion {
  id: number
  sesion_id: number
  emisor: 'IA' | 'usuario'
  contenido_mensaje: string
  created_at: string
}

export interface ResultadoFinal {
  id: number
  sesion_id: number
  correo_final_texto: string
  reflexion_final_texto: string
  created_at: string
} 