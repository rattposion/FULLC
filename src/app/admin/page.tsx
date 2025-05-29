"use client";
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaBox, FaEnvelope, FaChartLine, FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import ApiService from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Statistics, User, Product, Categoria, Order, EmailFormData } from '@/types/admin';
import { ensureNumber } from '@/utils/validation';
import dynamicImport from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  TagIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

const CyberTerminal = dynamicImport(() => import('@/components/CyberTerminal'), {
  ssr: false,
  loading: () => (
    <div className="terminal-fake w-full max-w-4xl mx-auto">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <button className="terminal-button close"></button>
          <button className="terminal-button minimize"></button>
          <button className="terminal-button maximize"></button>
        </div>
        <div className="terminal-title">Carregando Terminal...</div>
      </div>
      <div className="terminal-content">
        <p className="typing normal">Iniciando terminal...</p>
      </div>
    </div>
  )
});

export const dynamic = 'force-dynamic';

interface CreateFormData {
  nome: string;
  descricao: string;
  preco: number;
  preco1d: number;
  preco7d: number;
  preco30d: number;
  precoLifetime: number;
  tipoUso: string;
  status: string;
  imagem: File | null;
  categoriaId: string;
}

interface TerminalOutput {
  id: string;
  message: string;
  timestamp: string;
}

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-500 hover:border-purple-400 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
      </div>
      <div className="text-purple-500 text-3xl">{icon}</div>
    </div>
  </div>
);

