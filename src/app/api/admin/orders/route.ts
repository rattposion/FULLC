import { NextResponse } from 'next/server';

// Dados simulados de pedidos
const pedidos = [
  {
    id: 1,
    usuario: "joao123",
    produtos: [
      { id: 1, nome: "Cyberpunk 2077", quantidade: 1, preco: 199.90 }
    ],
    total: 199.90,
    status: "pendente",
    data: "2024-03-15T10:30:00Z"
  },
  {
    id: 2,
    usuario: "maria456",
    produtos: [
      { id: 2, nome: "Headset Gamer RGB", quantidade: 1, preco: 299.90 },
      { id: 3, nome: "Teclado Mecânico", quantidade: 1, preco: 399.90 }
    ],
    total: 699.80,
    status: "entregue",
    data: "2024-03-14T15:45:00Z"
  }
];

export async function GET() {
  try {
    return NextResponse.json({ data: pedidos });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
} 