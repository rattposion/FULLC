"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ShieldExclamationIcon,
  UserPlusIcon,
  UserMinusIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import ApiService from '@/lib/api';
import CyberTerminal from '@/components/CyberTerminal';
import { User } from '@/types/admin';

export const dynamic = 'force-dynamic';

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [toggling, setToggling] = useState<number | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await ApiService.getAdminUsers();
        if (response.data) {
          setUsers(response.data);
          addLog(`Usuários carregados: ${response.data.length}`);
        }
      } catch (err) {
        setError('Erro ao carregar usuários');
        addLog('Erro ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, router]);

  const handleToggleAdmin = async (userId: number) => {
    try {
      setToggling(userId);
      const response = await ApiService.toggleUserAdmin(userId);
      
      if (response.data) {
        const updatedUser = response.data;
        setUsers(users.map(u => 
          u.id === userId ? updatedUser : u
        ));
        addLog(`Status de admin do usuário #${userId} alterado com sucesso`);
      } else {
        setError(response.error || 'Erro ao alterar status de admin');
        addLog(`Erro ao alterar status de admin do usuário #${userId}`);
      }
    } catch (err) {
      setError('Erro ao alterar status de admin');
      addLog(`Erro ao alterar status de admin do usuário #${userId}`);
    } finally {
      setToggling(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toString().includes(search);
    
    const matchesStatus = statusFilter === 'todos' || user.isAdmin === (statusFilter === 'admin');
    
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
            Gerenciar Usuários
          </h1>
          <p className="text-cyan-300">
            Gerencie os usuários da plataforma
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-cyan-300">Carregando usuários...</p>
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
                  placeholder="Buscar usuários..."
                  className="bg-gray-900/50 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none w-full md:w-64"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-900/50 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none w-full md:w-48"
                >
                  <option value="todos">Todos</option>
                  <option value="admin">Administradores</option>
                  <option value="usuario">Usuários</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-cyan-400">{user.username}</h3>
                      <p className="text-cyan-300">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.isAdmin 
                        ? 'bg-green-900/50 text-green-400 border border-green-500/50' 
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {user.isAdmin ? 'Administrador' : 'Usuário'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-cyan-300 text-sm">
                      Criado em: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleToggleAdmin(user.id)}
                      disabled={toggling === user.id}
                      className="bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300 px-3 py-1 rounded-lg border border-cyan-500/50 hover:border-cyan-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {toggling === user.id ? 'Alterando...' : user.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
      <CyberTerminal outputs={logs} />
    </div>
  );
} 