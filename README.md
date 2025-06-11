# 🤖 Simulador Conversacional - IA para Coordinadores Educativos

Un simulador de conversación inteligente que ayuda a coordinadores académicos a aprender el uso efectivo de la inteligencia artificial para responder correos de estudiantes.

## ✨ Características

- **Conversación Natural**: Chat fluido con Alex, asistente educativo especializado
- **Aprendizaje Guiado**: Sesión estructurada sobre prompts efectivos
- **Interfaz Moderna**: Diseño profesional y responsivo
- **IA Integrada**: Powered by Google Gemini AI
- **Base de Datos**: Almacenamiento opcional con Supabase

## 🎯 Objetivo Educativo

**Sesión 1: Actividad de Entrada**
- Enseñar características de prompts efectivos (claridad, contexto, objetivo, formato, tono)
- Práctica con escenario real: responder consultas estudiantiles sobre metodología docente
- Desarrollo de habilidades conversacionales con IA

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **IA**: Google Gemini API (gemini-1.5-flash)
- **Base de Datos**: Supabase (PostgreSQL)
- **Deploy**: Vercel/Netlify ready

## 🚀 Despliegue Rápido

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tuusuario/simulador-conversacional)

## ⚙️ Configuración

### Variables de Entorno Requeridas

Crea un archivo `.env.local`:

```bash
# Google Gemini AI
GEMINI_API_KEY=tu_api_key_de_gemini

# Supabase (opcional)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/simulador-conversacional.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves

# Ejecutar en desarrollo
npm run dev

# Abrir http://localhost:3000
```

## 📱 Rutas Disponibles

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/` | Página de inicio | ✅ |
| `/simulacion-limpio` | **Simulador principal** | ✅ Recomendado |
| `/conversational` | Chat conversacional | ✅ |
| `/test` | Chat de prueba simple | ✅ |

## 🎨 Capturas de Pantalla

### Chat Conversacional
![Simulador](docs/screenshot1.png)

### Interfaz Educativa
![Interfaz](docs/screenshot2.png)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -am 'Agregar mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 👥 Autor

Desarrollado para coordinadores académicos que buscan integrar IA en su comunicación educativa.

---

**🎓 Ideal para instituciones educativas que quieren capacitar a su personal en el uso efectivo de IA conversacional.** 