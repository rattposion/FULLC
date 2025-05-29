import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Session } from 'next-auth';

interface SessionWithUser extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAdmin: boolean;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null;

    if (!session?.user?.isAdmin) {
      return new NextResponse('Acesso Negado', { status: 401 });
    }

    const categories = await prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            produtos: true
          }
        }
      }
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return new NextResponse('Erro Interno do Sistema', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null;

    if (!session?.user?.isAdmin) {
      return new NextResponse('Acesso Negado', { status: 401 });
    }

    const body = await request.json();
    const { nome } = body;

    if (!nome) {
      return new NextResponse('Nome é obrigatório', { status: 400 });
    }

    const category = await prisma.categoria.create({
      data: {
        nome,
      },
    });

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return new NextResponse('Erro Interno do Sistema', { status: 500 });
  }
} 