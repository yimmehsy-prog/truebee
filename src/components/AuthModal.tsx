import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-full md:max-w-md bg-white rounded-3xl md:rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {isLogin ? '欢迎回来' : '创建账号'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors -mr-2"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-base font-bold text-slate-900 ml-1">
                    用户名
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 h-14 border-none bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-base font-medium placeholder:text-slate-400"
                      placeholder="请输入用户名"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-base font-bold text-slate-900 ml-1">
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 h-14 border-none bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-base font-medium placeholder:text-slate-400"
                      placeholder="请输入密码"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl flex items-center gap-2">
                    <div className="w-1 h-4 bg-red-500 rounded-full" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    isLogin ? '登录' : '注册'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-base text-slate-500">
                {isLogin ? '还没有账号？' : '已有账号？'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-indigo-600 font-bold hover:underline ml-1 p-2"
                >
                  {isLogin ? '立即注册' : '直接登录'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
