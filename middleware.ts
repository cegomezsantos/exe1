import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Para desarrollo: permitir acceso a todas las rutas
  // Más adelante puedes implementar autenticación aquí
  
  // Ejemplo de cómo proteger rutas cuando implementes autenticación:
  /*
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith('/simulacion')) {
    // Verificar autenticación
    const token = request.cookies.get('supabase-auth-token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  */
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 