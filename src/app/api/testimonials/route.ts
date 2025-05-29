// Removendo a importação do Prisma
// import { prisma } from '@/lib/prisma';

// Importando a classe ApiService para fazer a chamada HTTP
import { ApiService } from '@/lib/api';
import { Testimonial } from '@/types/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await ApiService.getTestimonials();
    
    if (response.error) {
      console.error('Erro ao buscar depoimentos:', response.error);
      return new Response(
        JSON.stringify({ error: response.error }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (!response.data) {
      return new Response(
        JSON.stringify({ error: 'Nenhum depoimento encontrado' }), 
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response(
      JSON.stringify(response.data), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Erro inesperado ao buscar depoimentos:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao buscar depoimentos' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 