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

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      recentOrders,
      popularProducts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: true,
          product: true
        }
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: {
          orders: {
            _count: 'desc'
          }
        },
        include: {
          _count: {
            select: {
              orders: true
            }
          }
        }
      })
    ]);

    // Calcular receita total
    const orders = await prisma.order.findMany({
      include: {
        product: true
      }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + (order.product?.preco || 0), 0);

    return NextResponse.json({
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
        popularProducts
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do sistema' },
      { status: 500 }
    );
  }
} 