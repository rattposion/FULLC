"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ApiService from '@/lib/api';
import CyberTerminal from '@/components/CyberTerminal';
import { Product } from '@/types/admin';

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await ApiService.getAdminProducts();
        if (response.data) {
          setProducts(response.data);
          addLog(`Produtos carregados: ${response.data.length}`);
        }
      } catch (err) {
        setError('Erro ao carregar produtos');
        addLog('Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, router]);

  const handleDelete = async (productId: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      setDeleting(productId);
      const response = await ApiService.deleteProduct(productId);
      
      if (!response.error) {
        setProducts(products.filter(p => p.id !== productId));
        setShowDeleteModal(false);
        setSelectedProduct(null);
        addLog(`Produto #${productId} excluído com sucesso`);
      } else {
        setError(response.error);
        addLog(`Erro ao excluir produto #${productId}: ${response.error}`);
      }
    } catch (err) {
      setError('Erro ao excluir produto');
      addLog(`Erro ao excluir produto #${productId}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleEntrega = async (productId: number) => {
    try {
      setToggling(productId);
      const response = await ApiService.toggleProductEntrega(productId);
      
      if (response.data) {
        const updatedProduct = response.data;
        setProducts(products.map(p => 
          p.id === productId ? updatedProduct : p
        ));
        addLog(`Status de entrega do produto #${productId} alterado com sucesso`);
      } else {
        setError(response.error || 'Erro ao alterar status de entrega');
        addLog(`Erro ao alterar status de entrega do produto #${productId}`);
      }
    } catch (err) {
      setError('Erro ao alterar status de entrega');
      addLog(`Erro ao alterar status de entrega do produto #${productId}`);
    } finally {
      setToggling(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nome.toLowerCase().includes(search.toLowerCase()) ||
      product.descricao.toLowerCase().includes(search.toLowerCase()) ||
      product.id.toString().includes(search);
    
    const matchesStatus = statusFilter === 'todos' || product.entregaAutomatica === (statusFilter === 'entrega');
    
    return matchesSearch && matchesStatus;
  });

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
            Gerenciar Produtos
          </h1>
          <p className="text-cyan-300">
            Gerencie os produtos da loja
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-cyan-300">Carregando produtos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="bg-gray-900/50 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none w-full md:w-64"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-900/50 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none w-full md:w-48"
                >
                  <option value="todos">Todos</option>
                  <option value="entrega">Com Entrega</option>
                  <option value="sem-entrega">Sem Entrega</option>
                </select>
              </div>
              <Link
                href="/admin/products/new"
                className="bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300 px-6 py-2 rounded-lg border border-cyan-500/50 hover:border-cyan-400 transition-colors w-full md:w-auto text-center"
              >
                Novo Produto
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4"
                >
                  <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                    {product.imagem ? (
                      <img
                        src={product.imagem}
                        alt={product.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-600">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">{product.nome}</h3>
                  <p className="text-cyan-300 mb-4 line-clamp-2">{product.descricao}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-cyan-300">R$ {product.preco.toFixed(2)}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      product.entregaAutomatica 
                        ? 'bg-green-900/50 text-green-400 border border-green-500/50' 
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {product.entregaAutomatica ? 'Com Entrega' : 'Sem Entrega'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300 px-3 py-1 rounded-lg border border-cyan-500/50 hover:border-cyan-400 transition-colors text-sm"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/keys`}
                      className="bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300 px-3 py-1 rounded-lg border border-cyan-500/50 hover:border-cyan-400 transition-colors text-sm"
                    >
                      Keys
                    </Link>
                    <button
                      onClick={() => handleToggleEntrega(product.id)}
                      disabled={toggling === product.id}
                      className="bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300 px-3 py-1 rounded-lg border border-cyan-500/50 hover:border-cyan-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {toggling === product.id ? 'Alterando...' : product.entregaAutomatica ? 'Remover Entrega' : 'Adicionar Entrega'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowDeleteModal(true);
                      }}
                      className="bg-red-900/50 hover:bg-red-800/50 text-red-400 px-3 py-1 rounded-lg border border-red-500/50 hover:border-red-400 transition-colors text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-cyan-500/50 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Confirmar Exclusão</h3>
              <p className="text-cyan-300 mb-6">
                Tem certeza que deseja excluir o produto "{selectedProduct.nome}"?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-cyan-300 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(selectedProduct.id)}
                  disabled={deleting === selectedProduct.id}
                  className="bg-red-900/50 hover:bg-red-800/50 text-red-400 px-4 py-2 rounded-lg border border-red-500/50 hover:border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting === selectedProduct.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CyberTerminal outputs={logs} />
    </div>
  );
} 