import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  error: string;
  onClose: () => void;
}

export function ErrorModal({ isOpen, error, onClose }: ErrorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div key="error-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-[110]"
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                出错了
              </h3>
              
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                {error}
              </p>
              
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
              >
                我知道了
              </button>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
