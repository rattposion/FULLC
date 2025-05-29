import { NextResponse } from 'next/server';

// Dados simulados do usuário
const user = {
  id: 1,
  username: "admin",
  email: "admin@example.com",
  isAdmin: true,
  createdAt: "2024-03-01T00:00:00Z"
};

export async function GET() {
  try {
    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar perfil do usuário' },
      { status: 500 }
    );
  }
} 