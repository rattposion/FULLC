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

// GET /api/admin/products/[id]/keys
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const keys = await prisma.productKey.findMany({
      where: {
        productId: parseInt(params.id)
      },
      include: {
        order: true
      }
    });

    return NextResponse.json({ data: keys });
  } catch (error) {
    console.error('Erro ao buscar chaves:', error);
    return NextResponse.json({ error: 'Erro interno do sistema' }, { status: 500 });
  }
}

// POST /api/admin/products/[id]/keys
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { keys } = body;

    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: 'Lista de chaves inválida' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const createdKeys = await prisma.productKey.createMany({
      data: keys.map((key: string) => ({
        key,
        productId: parseInt(params.id),
        status: 'disponivel'
      }))
    });

    return NextResponse.json({ 
      data: { 
        message: `${createdKeys.count} keys adicionadas com sucesso`,
        count: createdKeys.count
      } 
    });
  } catch (error) {
    console.error('Erro ao criar chaves:', error);
    return NextResponse.json({ error: 'Erro interno do sistema' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]/keys/[keyId]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; keyId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const key = await prisma.productKey.findUnique({
      where: { id: parseInt(params.keyId) }
    });

    if (!key) {
      return NextResponse.json({ error: 'Key não encontrada' }, { status: 404 });
    }

    if (key.status === 'usada') {
      return NextResponse.json({ error: 'Não é possível excluir uma key já utilizada' }, { status: 400 });
    }

    await prisma.productKey.delete({
      where: { id: parseInt(params.keyId) }
    });

    return NextResponse.json({ data: { message: 'Key excluída com sucesso' } });
  } catch (error) {
    console.error('Erro ao excluir key:', error);
    return NextResponse.json({ error: 'Erro interno do sistema' }, { status: 500 });
  }
} 