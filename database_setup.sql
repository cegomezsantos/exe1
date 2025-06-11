-- =============================================
-- CONFIGURACIÓN COMPLETA DE BASE DE DATOS
-- Simulador Conversacional - Coordinación Educativa
-- =============================================

-- 1. TABLAS BÁSICAS DE CATÁLOGOS
-- =============================================

-- Tabla de cargos
CREATE TABLE IF NOT EXISTS cargos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de géneros
CREATE TABLE IF NOT EXISTS generos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE PERFILES DE USUARIO
-- =============================================

-- Tabla de perfiles de usuario (vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  nombre_preferido TEXT NOT NULL,
  cargo_id INTEGER REFERENCES cargos(id),
  genero_id INTEGER REFERENCES generos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA PRINCIPAL DE INTERACCIONES
-- =============================================

-- Tabla principal que registra todas las interacciones usuario-IA
CREATE TABLE IF NOT EXISTS interacciones_usuario (
  id BIGSERIAL PRIMARY KEY,
  
  -- Identificación del usuario
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Información temporal
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contenido de la conversación
  mensaje_usuario TEXT NOT NULL,
  respuesta_ia TEXT NOT NULL,
  
  -- Contexto adicional
  fase_conversacion INTEGER NOT NULL DEFAULT 1 CHECK (fase_conversacion BETWEEN 1 AND 5),
  sesion_id INTEGER, -- Para agrupar conversaciones de una misma sesión
  
  -- Metadatos útiles
  duracion_respuesta_ms INTEGER, -- Tiempo que tardó la IA en responder
  tokens_utilizados INTEGER, -- Para tracking de costos de API
  
  -- Campos para análisis
  sentimiento_usuario TEXT, -- Para análisis futuro
  categoria_interaccion TEXT, -- Tipo de interacción (pregunta, tarea, feedback, etc.)
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE SESIONES (PARA AGRUPAR INTERACCIONES)
-- =============================================

-- Tabla para agrupar conversaciones por sesión de ejercicio
CREATE TABLE IF NOT EXISTS sesiones_ejercicio (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Estado de la sesión
  estado TEXT NOT NULL DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completado', 'abandonado')),
  fase_actual INTEGER NOT NULL DEFAULT 1 CHECK (fase_actual BETWEEN 1 AND 5),
  
  -- Información de la sesión
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_fin TIMESTAMP WITH TIME ZONE,
  duracion_total_minutos INTEGER,
  
  -- Métricas de la sesión
  total_interacciones INTEGER DEFAULT 0,
  correo_final_completado BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE RESULTADOS FINALES
-- =============================================

-- Tabla para almacenar los productos finales del ejercicio
CREATE TABLE IF NOT EXISTS resultados_finales (
  id SERIAL PRIMARY KEY,
  sesion_id INTEGER REFERENCES sesiones_ejercicio(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Contenido final
  correo_final_texto TEXT,
  reflexion_final_texto TEXT,
  
  -- Evaluación automática (para futuras mejoras)
  puntuacion_automatica INTEGER CHECK (puntuacion_automatica BETWEEN 1 AND 10),
  areas_mejora JSONB, -- Almacenar feedback estructurado
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices en tabla principal de interacciones
CREATE INDEX IF NOT EXISTS idx_interacciones_user_id ON interacciones_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_interacciones_fecha_hora ON interacciones_usuario(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_interacciones_sesion_fase ON interacciones_usuario(sesion_id, fase_conversacion);
CREATE INDEX IF NOT EXISTS idx_interacciones_user_fecha ON interacciones_usuario(user_id, fecha_hora DESC);

-- Índices en sesiones
CREATE INDEX IF NOT EXISTS idx_sesiones_user_id ON sesiones_ejercicio(user_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_estado ON sesiones_ejercicio(estado);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha_inicio ON sesiones_ejercicio(fecha_inicio DESC);

-- 7. TRIGGERS PARA AUTOMATIZACIÓN
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interacciones_updated_at 
    BEFORE UPDATE ON interacciones_usuario 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sesiones_updated_at 
    BEFORE UPDATE ON sesiones_ejercicio 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar contador de interacciones en sesión
CREATE OR REPLACE FUNCTION update_session_interaction_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el contador de interacciones en la sesión
    UPDATE sesiones_ejercicio 
    SET 
        total_interacciones = (
            SELECT COUNT(*) 
            FROM interacciones_usuario 
            WHERE sesion_id = NEW.sesion_id
        ),
        fase_actual = NEW.fase_conversacion,
        updated_at = NOW()
    WHERE id = NEW.sesion_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar automáticamente las métricas de sesión
CREATE TRIGGER update_session_metrics 
    AFTER INSERT ON interacciones_usuario 
    FOR EACH ROW EXECUTE FUNCTION update_session_interaction_count();

-- 8. CONFIGURACIÓN DE SEGURIDAD (RLS)
-- =============================================

-- Habilitar Row Level Security en todas las tablas principales
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacciones_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_ejercicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_finales ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles 
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles 
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para interacciones_usuario
DROP POLICY IF EXISTS "Users can view own interactions" ON interacciones_usuario;
CREATE POLICY "Users can view own interactions" ON interacciones_usuario 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own interactions" ON interacciones_usuario;
CREATE POLICY "Users can create own interactions" ON interacciones_usuario 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para sesiones_ejercicio
DROP POLICY IF EXISTS "Users can view own sessions" ON sesiones_ejercicio;
CREATE POLICY "Users can view own sessions" ON sesiones_ejercicio 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own sessions" ON sesiones_ejercicio;
CREATE POLICY "Users can create own sessions" ON sesiones_ejercicio 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON sesiones_ejercicio;
CREATE POLICY "Users can update own sessions" ON sesiones_ejercicio 
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para resultados_finales
DROP POLICY IF EXISTS "Users can view own results" ON resultados_finales;
CREATE POLICY "Users can view own results" ON resultados_finales 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own results" ON resultados_finales;
CREATE POLICY "Users can create own results" ON resultados_finales 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. DATOS INICIALES
-- =============================================

-- Insertar cargos iniciales
INSERT INTO cargos (nombre) VALUES 
('Coordinador Académico'),
('Coordinadora Académica'),
('Director de Programa'),
('Directora de Programa'),
('Jefe de Departamento'),
('Jefa de Departamento'),
('Coordinador de Área'),
('Coordinadora de Área')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar géneros
INSERT INTO generos (nombre) VALUES 
('masculino'),
('femenino'),
('neutro')
ON CONFLICT (nombre) DO NOTHING;

-- 10. VISTAS ÚTILES PARA CONSULTAS
-- =============================================

-- Vista para obtener interacciones con información del usuario
CREATE OR REPLACE VIEW vista_interacciones_completa AS
SELECT 
    i.id,
    i.user_id,
    p.nombre_completo,
    p.nombre_preferido,
    c.nombre as cargo,
    g.nombre as genero,
    i.fecha_hora,
    i.mensaje_usuario,
    i.respuesta_ia,
    i.fase_conversacion,
    i.sesion_id,
    i.duracion_respuesta_ms,
    i.categoria_interaccion
FROM interacciones_usuario i
LEFT JOIN profiles p ON i.user_id = p.id
LEFT JOIN cargos c ON p.cargo_id = c.id
LEFT JOIN generos g ON p.genero_id = g.id
ORDER BY i.fecha_hora DESC;

-- Vista para estadísticas por usuario
CREATE OR REPLACE VIEW vista_estadisticas_usuario AS
SELECT 
    p.id as user_id,
    p.nombre_completo,
    p.nombre_preferido,
    c.nombre as cargo,
    COUNT(i.id) as total_interacciones,
    COUNT(DISTINCT i.sesion_id) as total_sesiones,
    AVG(i.duracion_respuesta_ms) as promedio_duracion_respuesta,
    MAX(i.fecha_hora) as ultima_interaccion,
    COUNT(CASE WHEN s.estado = 'completado' THEN 1 END) as sesiones_completadas
FROM profiles p
LEFT JOIN interacciones_usuario i ON p.id = i.user_id
LEFT JOIN cargos c ON p.cargo_id = c.id
LEFT JOIN sesiones_ejercicio s ON i.sesion_id = s.id
GROUP BY p.id, p.nombre_completo, p.nombre_preferido, c.nombre;

-- =============================================
-- FIN DE LA CONFIGURACIÓN
-- =============================================

-- Mostrar resumen de tablas creadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'cargos', 
    'generos', 
    'profiles', 
    'interacciones_usuario', 
    'sesiones_ejercicio', 
    'resultados_finales'
)
ORDER BY tablename; 