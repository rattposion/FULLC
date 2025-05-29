"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import ApiService from '@/lib/api';
import CyberTerminal from '@/components/CyberTerminal';
import { Categoria } from '@/types/admin';

export default function CategoriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
      return;
    }
    fetchCategories();
  }, [user, router]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAdminCategories();
      if (response.data) {
        setCategories(response.data);
        addLog(`Categorias carregadas: ${response.data.length}`);
      }
    } catch (err) {
      setError('Erro ao carregar categorias');
      addLog('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await ApiService.createCategory({
        nome: newCategory.nome,
        descricao: newCategory.descricao
      });
      if (response.data) {
        setCategories([...categories, response.data]);
        setNewCategory({ nome: '', descricao: '' });
        setIsCreating(false);
        addLog(`Categoria "${response.data.nome}" criada com sucesso`);
      }
    } catch (err) {
      setError('Erro ao criar categoria');
      addLog('Erro ao criar categoria');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await ApiService.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      addLog(`Categoria #${id} excluída com sucesso`);
    } catch (err) {
      setError('Erro ao excluir categoria');
      addLog(`Erro ao excluir categoria #${id}`);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.nome.toLowerCase().includes(search.toLowerCase()) ||
    category.descricao.toLowerCase().includes(search.toLowerCase()) ||
    category.id.toString().includes(search)
  );

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-cyan-400">Categorias</h1>
            <p className="text-cyan-300">Gerencie as categorias de produtos.</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Nova Categoria
          </button>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-cyan-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar categorias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-cyan-500/20 rounded-lg text-cyan-300"
              />
            </div>
          </div>

          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4"
            >
              <h3 className="text-lg font-bold text-cyan-400 mb-4">Nova Categoria</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome da categoria"
                  value={newCategory.nome}
                  onChange={(e) => setNewCategory({ ...newCategory, nome: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/20 rounded-lg text-cyan-300"
                />
                <textarea
                  placeholder="Descrição da categoria"
                  value={newCategory.descricao}
                  onChange={(e) => setNewCategory({ ...newCategory, descricao: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/20 rounded-lg text-cyan-300"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newCategory.nome.trim()}
                    className={`px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 ${
                      !newCategory.nome.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Criar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="mt-4 text-cyan-300">Carregando categorias...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <FolderIcon className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-lg font-bold text-cyan-400">Categoria #{category.id}</h3>
                      </div>
                      <p className="text-cyan-300 mt-2">{category.nome}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300">{category.descricao}</p>
                    </div>
                    <div>
                      <p className="text-cyan-300">
                        Criada em: {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => router.push(`/admin/categories/${category.id}/edit`)}
                        className="p-2 text-cyan-400 hover:text-cyan-200"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-400 hover:text-red-200"
                        title="Excluir"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredCategories.length === 0 && (
                <div className="text-center text-cyan-400 py-8">
                  Nenhuma categoria encontrada.
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