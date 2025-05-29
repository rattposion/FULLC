export interface Statistics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  pendingOrders: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  preco1d?: number;
  preco7d?: number;
  preco30d?: number;
  precoLifetime?: number;
  tipoUso: string;
  status: string;
  imagem?: string;
  entregaAutomatica: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoriaId: number;
  categoria: Categoria;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  userId: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  delivered?: boolean;
  deliveredAt?: Date | null;
  key?: string | null;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: {
    id: number;
    nome: string;
    preco: number;
  };
  quantity: number;
  price: number;
}

export interface EmailFormData {
  recipient: string;
  subject: string;
  text: string;
}

export interface CreateProductFormData {
  nome: string;
  descricao: string;
  preco: number;
  precoOriginal: number;
  precoPromocional: number;
  tipoUso: string;
  status: string;
  categoriaId: number;
  entregaAutomatica: boolean;
  imagem?: File;
}

export interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pedido {
  id: number;
  produtoId: number;
  quantidade: number;
  endereco: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  produto?: {
    id: number;
    nome: string;
    preco: number;
  };
  user?: {
    id: number;
    username: string;
  };
} 