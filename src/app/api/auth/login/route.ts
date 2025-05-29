import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Verifica se é o admin demo
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        data: {
          token: 'demo-token-123',
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@demo.com',
            isAdmin: true
          }
        }
      });
    }

    return NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    );
  }
} 