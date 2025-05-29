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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        product: true,
        user: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    if (order.status === 'entregue') {
      return NextResponse.json({ error: 'Pedido já foi entregue' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(params.id) },
      data: {
        status: 'entregue',
        deliveredAt: new Date()
      },
      include: {
        product: true,
        user: true
      }
    });

    return NextResponse.json({ data: updatedOrder });
  } catch (error) {
    console.error('Erro ao entregar pedido:', error);
    return NextResponse.json({ error: 'Erro interno do sistema' }, { status: 500 });
  }
} 