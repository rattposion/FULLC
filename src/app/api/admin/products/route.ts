import { NextResponse } from 'next/server';

// Dados simulados de produtos
const produtos = [
  {
    id: 1,
    nome: "Cyberpunk 2077",
    descricao: "RPG de ação e aventura em mundo aberto",
    preco: 199.90,
    estoque: 50,
    categoria: "Games",
    imagem: "https://via.placeholder.com/300x300",
    destaque: true
  },
  {
    id: 2,
    nome: "Headset Gamer RGB",
    descricao: "Headset com iluminação RGB e microfone",
    preco: 299.90,
    estoque: 30,
    categoria: "Periféricos",
    imagem: "https://via.placeholder.com/300x300",
    destaque: true
  },
  {
    id: 3,
    nome: "Teclado Mecânico",
    descricao: "Teclado mecânico com switches blue",
    preco: 399.90,
    estoque: 20,
    categoria: "Periféricos",
    imagem: "https://via.placeholder.com/300x300",
    destaque: false
  }
];

export async function GET() {
  try {
    return NextResponse.json({ data: produtos });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const novoProduto = {
      id: produtos.length + 1,
      ...formData,
      destaque: false
    };
    produtos.push(novoProduto);
    return NextResponse.json({ data: novoProduto });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    );
  }
} 