'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import ApiService from '@/lib/api';
import CyberTerminal from '@/components/CyberTerminal';
import { Order } from '@/types/admin';

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [delivering, setDelivering] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [user, router]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAdminOrders();
      if (response.data) {
        setOrders(response.data);
        addLog(`Pedidos carregados: ${response.data.length}`);
      }
    } catch (err) {
      setError('Erro ao carregar pedidos');
      addLog('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (orderId: number) => {
    try {
      setDelivering(orderId);
      const response = await ApiService.deliverOrder(orderId);
      const deliveryKey = response.data?.key;
      
      if (deliveryKey) {
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, delivered: true, deliveredAt: new Date(), key: deliveryKey }
            : order
        ));
        addLog(`Pedido #${orderId} entregue com sucesso. Key: ${deliveryKey}`);
      } else {
        throw new Error('Chave de entrega não recebida');
      }
    } catch (err) {
      setError('Erro ao processar entrega');
      addLog(`Erro ao processar entrega do pedido #${orderId}`);
    } finally {
      setDelivering(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-900/50 text-yellow-400';
      case 'aprovado':
        return 'bg-green-900/50 text-green-400';
      case 'cancelado':
        return 'bg-red-900/50 text-red-400';
      default:
        return 'bg-gray-900/50 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <ClockIcon className="w-5 h-5" />;
      case 'aprovado':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'cancelado':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.user.username.toLowerCase().includes(search.toLowerCase()) ||
      order.items.some(item => 
        item.product.nome.toLowerCase().includes(search.toLowerCase())
      ) ||
      order.id.toString().includes(search);
    
    const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2 text-cyan-400">Pedidos</h1>
        <p className="text-cyan-300">Gerencie os pedidos da plataforma.</p>

        <div className="mt-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-cyan-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-cyan-500/20 rounded-lg text-cyan-300"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-900/50 border border-cyan-500/20 rounded-lg text-cyan-300"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="mt-4 text-cyan-300">Carregando pedidos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-cyan-400">Pedido #{order.id}</h3>
                      <p className="text-cyan-300">Cliente: {order.user.username}</p>
                      <p className="text-cyan-300">Email: {order.user.email}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300">Produtos:</p>
                      {order.items.map((item, index) => (
                        <div key={index} className="text-cyan-300 ml-4">
                          <p>{item.product.nome} x{item.quantity}</p>
                          <p>R$ {item.price.toFixed(2)}</p>
                        </div>
                      ))}
                      <p className="text-cyan-300 mt-2">Total: R$ {order.total.toFixed(2)}</p>
                      <p className="text-cyan-300">Data: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                          order.delivered 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-yellow-900/50 text-yellow-400'
                        }`}>
                          {order.delivered ? <CheckCircleIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
                          {order.delivered ? 'Entregue' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      {order.delivered && order.key && (
                        <div className="bg-gray-800/50 p-2 rounded border border-cyan-500/20">
                          <p className="text-cyan-300 text-sm">Key: {order.key}</p>
                        </div>
                      )}
                      {order.status === 'aprovado' && !order.delivered && (
                        <button
                          onClick={() => handleDeliver(order.id)}
                          disabled={delivering === order.id}
                          className={`px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors ${
                            delivering === order.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {delivering === order.id ? 'Processando...' : 'Entregar'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredOrders.length === 0 && (
                <div className="text-center text-cyan-400 py-8">
                  Nenhum pedido encontrado.
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      <CyberTerminal outputs={logs} />
    </div>
  );
} 