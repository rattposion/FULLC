"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import CyberTerminal from '@/components/CyberTerminal';

export default function SettingsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2 text-cyan-400">Configurações</h1>
        <p className="text-cyan-300">Ajuste as configurações da plataforma.</p>
        <div className="mt-8 p-8 bg-gray-900/50 border border-cyan-500/20 rounded-lg text-cyan-400 text-center">
          <span className="text-cyan-500">Funcionalidade em desenvolvimento...</span>
        </div>
      </motion.div>
      <CyberTerminal outputs={logs} />
    </div>
  );
} 