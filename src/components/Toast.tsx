import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', isVisible, onClose, duration = 2000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-20 left-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md"
          style={{
            backgroundColor: type === 'success' ? 'rgba(240, 253, 244, 0.9)' : type === 'error' ? 'rgba(254, 242, 242, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: type === 'success' ? '#bbf7d0' : type === 'error' ? '#fecaca' : '#e2e8f0',
            color: type === 'success' ? '#15803d' : type === 'error' ? '#b91c1c' : '#334155',
          }}
        >
          {type === 'success' && <Check className="w-4 h-4" />}
          {type === 'error' && <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{message}</span>
          <button onClick={onClose} className="ml-2 hover:opacity-70">
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
