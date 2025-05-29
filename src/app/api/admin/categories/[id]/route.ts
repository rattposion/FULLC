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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null;

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const category = await prisma.categoria.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null;

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { nome } = body;

    if (!nome) {
      return new NextResponse('Nome é obrigatório', { status: 400 });
    }

    const category = await prisma.categoria.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        nome,
      },
    });

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null;

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.categoria.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 