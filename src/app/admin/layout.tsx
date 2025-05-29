'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  TagIcon, 
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
    }
  }, [user, router]);

  if (!user?.isAdmin) return null;

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Produtos', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Pedidos', href: '/admin/orders', icon: TagIcon },
    { name: 'Usuários', href: '/admin/users', icon: UsersIcon },
    { name: 'Categorias', href: '/admin/categories', icon: ChartBarIcon },
    { name: 'Configurações', href: '/admin/settings', icon: CogIcon },
  ];

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-gray-900/90 border-r border-cyan-500/20 p-4 flex flex-col"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-cyan-400 mb-2">CyberAdmin</h1>
          <p className="text-cyan-300/60 text-sm">Painel de Controle</p>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-cyan-500/10 transition-colors group"
                >
                  <item.icon className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                  <span className="text-cyan-300 group-hover:text-cyan-200">
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-4 border-t border-cyan-500/20">
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-colors w-full text-red-400 hover:text-red-300"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 