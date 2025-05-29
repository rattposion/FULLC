import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Credenciais fixas para o admin demo
    const adminDemo = {
      username: 'admin',
      password: 'admin123'
    };

    return NextResponse.json({
      data: adminDemo
    });
  } catch (error) {
    console.error('Erro ao criar admin demo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar admin demo' },
      { status: 500 }
    );
  }
} 