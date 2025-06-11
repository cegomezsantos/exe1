-- =============================================
-- TABLA PRINCIPAL DE INTERACCIONES USUARIO-IA
-- Estructura simple y enfocada en acumular el desarrollo del alumno
-- =============================================

-- Tabla principal que registra cada intercambio completo
CREATE TABLE interacciones_usuario (
  id BIGSERIAL PRIMARY KEY,
  
  -- Identificador del usuario (puedes usar TEXT si no usas auth de Supabase)
  user_id UUID NOT NULL, -- o TEXT si prefieres usar identificadores propios
  
  -- Información temporal - LA HORA como solicitaste
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- EL MENSAJE DEL USUARIO - exactamente como lo escribió
  mensaje_usuario TEXT NOT NULL,
  
  -- LA INTERVENCIÓN DE LA IA - respuesta completa
  respuesta_ia TEXT NOT NULL,
  
  -- Información contextual útil
  fase_conversacion INTEGER NOT NULL DEFAULT 1 CHECK (fase_conversacion BETWEEN 1 AND 5),
  numero_interaccion INTEGER NOT NULL DEFAULT 1, -- Para saber qué número de mensaje es en la conversación
  
  -- Información adicional que puede ser útil
  sesion_id INTEGER, -- Para agrupar una conversación completa
  duracion_respuesta_ms INTEGER, -- Cuánto tardó la IA en responder
  
  -- Timestamps automáticos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX idx_interacciones_user_id ON interacciones_usuario(user_id);
CREATE INDEX idx_interacciones_fecha_hora ON interacciones_usuario(fecha_hora DESC);
CREATE INDEX idx_interacciones_user_fecha ON interacciones_usuario(user_id, fecha_hora DESC);

-- =============================================
-- EJEMPLOS DE CONSULTAS ÚTILES
-- =============================================

-- 1. Ver todas las interacciones de un usuario específico ordenadas por tiempo
/*
SELECT 
    id,
    fecha_hora,
    fase_conversacion,
    numero_interaccion,
    mensaje_usuario,
    respuesta_ia
FROM interacciones_usuario 
WHERE user_id = 'tu-user-id-aqui'
ORDER BY fecha_hora ASC;
*/

-- 2. Ver el progreso de un usuario (cuántas interacciones por fase)
/*
SELECT 
    user_id,
    fase_conversacion,
    COUNT(*) as total_interacciones,
    MIN(fecha_hora) as primera_interaccion_fase,
    MAX(fecha_hora) as ultima_interaccion_fase
FROM interacciones_usuario 
WHERE user_id = 'tu-user-id-aqui'
GROUP BY user_id, fase_conversacion
ORDER BY fase_conversacion;
*/

-- 3. Ver la última conversación de cada usuario
/*
SELECT DISTINCT ON (user_id)
    user_id,
    fecha_hora,
    fase_conversacion,
    mensaje_usuario,
    respuesta_ia
FROM interacciones_usuario
ORDER BY user_id, fecha_hora DESC;
*/

-- 4. Estadísticas generales por usuario
/*
SELECT 
    user_id,
    COUNT(*) as total_interacciones,
    MIN(fecha_hora) as primera_sesion,
    MAX(fecha_hora) as ultima_sesion,
    MAX(fase_conversacion) as fase_maxima_alcanzada,
    AVG(duracion_respuesta_ms) as promedio_tiempo_respuesta
FROM interacciones_usuario
GROUP BY user_id
ORDER BY ultima_sesion DESC;
*/

-- =============================================
-- INSERCIÓN DE DATOS DE EJEMPLO
-- =============================================

-- Ejemplo de cómo insertar una interacción
/*
INSERT INTO interacciones_usuario (
    user_id,
    mensaje_usuario,
    respuesta_ia,
    fase_conversacion,
    numero_interaccion,
    sesion_id,
    duracion_respuesta_ms
) VALUES (
    'usuario-123', -- Tu identificador de usuario
    'Hola, trabajo como coordinadora académica en una universidad privada',
    'Hola estimada coordinadora. Es un placer conocerte. Me llamo Alex y seré tu asistente en este ejercicio...',
    1, -- Fase 1: Contextualización
    1, -- Primera interacción
    1, -- Sesión número 1
    1200 -- Tardó 1.2 segundos en responder
);
*/ 