const UsersTable = ({ users, onToggleAdmin }: { users: User[]; onToggleAdmin: (userId: number) => void }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-gray-800 rounded-lg">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="p-4 text-left text-gray-400">ID</th>
          <th className="p-4 text-left text-gray-400">Usuário</th>
          <th className="p-4 text-left text-gray-400">Email</th>
          <th className="p-4 text-left text-gray-400">Admin</th>
          <th className="p-4 text-left text-gray-400">Data de Criação</th>
          <th className="p-4 text-left text-gray-400">Ações</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
            <td className="p-4">{user.id}</td>
            <td className="p-4">{user.username}</td>
            <td className="p-4">{user.email}</td>
            <td className="p-4">{user.isAdmin ? 'Sim' : 'Não'}</td>
            <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
            <td className="p-4">
              <button
                onClick={() => onToggleAdmin(user.id)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
              >
                {user.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ProductsTable = ({
  products,
  onToggleEntrega,
  onDelete,
}: {
  products: Product[];
  onToggleEntrega: (productId: number) => void;
  onDelete: (productId: number) => void;
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-gray-800 rounded-lg">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="p-4 text-left text-gray-400">ID</th>
          <th className="p-4 text-left text-gray-400">Nome</th>
          <th className="p-4 text-left text-gray-400">Preço</th>
          <th className="p-4 text-left text-gray-400">Status</th>
          <th className="p-4 text-left text-gray-400">Entrega</th>
          <th className="p-4 text-left text-gray-400">Ações</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
            <td className="p-4">{product.id}</td>
            <td className="p-4">{product.nome}</td>
            <td className="p-4">R$ {ensureNumber(product.preco).toFixed(2)}</td>
            <td className="p-4">{product.status}</td>
            <td className="p-4">{product.entregaAutomatica ? 'Automática' : 'Manual'}</td>
            <td className="p-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => onToggleEntrega(product.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  {product.entregaAutomatica ? 'Desativar Entrega' : 'Ativar Entrega'}
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EmailForm = ({ onSend }: { onSend: (data: EmailFormData) => void }) => {
  const [formData, setFormData] = useState<EmailFormData>({
    recipient: '',
    subject: '',
    text: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-400 mb-2">Destinatário</label>
        <input
          type="email"
          value={formData.recipient}
          onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
          className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
          required
        />
      </div>
      <div>
        <label className="block text-gray-400 mb-2">Assunto</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
          required
        />
      </div>
      <div>
        <label className="block text-gray-400 mb-2">Mensagem</label>
        <textarea
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all h-32"
          required
        />
      </div>
      <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition-colors">
        Enviar Email
      </button>
    </form>
  );
};

const CreateProductModal = ({ onClose, onSave }: { onClose: () => void; onSave: (data: CreateFormData) => void }) => {
  const [formData, setFormData] = useState<CreateFormData>({
    nome: '',
    descricao: '',
    preco: 0,
    preco1d: 0,
    preco7d: 0,
    preco30d: 0,
    precoLifetime: 0,
    tipoUso: 'lifetime',
    status: 'ativo',
    imagem: null,
    categoriaId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Criar Novo Produto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all h-32"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">Preço Base</label>
              <input
                type="number"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: Number(e.target.value) })}
                className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Tipo de Uso</label>
              <select
                value={formData.tipoUso}
                onChange={(e) => setFormData({ ...formData, tipoUso: e.target.value })}
                className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
                required
              >
                <option value="lifetime">Lifetime</option>
                <option value="1d">1 Dia</option>
                <option value="7d">7 Dias</option>
                <option value="30d">30 Dias</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">Preço 1 Dia</label>
              <input
                type="number"
                value={formData.preco1d}
                onChange={(e) => setFormData({ ...formData, preco1d: Number(e.target.value) })}
                className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Preço 7 Dias</label>
              <input
                type="number"
                value={formData.preco7d}
                onChange={(e) => setFormData({ ...formData, preco7d: Number(e.target.value) })}
                className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Preço 30 Dias</label>
              <input
                type="number"
                value={formData.preco30d}
                onChange={(e) => setFormData({ ...formData, preco30d: Number(e.target.value) })}
                className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Preço Lifetime</label>
              <input
                type="number"
                value={formData.precoLifetime}
                onChange={(e) => setFormData({ ...formData, precoLifetime: Number(e.target.value) })}
                className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Imagem</label>
            <input
              type="file"
              onChange={(e) => setFormData({ ...formData, imagem: e.target.files?.[0] || null })}
              className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
              accept="image/*"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition-colors"
            >
              Criar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateCategoryModal = ({ onClose, onSave }: { onClose: () => void; onSave: (nome: string) => void }) => {
  const [nome, setNome] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(nome);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Criar Nova Categoria</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Nome da Categoria</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition-colors"
            >
              Criar Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [emailForm, setEmailForm] = useState<EmailFormData>({
    recipient: '',
    subject: '',
    text: ''
  });
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, productsRes, ordersRes] = await Promise.all([
          ApiService.getAdminStats(),
          ApiService.getAdminUsers(),
          ApiService.getAdminProducts(),
          ApiService.getAdminOrders()
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (usersRes.data) setUsers(usersRes.data);
        if (productsRes.data) setProducts(productsRes.data);
        if (ordersRes.data) setOrders(ordersRes.data);

        setTerminalOutput(prev => [...prev, { id: '1', message: 'Sistema inicializado com sucesso...', timestamp: new Date().toISOString() }]);
        addLog('Estatísticas carregadas com sucesso');
      } catch (err) {
        setError('Erro ao carregar dados');
        setTerminalOutput(prev => [...prev, { id: '2', message: 'ERRO: Falha ao inicializar sistema', timestamp: new Date().toISOString() }]);
        addLog('Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleToggleUserAdmin = async (userId: number) => {
    try {
      const response = await ApiService.toggleUserAdmin(userId);
      if (response.data) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user
        ));
      } else {
        console.error('Erro ao atualizar usuário:', response.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleToggleProductEntrega = async (productId: number) => {
    try {
      const response = await ApiService.toggleProductEntrega(productId);
      if (response.data) {
        setProducts(products.map(product => 
          product.id === productId ? { ...product, entregaAutomatica: !product.entregaAutomatica } : product
        ));
      } else {
        console.error('Erro ao atualizar produto:', response.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const response = await ApiService.deleteProduct(productId);
      if (!response.error) {
        setProducts(products.filter(product => product.id !== productId));
      } else {
        console.error('Erro ao excluir produto:', response.error);
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const handleCreateProduct = async (formData: FormData) => {
    try {
      const response = await ApiService.createProduct(formData);
      if (response.data) {
        setProducts([...products, response.data]);
        setShowCreateProductModal(false);
      } else {
        console.error('Erro ao criar produto:', response.error);
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    }
  };

  const handleCreateCategory = async (nome: string) => {
    try {
      const response = await ApiService.createCategory({
        nome,
        descricao: '' // Descrição vazia por padrão
      });
      if (response.data) {
        setCategories([...categories, response.data]);
        setShowCreateCategoryModal(false);
        addLog(`Categoria "${nome}" criada com sucesso`);
      }
    } catch (err) {
      setError('Erro ao criar categoria');
      addLog('Erro ao criar categoria');
    }
  };

  const handleSendEmail = async (data: EmailFormData) => {
    try {
      const response = await ApiService.sendEmail(data);
      if (!response.error) {
        setEmailForm({ recipient: '', subject: '', text: '' });
        alert('Email enviado com sucesso!');
      } else {
        console.error('Erro ao enviar email:', response.error);
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  };

  const statCards = [
    {
      name: 'Total de Usuários',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/50',
    },
    {
      name: 'Total de Produtos',
      value: stats?.totalProducts || 0,
      icon: ShoppingBagIcon,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/50',
    },
    {
      name: 'Pedidos Pendentes',
      value: stats?.pendingOrders || 0,
      icon: TagIcon,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/50',
    },
    {
      name: 'Receita Total',
      value: `R$ ${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-900/50',
    },
  ];

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-cyan-400">
            Dashboard
          </h1>
          <p className="text-cyan-300">
            Bem-vindo ao painel de controle
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-cyan-300">Carregando estatísticas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${stat.bgColor} border border-cyan-500/20 rounded-lg p-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-300/60 text-sm">{stat.name}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <CyberTerminal outputs={logs} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 border border-cyan-500/50 p-4 rounded-lg"
          >
            <h2 className="text-xl font-bold mb-4 text-cyan-300">Atividade Recente</h2>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="border border-cyan-500/30 p-3 rounded-lg hover:border-cyan-400 transition-colors"
                >
                  <p className="text-cyan-300">Pedido #{order.id}</p>
                  <p className="text-sm text-cyan-400/80">
                    Status: {order.status}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}