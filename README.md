# Simulador Conversacional IA para Coordinadores Educativos

Un simulador conversacional desarrollado con Next.js 14 que permite a coordinadores educativos practicar habilidades de comunicación a través de diálogos estructurados con inteligencia artificial.

## 🎯 Objetivo

Enseñar a coordinadores educativos cómo crear prompts efectivos para inteligencia artificial, a través de un flujo conversacional natural y una actividad práctica sobre redacción de correos educativos.

## 🔐 Control de Acceso desde Aula Virtual

El simulador está diseñado para ser accedido **exclusivamente desde el aula virtual** mediante parámetros específicos:

### Parámetros URL Requeridos

- **`max=719368`**: Código de autorización requerido (obligatorio)
- **`nam=NombreUsuario`**: Nombre del usuario para personalización

**Ejemplo de URL válida:**
```
https://tu-simulador.netlify.app/?max=719368&nam=María%20González
```

### Validación de Acceso
- ✅ **Acceso autorizado**: Si `max=719368` → permite acceso al simulador
- ❌ **Acceso denegado**: Si no existe `max` o tiene valor incorrecto → muestra página de error

## 🔧 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: API Routes de Next.js
- **Base de Datos**: Supabase (PostgreSQL)
- **IA**: Google Gemini API (modelo gemini-1.5-flash)
- **Deployment**: Compatible con Netlify/Vercel

## 📋 Características

- **🔐 Control de acceso**: Integración con aula virtual mediante parámetros URL
- **👤 Personalización**: Saludo personalizado con nombre del usuario
- **🎨 Interfaz personalizada**: Colores institucionales específicos
- **🤖 Chat conversacional natural** con Alex, asistente de IA educativo
- **📚 Flujo estructurado** de aprendizaje sobre prompts efectivos
- **🎯 Interfaz limpia** sin formato markdown disruptivo
- **💾 Gestión de sesiones** con Supabase (opcional)
- **🔄 Reinicio rápido** de conversaciones
- **📱 Responsive design** para múltiples dispositivos

## 🎨 Esquema de Colores

El simulador utiliza colores específicos para optimizar la experiencia educativa:

- **Fondo del área de chat**: `#D7ECF7` (azul claro)
- **Mensajes de la IA (Alex)**: `#00AEEF` (azul institucional)
- **Mensajes del usuario**: `#FCF5DD` (beige suave)

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

Abre [http://localhost:3000?max=719368&nam=TestUser](http://localhost:3000?max=719368&nam=TestUser) para probar la aplicación.

## 📁 Estructura del Proyecto

```
simulador-conversacional-ia/
├── app/
│   ├── page.tsx                  # Página principal con control de acceso
│   ├── conversational/           # Versión alternativa del chat
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API para comunicación con Gemini
│   ├── globals.css
│   └── layout.tsx               # Layout con Suspense para parámetros URL
├── lib/
│   ├── supabase.ts              # Configuración de Supabase
│   ├── conversationalPrompts.ts # Prompts para el flujo educativo
│   └── textUtils.ts             # Utilidades para formato de texto
└── components/
    └── SystemStatus.tsx         # Componente de estado del sistema
```

## 🎓 Flujo Educativo

El simulador guía al usuario a través de:

1. **Validación de acceso** - Verificación de parámetros del aula virtual
2. **Saludo personalizado** - Alex saluda al usuario por su nombre
3. **Introducción a la sesión** - Explicación de "Sesión 1: Actividad de Entrada"
4. **Enseñanza de prompts efectivos** - Características clave (claridad, contexto, objetivo, formato, tono)
5. **Actividad práctica** - Crear un correo para responder consulta estudiantil sobre metodología docente
6. **Reflexión y cierre** - Evaluación del aprendizaje y próximos pasos

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

## 🔗 Integración con Aula Virtual

Para integrar el simulador en tu aula virtual:

### Opción 1: Enlace Directo
```html
<a href="https://tu-simulador.netlify.app/?max=719368&nam=NombreEstudiante" target="_blank">
  Acceder al Simulador Conversacional IA
</a>
```

### Opción 2: iFrame Embebido
```html
<iframe 
  src="https://tu-simulador.netlify.app/?max=719368&nam=NombreEstudiante"
  width="100%" 
  height="800px" 
  frameborder="0">
</iframe>
```

### Opción 3: JavaScript Dinámico
```javascript
function abrirSimulador(nombreUsuario) {
  const url = `https://tu-simulador.netlify.app/?max=719368&nam=${encodeURIComponent(nombreUsuario)}`;
  window.open(url, '_blank');
}
```

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

### **Página de "Acceso Restringido"**

**Causa:** Falta el parámetro `max=719368` en la URL

**Solución:**
- ✅ Accede siempre desde el aula virtual
- ✅ Verifica que la URL incluya `?max=719368`
- ✅ Para pruebas, usa: `http://localhost:3000?max=719368&nam=TestUser`

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
# Ejecutar en modo desarrollo con parámetros de prueba
npm run dev
# Luego visita: http://localhost:3000?max=719368&nam=TestUser

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