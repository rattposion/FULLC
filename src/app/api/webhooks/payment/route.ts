import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido não encontrado' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        product: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Buscar uma key disponível
    const availableKey = await prisma.productKey.findFirst({
      where: {
        productId: order.productId,
        status: 'disponivel'
      }
    });

    if (!availableKey) {
      return NextResponse.json({ error: 'Não há keys disponíveis' }, { status: 400 });
    }

    // Processar a entrega
    const [updatedKey, updatedOrder] = await prisma.$transaction([
      prisma.productKey.update({
        where: { id: availableKey.id },
        data: {
          status: 'usada',
          usedAt: new Date(),
          order: {
            connect: {
              id: order.id
            }
          }
        }
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'aprovado',
          key: availableKey.key
        }
      })
    ]);

    return NextResponse.json({ data: { order: updatedOrder, key: updatedKey } });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro interno do sistema' }, { status: 500 });
  }
} 