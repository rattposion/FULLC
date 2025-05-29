'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/api';
import { motion } from 'framer-motion';
import { Product } from '@/types/admin';

export const dynamic = 'force-dynamic';

interface Key {
  id: number;
  key: string;
  status: 'disponivel' | 'usada';
  createdAt: string;
  usedAt?: string;
}

export default function ProductKeysPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<Key[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [newKeys, setNewKeys] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const productId = parseInt(params.id);
        if (isNaN(productId)) {
          throw new Error('ID do produto inválido');
        }

        const [productRes, keysRes] = await Promise.all([
          ApiService.getProduct(productId),
          ApiService.getProductKeys(productId)
        ]);

        if (productRes.data) setProduct(productRes.data);
        if (keysRes.data) setKeys(keysRes.data);
      } catch (err) {
        setError('Erro ao carregar dados do produto');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router, params.id]);

  const handleAddKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeys.trim()) return;

    try {
      setUploading(true);
      const productId = parseInt(params.id);
      if (isNaN(productId)) {
        throw new Error('ID do produto inválido');
      }

      const keysList = newKeys.split('\n').map(key => key.trim()).filter(Boolean);
      
      const response = await ApiService.addProductKeys(productId, keysList);
      
      if (response.data) {
        setKeys([...keys, ...response.data]);
        setNewKeys('');
      } else {
        setError(response.error || 'Erro ao adicionar keys');
      }
    } catch (err) {
      setError('Erro ao adicionar keys');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteKey = async (keyId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta key?')) return;

    try {
      const response = await ApiService.deleteProductKey(keyId);
      
      if (!response.error) {
        setKeys(keys.filter(key => key.id !== keyId));
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Erro ao excluir key');
    }
  };

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
            Gerenciar Keys - {product?.nome}
          </h1>
          <p className="text-cyan-300">
            Gerencie as keys do produto
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-cyan-300">Carregando dados...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 border border-cyan-500/50 p-6 rounded-lg"
            >
              <h2 className="text-xl font-bold mb-4 text-cyan-300">Adicionar Keys</h2>
              <form onSubmit={handleAddKeys} className="space-y-4">
                <div>
                  <label className="block text-cyan-300 mb-2">Keys (uma por linha)</label>
                  <textarea
                    value={newKeys}
                    onChange={(e) => setNewKeys(e.target.value)}
                    className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none h-32"
                    placeholder="XXXXX-XXXXX-XXXXX"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading || !newKeys.trim()}
                  className="bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300 px-6 py-2 rounded-lg border border-cyan-500/50 hover:border-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Adicionando...' : 'Adicionar Keys'}
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 border border-cyan-500/50 p-6 rounded-lg"
            >
              <h2 className="text-xl font-bold mb-4 text-cyan-300">Keys Disponíveis</h2>
              <div className="space-y-4">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg border border-cyan-500/30"
                  >
                    <div>
                      <p className="text-cyan-300 font-mono">{key.key}</p>
                      <p className="text-sm text-cyan-400/80">
                        Status: {key.status === 'disponivel' ? 'Disponível' : 'Usada'}
                      </p>
                      {key.usedAt && (
                        <p className="text-sm text-cyan-400/60">
                          Usada em: {new Date(key.usedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {key.status === 'disponivel' && (
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="bg-red-900/50 hover:bg-red-800/50 text-red-400 px-3 py-1 rounded-lg border border-red-500/50 hover:border-red-400 transition-colors"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 