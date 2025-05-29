'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { TerminalOutput } from '@/types/terminal';

interface Purchase {
  id: string;
  productName: string;
  nickname: string;
  price: number;
  timestamp: string;
}

interface CyberTerminalProps {
  outputs?: string[];
  onCommand?: (command: string) => void;
  initialOutputs?: TerminalOutput[];
  className?: string;
}

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const generateNickname = () => {
  const prefixes = ['Cyber', 'Hack', 'Ghost', 'Phantom', 'Shadow', 'Neo', 'Matrix', 'Byte', 'Code', 'Crypto'];
  const suffixes = ['Master', 'Hacker', 'Runner', 'Ninja', 'Warrior', 'Agent', 'Knight', 'Wizard', 'Mage', 'Lord'];
  const numbers = Math.floor(Math.random() * 1000);
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix}${suffix}${numbers}`;
};

const mockProducts = [
  { id: 1, name: "Bot Discord Premium", price: 99.90 },
  { id: 2, name: "Script de Automação", price: 49.90 },
  { id: 3, name: "Template Loja Digital", price: 79.90 }
];

const ensureNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export default function CyberTerminal({ outputs, onCommand, initialOutputs, className }: CyberTerminalProps) {
  const [terminalOutputs, setTerminalOutputs] = useState<TerminalOutput[]>(initialOutputs || []);
  const [command, setCommand] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutputs, outputs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const newOutput: TerminalOutput = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      message: command
    };

    setTerminalOutputs(prev => [...prev, newOutput]);
    onCommand?.(command);
    setCommand('');
  };

  return (
    <div className={`terminal-fake w-full max-w-4xl mx-auto ${className}`}>
      <div className="terminal-header">
        <div className="terminal-buttons">
          <button className="terminal-button close"></button>
          <button className="terminal-button minimize"></button>
          <button className="terminal-button maximize"></button>
        </div>
        <div className="terminal-title">CyberShop Terminal v1.0.0</div>
      </div>
      <div ref={terminalRef} className="terminal-content p-4 h-80 overflow-y-auto font-mono text-[#39ff14] text-sm bg-black/95">
        {outputs?.map((output, index) => (
          <div key={index} className="whitespace-pre-line">{output}</div>
        ))}
        {terminalOutputs.map((output) => (
          <div key={output.id} className="whitespace-pre-line">
            <span className="text-[#39ff14]/60">[{output.timestamp}]</span> {output.message}
          </div>
        ))}
      </div>
      {onCommand && (
        <form onSubmit={handleSubmit} className="terminal-input mt-2 flex gap-2 p-4 border-t border-[#39ff14]/20">
          <span className="text-[#39ff14] font-mono">&gt;</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="bg-transparent border-none outline-none text-[#39ff14] font-mono flex-1"
            placeholder="Digite um comando..."
            autoFocus
            autoComplete="off"
          />
        </form>
      )}
    </div>
  );
}