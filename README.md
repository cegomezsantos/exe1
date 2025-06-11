# Simulador Conversacional IA para Coordinadores Educativos

Un simulador conversacional desarrollado con Next.js 14 que permite a coordinadores educativos practicar habilidades de comunicación a través de diálogos estructurados con inteligencia artificial.

## 🎯 Objetivo

Enseñar a coordinadores educativos cómo crear prompts efectivos para inteligencia artificial, a través de un flujo conversacional natural y una actividad práctica sobre redacción de correos educativos.

## 🔧 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: API Routes de Next.js
- **Base de Datos**: Supabase (PostgreSQL)
- **IA**: Google Gemini API (modelo gemini-1.5-flash)
- **Deployment**: Compatible con Netlify/Vercel

## 📋 Características

- **Chat conversacional natural** con Alex, asistente de IA educativo
- **Flujo estructurado** de aprendizaje sobre prompts efectivos
- **Interfaz limpia** sin formato markdown disruptivo
- **Gestión de sesiones** con Supabase (opcional)
- **Reinicio rápido** de conversaciones
- **Responsive design** para múltiples dispositivos

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd simulador-conversacional-ia
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Google Gemini API
GEMINI_API_KEY=tu_clave_de_gemini_aqui

# Supabase (opcional)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_de_supabase
```

**Para obtener tu clave de Gemini:**
1. Ve a [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Cópiala en tu archivo `.env.local`

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📁 Estructura del Proyecto

```
simulador-conversacional-ia/
├── app/
│   ├── page.tsx                  # Página principal del simulador
│   ├── conversational/           # Versión alternativa del chat
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API para comunicación con Gemini
│   ├── globals.css
│   └── layout.tsx
├── lib/
│   ├── supabase.ts              # Configuración de Supabase
│   ├── conversationalPrompts.ts # Prompts para el flujo educativo
│   └── textUtils.ts             # Utilidades para formato de texto
└── components/
    └── SystemStatus.tsx         # Componente de estado del sistema
```

## 🎓 Flujo Educativo

El simulador guía al usuario a través de:

1. **Saludo personalizado** - Alex pregunta por el nombre preferido
2. **Introducción a la sesión** - Explicación de "Sesión 1: Actividad de Entrada"
3. **Enseñanza de prompts efectivos** - Características clave (claridad, contexto, objetivo, formato, tono)
4. **Actividad práctica** - Crear un correo para responder consulta estudiantil sobre metodología docente
5. **Reflexión y cierre** - Evaluación del aprendizaje y próximos pasos

## 🗃️ Base de Datos (Opcional)

Si deseas usar Supabase, crea estas tablas:

```sql
-- Tabla de sesiones
CREATE TABLE sesiones_ejercicio (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    estado TEXT DEFAULT 'en_progreso',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de interacciones
CREATE TABLE interacciones_usuario (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    mensaje_usuario TEXT NOT NULL,
    respuesta_ia TEXT NOT NULL,
    fase_conversacion INTEGER DEFAULT 1,
    numero_interaccion INTEGER NOT NULL,
    sesion_id INTEGER REFERENCES sesiones_ejercicio(id),
    duracion_respuesta_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🌐 Deployment

### Netlify (Recomendado)

**⚠️ IMPORTANTE: Configuración de Variables de Entorno en Netlify**

1. Ve a **Site Settings > Environment Variables** en tu panel de Netlify
2. Agrega EXACTAMENTE estas variables (respeta los nombres):
   ```
   GEMINI_API_KEY = tu_clave_de_gemini
   NEXT_PUBLIC_SUPABASE_URL = tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY = tu_clave_publica_de_supabase
   ```

3. **NO uses variaciones** como `EXT_PUBLIC_SUPABASE_ANON_KEY` - esto causa errores de build

**Configuración de Build:**
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `18`

**El proyecto incluye:**
- ✅ `netlify.toml` configurado
- ✅ Plugin oficial de Next.js para Netlify
- ✅ Configuración optimizada para deployment

### Vercel
1. Importa el proyecto desde GitHub
2. Configura las variables de entorno
3. Deploy automático

## 🚨 Solución de Problemas

### **Error de Build en Netlify: "Export encountered errors"**

**Causa:** Variables de entorno mal configuradas o problemas de hidratación

**Solución:**
1. ✅ Verifica que las variables de entorno en Netlify sean EXACTAMENTE:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. ✅ No uses nombres como `EXT_PUBLIC_SUPABASE_ANON_KEY`

3. ✅ Asegúrate de que tu API key de Gemini sea válida

### **Error: "Module not found"**
- Verifica que no existan archivos temporales o rutas rotas
- Ejecuta `npm run build` localmente para verificar errores

**Error: "GEMINI_API_KEY not found"**
- Asegúrate de que el archivo `.env.local` existe localmente
- En Netlify, verifica las variables en Site Settings > Environment Variables
- Reinicia el deployment después de cambiar variables de entorno

**Chat no responde:**
- Verifica tu conexión a internet
- Confirma que la API key de Gemini es válida
- Revisa la consola del navegador para errores específicos

## 🛠️ Desarrollo

Para desarrollar nuevas características:

```bash
# Ejecutar en modo desarrollo
npm run dev

# Verificar tipos TypeScript
npm run type-check

# Construir para producción
npm run build

# Probar build de producción
npm start
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

---

Desarrollado para mejorar las habilidades de comunicación digital en el ámbito educativo. 🎓✨ 