import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, RotateCcw, ChevronDown, SlidersHorizontal } from 'lucide-react';

interface GenerateOptions {
  topic: string;
  highlights?: string;
  platform: string;
  tone: string;
  length: string;
  language: string;
}

interface HistoryItem {
  id: number;
  topic: string;
  highlights?: string;
  platform: string;
  tone: string;
  length: string;
  language: string;
}

interface GeneratorFormProps {
  onSubmit: (options: GenerateOptions) => void;
  isLoading: boolean;
  history: HistoryItem[];
}

export function GeneratorForm({ onSubmit, isLoading, history }: GeneratorFormProps) {
  const [topic, setTopic] = useState('');
  const [highlights, setHighlights] = useState('');
  const [platform, setPlatform] = useState('小红书');
  const [tone, setTone] = useState('幽默风趣');
  const [length, setLength] = useState('中篇');
  const [language, setLanguage] = useState('中文');
  
  // Mobile: options collapsed by default
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (history && history.length > 0) {
      // Get last 3 unique topics from history
      const uniqueHistory = [];
      const seen = new Set();
      for (const item of history) {
        if (!seen.has(item.topic) && uniqueHistory.length < 3) {
          uniqueHistory.push(item);
          seen.add(item.topic);
        }
      }
      return uniqueHistory.map(item => ({
        label: item.topic,
        topic: item.topic,
        highlights: item.highlights || ''
      }));
    }
    // Default recommendations
    return [
      { label: '耳机', topic: '耳机' },
      { label: '防晒霜', topic: '防晒霜' },
      { label: '减脂餐', topic: '减脂餐' },
      { label: '探店', topic: '探店' }
    ];
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSubmit({ topic, highlights, platform, tone, length, language });
  };

  const handleReset = () => {
    setTopic('');
    setHighlights('');
    setPlatform('小红书');
    setTone('幽默风趣');
    setLength('中篇');
    setLanguage('中文');
  };

  const applySuggestion = (s: any) => {
    setTopic(s.topic || '');
    setHighlights(s.highlights || '');
    if (s.platform) setPlatform(s.platform);
    if (s.tone) setTone(s.tone);
    if (s.length) setLength(s.length);
    if (s.language) setLanguage(s.language);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 md:p-14 space-y-6 md:space-y-12"
    >
      {/* Row 1: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        <div className="space-y-3 md:space-y-4">
          <label htmlFor="topic" className="block text-base font-bold text-slate-900">
            商品名称 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：无线蓝牙耳机"
              className="w-full h-12 md:h-14 px-5 rounded-2xl bg-slate-50/80 border-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 placeholder:text-slate-400 text-sm"
              required
            />
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySuggestion(s)}
                    className="text-[12px] px-3.5 py-1.5 rounded-lg bg-slate-100/80 text-slate-500 hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <label htmlFor="highlights" className="block text-base font-bold text-slate-900">
            亮点 (选填)
          </label>
          <div className="space-y-3">
            <input
              id="highlights"
              type="text"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="例如：降噪、超长续航"
              className="w-full h-12 md:h-14 px-5 rounded-2xl bg-slate-50/80 border-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Mobile Options Toggle */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 border border-slate-100"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <span>
              {platform} · {tone}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOptionsOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Row 2: Options (Collapsible on mobile, always visible on desktop) */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 ${isOptionsOpen ? 'block' : 'hidden md:grid'}`}>
        <div className="space-y-3 md:space-y-4">
          <label htmlFor="platform" className="block text-sm md:text-base font-bold text-slate-900">
            适用场景
          </label>
          <div className="relative">
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 md:px-5 py-3 md:py-4 rounded-2xl bg-slate-50/80 border-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none text-slate-800 text-sm cursor-pointer"
            >
              <option value="小红书">小红书</option>
              <option value="抖音">抖音</option>
              <option value="微信朋友圈">微信朋友圈</option>
              <option value="微博">微博</option>
              <option value="Instagram">Instagram</option>
              <option value="知乎">知乎</option>
              <option value="闲鱼">闲鱼</option>
            </select>
            <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <label htmlFor="tone" className="block text-sm md:text-base font-bold text-slate-900">
            情感基调
          </label>
          <div className="relative">
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 md:px-5 py-3 md:py-4 rounded-2xl bg-slate-50/80 border-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none text-slate-800 text-sm cursor-pointer"
            >
              <option value="幽默风趣">幽默风趣</option>
              <option value="专业干货">专业干货</option>
              <option value="情感共鸣">情感共鸣</option>
              <option value="犀利吐槽">犀利吐槽</option>
              <option value="种草安利">种草安利</option>
              <option value="极简高冷">极简高冷</option>
              <option value="凡尔赛">凡尔赛</option>
              <option value="诗情画意">诗情画意</option>
            </select>
            <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <label htmlFor="language" className="block text-sm md:text-base font-bold text-slate-900">
            目标语言
          </label>
          <div className="relative">
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 md:px-5 py-3 md:py-4 rounded-2xl bg-slate-50/80 border-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none text-slate-800 text-sm cursor-pointer"
            >
              <option value="中文">中文</option>
              <option value="English">English</option>
              <option value="中英混合">中英混合</option>
            </select>
            <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <label htmlFor="length" className="block text-sm md:text-base font-bold text-slate-900">
            文案长度
          </label>
          <div className="relative">
            <select
              id="length"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-4 md:px-5 py-3 md:py-4 rounded-2xl bg-slate-50/80 border-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none text-slate-800 text-sm cursor-pointer"
            >
              <option value="短篇">短篇</option>
              <option value="中篇">中篇</option>
              <option value="长篇">长篇</option>
            </select>
            <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 md:pt-6 flex flex-col md:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          disabled={isLoading || !topic.trim()}
          type="submit"
          className={`flex-1 py-4 md:py-5 rounded-[20px] font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all ${
            isLoading || !topic.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              正在生成...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              立即生成 Truebee
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          type="button"
          onClick={handleReset}
          className="px-8 py-4 md:py-5 rounded-[20px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          重置
        </motion.button>
      </div>
    </motion.form>
  );
}
