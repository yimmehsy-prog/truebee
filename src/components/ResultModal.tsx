import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ResultModalProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
  onUpdate: (newContent: string) => void;
}

export function ResultModal({ isOpen, content, onClose, onUpdate }: ResultModalProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
    onUpdate(newContent);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[80vh] bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-slate-900">生成结果</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      一键复制
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/30">
              <textarea
                value={editedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full min-h-[400px] p-8 md:p-12 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800 font-sans leading-relaxed resize-none bg-white shadow-sm"
                placeholder="在此修改文案内容..."
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-white">
              <div className="text-xs text-slate-400 flex items-center gap-4">
                <span>{editedContent.length} 字</span>
                <span>Truebee 提供支持</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
