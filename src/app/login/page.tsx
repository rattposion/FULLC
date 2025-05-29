"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CyberTerminal from '@/components/CyberTerminal';
import BackgroundEffects from '@/components/BackgroundEffects';
import Link from 'next/link';
import { TerminalOutput } from '@/types/terminal';
import '../login/styles.css';
import { ApiService } from '@/lib/api';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutputs([]);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('Credenciais inválidas');
        setOutputs(prev => [...prev, {
          id: Date.now().toString(),
          message: 'ERRO: Credenciais inválidas. Tente novamente.',
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        setOutputs(prev => [...prev, {
          id: Date.now().toString(),
          message: 'Login realizado com sucesso!',
          timestamp: new Date().toLocaleTimeString()
        }]);
        router.push('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      setOutputs(prev => [...prev, {
        id: Date.now().toString(),
        message: `Erro: ${errorMessage}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminalCommand = async (command: string) => {
    if (command.startsWith('login ')) {
      const [_, ...args] = command.split(' ');
      if (args.length !== 2) {
        setOutputs(prev => [...prev, {
          id: Date.now().toString(),
          message: 'Uso: login <username> <password>',
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }
      setUsername(args[0]);
      setPassword(args[1]);
      await handleLogin(new Event('submit') as any);
    } else if (command === 'clear') {
      setOutputs([]);
    } else if (command === 'help') {
      setOutputs(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          message: 'Comandos disponíveis:',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          id: Date.now().toString(),
          message: 'login <username> <password> - Fazer login',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          id: Date.now().toString(),
          message: 'clear - Limpar terminal',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          id: Date.now().toString(),
          message: 'help - Mostrar ajuda',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } else {
      setOutputs(prev => [...prev, {
        id: Date.now().toString(),
        message: `Comando não reconhecido: ${command}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const handleCreateDemo = async () => {
    try {
      setLoading(true);
      const response = await ApiService.createAdminDemo();
      
      if (!response.data) {
        throw new Error('Dados não recebidos do servidor');
      }

      const { username, password } = response.data;
      setUsername(username);
      setPassword(password);
      setOutputs(prev => [...prev, {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: `Conta demo criada com sucesso!\nUsername: ${username}\nPassword: ${password}`
      }]);
    } catch (error) {
      console.error('Erro ao criar conta demo:', error);
      setOutputs(prev => [...prev, {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: 'Erro ao criar conta demo. Tente novamente.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/90 relative overflow-hidden">
      <BackgroundEffects />
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
          {/* Terminal Interativo */}
          <div className="w-full flex flex-col justify-center animate-slide-left">
            <CyberTerminal
              onCommand={handleTerminalCommand}
              initialOutputs={outputs}
              className="h-full shadow-xl rounded-lg border border-[#39ff14]/30 bg-[#0a0a1a]/80 backdrop-blur-md"
            />
            <div className="mt-4 text-xs text-[#666] font-mono text-center">
              Comandos: <span className="text-[#39ff14]">login</span>, <span className="text-[#39ff14]">clear</span>, <span className="text-[#39ff14]">help</span>
            </div>
          </div>

          {/* Formulário de Login */}
          <div className="w-full flex flex-col items-center animate-slide-right">
            <div className="terminal-fake w-full glitch shadow-xl rounded-lg border border-[#8f00ff]/30 bg-[#181828]/80 backdrop-blur-md p-8">
              <h1 className="text-3xl cyber-glow font-bold mb-8 text-center tracking-widest">
                <span className="text-[#39ff14]">Login</span>
              </h1>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-[#39ff14] font-mono mb-2">Usuário</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 rounded bg-black/80 border border-[#39ff14]/40 text-[#39ff14] font-mono focus:ring-2 focus:ring-[#00eaff]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-[#39ff14] font-mono mb-2">Senha</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded bg-black/80 border border-[#39ff14]/40 text-[#39ff14] font-mono focus:ring-2 focus:ring-[#00eaff]"
                    required
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-center font-mono">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="cyber-btn w-full py-3 text-lg font-bold border-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-all duration-300 shadow-neon-green"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
              <div className="mt-6 text-center space-y-4">
                <Link href="/registro" className="text-[#39ff14] hover:text-[#00eaff] underline underline-offset-2 block">
                  Não tem uma conta? Registre-se
                </Link>
                <button
                  onClick={handleCreateDemo}
                  disabled={loading}
                  className="cyber-btn w-full py-2 text-sm font-bold border-[#8f00ff] hover:bg-[#8f00ff] hover:text-white transition-all duration-300 shadow-neon-purple"
                >
                  Criar Admin Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 