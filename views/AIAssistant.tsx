
import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Loader2, BrainCircuit, TrendingUp, Target } from 'lucide-react';
import Markdown from 'react-markdown';
import { chatWithAssistant, generateTeamAnalysis } from '../services/geminiService.ts';
import { Player, Match } from '../types.ts';

interface AIAssistantProps {
  players: Player[];
  matches: Match[];
  theme: any;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ players, matches, theme }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Olá! Sou seu assistente inteligente do TeamMaster Pro. Como posso ajudar você com a gestão do seu time hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    const context = {
      playerCount: players.length,
      matchCount: matches.length,
      topScorers: [...players].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 3).map(p => ({ name: p.name, goals: p.stats.goals })),
      recentMatches: matches.slice(-3).map(m => ({ opponent: m.opponent, score: `${m.scoreHome}-${m.scoreAway}`, result: m.scoreHome > m.scoreAway ? 'Vitória' : m.scoreHome < m.scoreAway ? 'Derrota' : 'Empate' }))
    };

    const response = await chatWithAssistant(userMessage, context);
    setMessages(prev => [...prev, { role: 'assistant', content: response || 'Sem resposta.' }]);
    setLoading(false);
  };

  const handleQuickAnalysis = async () => {
    setAnalyzing(true);
    const teamData = {
      players: players.map(p => ({ name: p.name, position: p.position, stats: p.stats })),
      matches: matches.map(m => ({ opponent: m.opponent, date: m.date, score: `${m.scoreHome}-${m.scoreAway}` }))
    };

    const analysis = await generateTeamAnalysis(teamData);
    setMessages(prev => [...prev, { role: 'assistant', content: analysis || 'Não foi possível gerar a análise.' }]);
    setAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-slate-50 rounded-2xl border overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Assistente Inteligente</h2>
            <p className="text-xs text-slate-500">IA treinada para gestão esportiva</p>
          </div>
        </div>
        <button 
          onClick={handleQuickAnalysis}
          disabled={analyzing}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {analyzing ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
          <span>Análise Rápida</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200 ml-2' : 'bg-indigo-100 mr-2'}`}>
                {msg.role === 'user' ? <User size={16} className="text-slate-600" /> : <Bot size={16} className="text-indigo-600" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border text-slate-700 rounded-tl-none shadow-sm'}`}>
                <div className="prose prose-sm max-w-none prose-slate">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-white border p-3 rounded-2xl shadow-sm">
              <Loader2 size={16} className="animate-spin text-indigo-600" />
              <span className="text-xs text-slate-500 font-medium">Pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-2 bg-slate-50 border-t flex space-x-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setInput('Como melhorar o desempenho ofensivo?')}
          className="whitespace-nowrap px-3 py-1.5 bg-white border rounded-full text-[10px] font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center space-x-1"
        >
          <TrendingUp size={12} />
          <span>Melhorar Ataque</span>
        </button>
        <button 
          onClick={() => setInput('Sugira um plano de treino para zagueiros.')}
          className="whitespace-nowrap px-3 py-1.5 bg-white border rounded-full text-[10px] font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center space-x-1"
        >
          <Target size={12} />
          <span>Treino Defesa</span>
        </button>
        <button 
          onClick={() => setInput('Analise o saldo de gols das últimas partidas.')}
          className="whitespace-nowrap px-3 py-1.5 bg-white border rounded-full text-[10px] font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center space-x-1"
        >
          <TrendingUp size={12} />
          <span>Saldo de Gols</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative"
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte qualquer coisa sobre o time..."
            className="w-full bg-slate-100 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
