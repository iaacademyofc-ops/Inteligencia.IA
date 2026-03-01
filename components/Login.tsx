
import React, { useState } from 'react';
import { Trophy, Lock, Mail, Eye, EyeOff, ShieldCheck, Loader2, Users, UserCircle, Shield, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

type UserRole = 'ADMIN' | 'STAFF' | 'ATHLETE';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isRegistering) {
        // Validação de tamanho de senha
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }

        // Validação de código para Admin
        if (role === 'ADMIN') {
          const AUTHORIZED_CODE = 'ADMIN123'; // Em produção, use process.env.VITE_ADMIN_CODE
          if (adminCode !== AUTHORIZED_CODE) {
            setError('Código de autorização inválido.');
            setLoading(false);
            return;
          }
        }

        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role,
            },
          },
        });

        if (authError) {
          setError(authError.message);
        } else {
          setSuccessMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.');
          // Limpar campos após cadastro
          setEmail('');
          setPassword('');
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
        }
      }
    } catch (err) {
      setError('Ocorreu um erro. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40 mb-4 transform -rotate-6">
              <Trophy size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">TeamMaster <span className="text-blue-400">Pro</span></h1>
            <p className="text-slate-400 text-sm mt-1">Gestão Esportiva Profissional</p>
          </div>

          <div className="flex p-1 bg-slate-800/50 rounded-xl mb-6 border border-white/5">
            <button 
              onClick={() => {
                setRole('ADMIN');
                setAdminCode('');
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${role === 'ADMIN' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Shield size={14} />
              <span>Admin</span>
            </button>
            <button 
              onClick={() => {
                setRole('STAFF');
                setAdminCode('');
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${role === 'STAFF' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Users size={14} />
              <span>Comissão</span>
            </button>
            <button 
              onClick={() => {
                setRole('ATHLETE');
                setAdminCode('');
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${role === 'ATHLETE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <UserCircle size={14} />
              <span>Atleta</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha de Acesso</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full bg-slate-800/50 border ${error && !adminCode ? 'border-red-500' : 'border-slate-700'} text-white rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegistering && role === 'ADMIN' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 ml-1 flex justify-between">
                  <span>Código de Autorização Admin</span>
                  <span className="text-[10px] lowercase font-normal opacity-60">Padrão: ADMIN123</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Shield size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Digite o código secreto"
                    required
                    className={`w-full bg-slate-800/50 border ${error === 'Código de autorização inválido.' ? 'border-red-500' : 'border-slate-700'} text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 animate-in fade-in slide-in-from-top-1 duration-300">
                  <p className="text-red-400 text-xs font-bold uppercase tracking-wider text-center">{error}</p>
                </div>
              )}
              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-3">
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider text-center">{successMessage}</p>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>
                    {isRegistering ? 'Cadastrar' : 'Entrar'} como {role === 'ADMIN' ? 'Administrador' : role === 'STAFF' ? 'Comissão' : 'Atleta'}
                  </span>
                  {isRegistering ? <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" /> : <ShieldCheck size={20} className="group-hover:translate-x-1 transition-transform" />}
                </>
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                  setSuccessMessage(null);
                  setAdminCode('');
                }}
                className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                {isRegistering ? (
                  <>
                    <LogIn size={14} />
                    <span>Já tem uma conta? Entre aqui</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>Não tem conta? Cadastre-se como {role === 'ADMIN' ? 'Admin' : role === 'STAFF' ? 'Comissão' : 'Atleta'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">
              &copy; 2026 TeamMaster Pro • Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
