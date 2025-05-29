'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/api';
import { motion } from 'framer-motion';
import { Categoria } from '@/types/admin';

export const dynamic = 'force-dynamic';

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    preco1d: '',
    preco7d: '',
    preco30d: '',
    precoLifetime: '',
    tipoUso: 'lifetime',
    status: 'ativo',
    imagem: null as File | null,
    categoriaId: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await ApiService.getAdminCategories();
        if (response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isAdmin) return;

    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value);
        }
      });

      const response = await ApiService.createProduct(formDataToSend);
      
      if (response.data) {
        router.push('/admin/products');
      } else {
        setError(response.error || 'Erro ao criar produto');
      }
    } catch (err) {
      setError('Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, imagem: file }));
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-cyan-400">
            Novo Produto
          </h1>
          <p className="text-cyan-300">
            Adicione um novo produto à plataforma
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 border border-cyan-500/50 p-6 rounded-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cyan-300 mb-2">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-cyan-300 mb-2">Categoria</label>
                <select
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-cyan-300 mb-2">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none h-32"
                  required
                />
              </div>

              <div>
                <label className="block text-cyan-300 mb-2">Preço Base</label>
                <input
                  type="number"
                  name="preco"
                  value={formData.preco}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-cyan-300 mb-2">Tipo de Uso</label>
                <select
                  name="tipoUso"
                  value={formData.tipoUso}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
                  required
                >
                  <option value="lifetime">Lifetime</option>
                  <option value="1d">1 Dia</option>
                  <option value="7d">7 Dias</option>
                  <option value="30d">30 Dias</option>
                </select>
              </div>

              <div>
                <label className="block text-cyan-300 mb-2">Preço 1 Dia</label>
                <input
                  type="number"
                  name="preco1d"
                  value={formData.preco1d}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-cyan-300 mb-2">Preço 7 Dias</label>
                <input
                  type="number"
                  name="preco7d"
                  value={formData.preco7d}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-cyan-300 mb-2">Preço 30 Dias</label>
                <input
                  type="number"
                  name="preco30d"
                  value={formData.preco30d}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-cyan-300 mb-2">Preço Lifetime</label>
                <input
                  type="number"
                  name="precoLifetime"
                  value={formData.precoLifetime}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-cyan-300 mb-2">Imagem</label>
                <input
                  type="file"
                  name="imagem"
                  onChange={handleFileChange}
                  className="w-full bg-gray-800 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
                  accept="image/*"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-800 hover:bg-gray-700 text-cyan-400 px-6 py-2 rounded-lg border border-cyan-500/50 hover:border-cyan-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300 px-6 py-2 rounded-lg border border-cyan-500/50 hover:border-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando...' : 'Criar Produto'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 