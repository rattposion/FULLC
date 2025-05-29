import { 
  Statistics, 
  User, 
  Product, 
  Categoria, 
  Order, 
  EmailFormData, 
  CreateProductFormData,
  Testimonial,
  Pedido
} from '@/types/admin';
import axios from 'axios';
import { User as PrismaUser, Product as PrismaProduct, Order as PrismaOrder, Categoria as PrismaCategoria, ProductKey } from '@prisma/client';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em requisições administrativas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.url?.startsWith('/admin')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface Key {
  id: number;
  key: string;
  status: 'disponivel' | 'usada';
  createdAt: string;
  usedAt?: string;
}

export class ApiService {
  // Autenticação
  static async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async register(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post('/auth/register', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getUserProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async createAdminDemo(): Promise<ApiResponse<{ username: string; password: string }>> {
    try {
      const response = await api.post('/auth/demo');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Pedidos
  static async getPedidos(): Promise<ApiResponse<Pedido[]>> {
    try {
      const response = await api.get('/pedidos');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin - Estatísticas
  static async getAdminStats(): Promise<ApiResponse<Statistics>> {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin - Usuários
  static async getAdminUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async toggleUserAdmin(userId: number): Promise<ApiResponse<User>> {
    try {
      const response = await api.post(`/admin/users/${userId}/toggle-admin`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin - Produtos
  static async getAdminProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get('/admin/products');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getProduct(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await api.get(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getProductKeys(id: number): Promise<ApiResponse<Key[]>> {
    try {
      const response = await api.get(`/admin/products/${id}/keys`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async addProductKeys(productId: number, keys: string[]): Promise<ApiResponse<Key[]>> {
    try {
      const response = await api.post(`/admin/products/${productId}/keys`, { keys });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async deleteProductKey(keyId: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/admin/products/keys/${keyId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async createProduct(formData: FormData): Promise<ApiResponse<Product>> {
    try {
      const response = await api.post('/admin/products', formData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async updateProduct(id: number, formData: FormData): Promise<ApiResponse<Product>> {
    try {
      const response = await api.put(`/admin/products/${id}`, formData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async toggleProductEntrega(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await api.patch(`/admin/products/${id}/toggle-entrega`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async deleteProduct(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin - Categorias
  static async getAdminCategories(): Promise<ApiResponse<Categoria[]>> {
    try {
      const response = await api.get('/admin/categories');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async createCategory(data: { nome: string; descricao: string }): Promise<ApiResponse<Categoria>> {
    try {
      const response = await api.post('/admin/categories', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async updateCategory(id: number, data: { nome: string; descricao: string }): Promise<ApiResponse<Categoria>> {
    try {
      const response = await api.put(`/admin/categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async deleteCategory(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin - Email
  static async sendEmail(data: EmailFormData): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/admin/send-email', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin - Pedidos
  static async getAdminOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await api.get('/admin/orders');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async updateOrderStatus(orderId: number, status: string): Promise<ApiResponse<Order>> {
    try {
      const response = await api.patch(`/admin/orders/${orderId}`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async deliverOrder(orderId: number): Promise<ApiResponse<{ key: string }>> {
    try {
      const response = await api.post(`/admin/orders/${orderId}/deliver`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Testimonials
  static async getTestimonials(): Promise<ApiResponse<Testimonial[]>> {
    try {
      const response = await api.get('/testimonials');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || error.message;
      return new Error(message);
    }
    return error;
  }
}

export default ApiService; 