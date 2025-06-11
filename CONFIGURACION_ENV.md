# 🔧 Configuración de Variables de Entorno

## Problema Común
Si ves este error:
```
Error: either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!
```

## Solución

### 1. Crear archivo .env.local
Crea un archivo llamado `.env.local` en la raíz de tu proyecto (mismo nivel que `package.json`) con este contenido:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Google Gemini AI
GEMINI_API_KEY=tu_clave_api_de_gemini_aqui
```

### 2. Obtener las claves de Supabase

1. **Ve a tu proyecto en Supabase**: https://supabase.com/dashboard
2. **Selecciona tu proyecto**
3. **Ve a Settings → API**
4. **Copia estos valores**:
   - **Project URL** → Esta es tu `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Esta es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Obtener la clave de Google Gemini

1. **Ve a Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Crea una nueva API Key**
3. **Cópiala como** `GEMINI_API_KEY`

### 4. Ejemplo de archivo .env.local completo

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjM5Nzg1MywiZXhwIjoxOTUxOTczODUzfQ.example

# Google Gemini AI
GEMINI_API_KEY=AIzaSyA-example-key-12345
```

### 5. Verificar que funciona

Después de crear el archivo `.env.local`:

1. **Reinicia el servidor de desarrollo**:
   ```bash
   # Presiona Ctrl+C para detener el servidor
   npm run dev
   ```

2. **Verifica en la consola** que no aparezcan errores relacionados con las variables de entorno

### 6. Notas importantes

- **El archivo .env.local NO debe subirse a GitHub** (ya está en .gitignore)
- **Las variables que empiezan con NEXT_PUBLIC_** están disponibles en el frontend
- **Las variables sin NEXT_PUBLIC_** solo están disponibles en el servidor
- **Reinicia siempre el servidor** después de cambiar variables de entorno

### 7. Troubleshooting

Si sigues teniendo problemas:

1. **Verifica el nombre del archivo**: Debe ser exactamente `.env.local`
2. **Verifica la ubicación**: Debe estar en la raíz del proyecto
3. **Verifica el formato**: No debe haber espacios alrededor del `=`
4. **Reinicia el servidor**: Siempre necesario después de cambios
5. **Verifica las claves**: Cópialas exactamente desde Supabase/Google

### 8. Estructura de archivos correcta

```
tu-proyecto/
├── .env.local          ← Aquí debe estar
├── package.json
├── next.config.js
├── app/
└── lib/
``` 