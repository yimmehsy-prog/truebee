import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GeneratorForm } from './components/GeneratorForm';
import { ResultModal } from './components/ResultModal';
import { generateCopy, GenerateOptions } from './lib/gemini';
import { Sparkles, Zap, TrendingUp, User, LogOut, History, LogIn, Crown } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ErrorModal } from './components/ErrorModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { UserCenterModal } from './components/UserCenterModal';

function MainContent() {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastOptions, setLastOptions] = useState<GenerateOptions | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isUserCenterOpen, setIsUserCenterOpen] = useState(false);
  
  const { user, logout } = useAuth();

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [user]);

  const handleGenerate = async (options: GenerateOptions) => {
    if (!options.topic.trim()) {
      setError('请输入文案主题或商品名称');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');
    setLastOptions(options);
    
    try {
      const text = await generateCopy(options);
      if (!text) {
        throw new Error('AI 返回内容为空，请重试');
      }
      setResult(text);
      setIsResultModalOpen(true);
      // Refresh history after successful generation
      if (user) {
        fetchHistory();
      }
    } catch (err: any) {
      setError(err.message || '生成失败，请稍后重试。');
      console.error('Generation Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateResult = (newContent: string) => {
    setResult(newContent);
  };

  const handleRegenerate = () => {
    if (lastOptions) {
      handleGenerate(lastOptions);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-pink-200/20 blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="w-full px-4 xl:px-[150px] h-16 flex items-center justify-between mx-auto">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>Truebee</span>
          </div>

          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.username}</span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsUserMenuOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                      >
                        <button
                          onClick={() => {
                            setIsUserCenterOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Crown className="w-4 h-4 text-amber-500" />
                          会员中心
                        </button>
                        <button
                          onClick={() => {
                            setIsHistoryOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <History className="w-4 h-4" />
                          历史记录
                        </button>
                        <div className="h-px bg-slate-100" />
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          退出登录
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 w-full px-4 xl:px-[150px] py-6 md:py-16 mt-16 md:mt-12 mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4"
        >
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Truebee
            </span>
            爆款文案生成器
          </h1>
          <p className="text-sm md:text-lg text-slate-500 mx-auto px-4">
            一键生成小红书、抖音、朋友圈等平台的吸睛文案。让 AI 帮你抓住流量密码，轻松写出 10w+爆款文案
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col gap-16 items-center">
          
          {/* Form Section */}
          <div className="w-full max-w-6xl space-y-12">
            <GeneratorForm onSubmit={handleGenerate} isLoading={isLoading} history={history} />
            
            {/* Error display removed, now using ErrorModal */}

            {/* Features / Trust Badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-3 gap-4 text-center"
            >
              <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-100">
                <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-900">极速生成</div>
                <div className="text-xs text-slate-500">秒级响应</div>
              </div>
              <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-100">
                <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-900">流量密码</div>
                <div className="text-xs text-slate-500">算法优化</div>
              </div>
              <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-100">
                <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-900">创意无限</div>
                <div className="text-xs text-slate-500">拒绝同质化</div>
              </div>
            </motion.div>
          </div>

          {/* Tips & Inspiration Section */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white shadow-xl shadow-indigo-500/5">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                写作小贴士
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">标题党是王道</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">前 3 秒决定了用户是否会点击。尝试使用数字、疑问句或强烈的对比。</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex-shrink-0 flex items-center justify-center text-purple-600 font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">多用 Emoji</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">特别是在小红书平台，Emoji 能增加文案的可读性和亲和力。</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-pink-50 flex-shrink-0 flex items-center justify-center text-pink-600 font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">号召行动 (CTA)</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">文末一定要引导用户点赞、评论或关注，提高互动率。</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200 flex flex-col justify-center">
              <h3 className="text-lg font-bold mb-2">想要更好的结果？</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                尝试在“亮点”中输入更多细节，比如产品的核心卖点、目标人群或具体的使用场景。
              </p>
              <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full">
                <Zap className="w-3 h-3 text-amber-300" />
                AI 正在不断进化中
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Truebee爆款文案生成器. Powered by Truebee.</p>
        </footer>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <UserCenterModal isOpen={isUserCenterOpen} onClose={() => setIsUserCenterOpen(false)} />
      <ErrorModal isOpen={!!error} error={error} onClose={() => setError('')} />
      <ResultModal 
        isOpen={isResultModalOpen} 
        content={result} 
        onClose={() => setIsResultModalOpen(false)}
        onUpdate={handleUpdateResult}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
