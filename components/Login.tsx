
import React, { useState } from 'react';
import { Trophy, Lock, Mail, Eye, EyeOff, ShieldCheck, Loader2, Users, UserCircle, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

type UserRole = 'ADMIN' | 'STAFF' | 'ATHLETE';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      }
      // Note: Role handling would typically be done via a profiles table 
      // linked to the auth.uid(), but for now we're just differentiating the UI.
    } catch (err) {
      setError('Ocorreu um erro ao tentar entrar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback.html`,
          skipBrowserRedirect: true,
          data: {
            role: role // Passa a função selecionada para o metadado do usuário
          }
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data?.url) {
        const authWindow = window.open(data.url, 'google_login', 'width=600,height=700');
        
        if (!authWindow) {
          setError('O bloqueador de popups impediu a abertura da janela. Por favor, permita popups para este site.');
        }
      }
    } catch (err) {
      setError('Erro ao conectar com Google.');
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SUPABASE_AUTH_SUCCESS') {
        // The popup has closed and notified us. 
        // Supabase auth listener in App.tsx will pick up the session change.
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
              onClick={() => setRole('ADMIN')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${role === 'ADMIN' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Shield size={14} />
              <span>Admin</span>
            </button>
            <button 
              onClick={() => setRole('STAFF')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${role === 'STAFF' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Users size={14} />
              <span>Comissão</span>
            </button>
            <button 
              onClick={() => setRole('ATHLETE')}
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
                  className={`w-full bg-slate-800/50 border ${error ? 'border-red-500' : 'border-slate-700'} text-white rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-[10px] font-bold mt-2 ml-1 uppercase tracking-wider animate-pulse">{error}</p>
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
                  <span>Entrar como {role === 'ADMIN' ? 'Administrador' : role === 'STAFF' ? 'Comissão' : 'Atleta'}</span>
                  <ShieldCheck size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500 font-bold tracking-widest">Ou continue com</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-3 shadow-xl"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Entrar com Google</span>
            </button>
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
