import { NextResponse } from 'next/server';

// Dados simulados de usuários
const usuarios = [
  {
    id: 1,
    username: "admin",
    email: "admin@demo.com",
    isAdmin: true,
    createdAt: "2024-03-01T00:00:00Z"
  },
  {
    id: 2,
    username: "joao123",
    email: "joao@email.com",
    isAdmin: false,
    createdAt: "2024-03-10T14:30:00Z"
  },
  {
    id: 3,
    username: "maria456",
    email: "maria@email.com",
    isAdmin: false,
    createdAt: "2024-03-12T09:15:00Z"
  }
];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ data: usuarios });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
} 