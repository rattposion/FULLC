import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verifica se é uma rota que requer autenticação
  if (request.nextUrl.pathname.startsWith('/api/admin') || 
      request.nextUrl.pathname.startsWith('/api/auth/profile')) {
    const token = request.headers.get('authorization')?.split(' ')[1];

    // Para fins de demonstração, aceita qualquer token
    if (token) {
      return NextResponse.next();
    }

    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*', '/api/auth/profile'],
}; 