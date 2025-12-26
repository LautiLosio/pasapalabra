'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReactNode } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
}

export const InfoModal = ({ isOpen, onClose, title, subtitle, icon, children }: InfoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-light w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-blue-500/10 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  {icon}
                </div>
                <div>
                  <h2 className="text-xl font-[family-name:var(--font-fredoka)] font-bold text-white">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-white/40">{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ShortcutRowProps {
  keys: (string | ReactNode)[];
  description: string;
}

export const ShortcutRow = ({ keys, description }: ShortcutRowProps) => (
  <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
    <span className="text-white/70 text-sm">{description}</span>
    <div className="flex items-center gap-1.5">
      {keys.map((key, i) => {
        const isIcon = typeof key !== 'string';
        return (
          <div key={i} className="flex items-center gap-1.5">
            <kbd
              className={`
                px-2.5 py-1 rounded-lg bg-white/10 text-white/90 text-xs border border-white/10 shadow-sm 
                inline-flex items-center justify-center min-w-[2rem] h-7
                ${isIcon ? '' : 'font-mono font-bold'}
              `}
            >
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="text-white/30">/</span>}
          </div>
        );
      })}
    </div>
  </div>
);

