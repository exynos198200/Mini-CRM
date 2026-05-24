import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeads, ToastMessage } from '../context/LeadContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, dismissToast } = useLeads();

  return (
    <div className="fixed bottom-5 right-5 z-55 max-w-sm w-full space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast: ToastMessage) => {
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className="pointer-events-auto flex items-start gap-3 bg-white border border-slate-100 shadow-xl rounded-2xl p-4 overflow-hidden"
            >
              {/* Left Color Indicator & Icon */}
              <div className="shrink-0">
                {toast.type === 'success' && (
                  <div className="bg-emerald-50 text-emerald-500 p-2 rounded-xl">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
                {toast.type === 'warning' && (
                  <div className="bg-amber-50 text-amber-500 p-2 rounded-xl">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                )}
                {toast.type === 'info' && (
                  <div className="bg-blue-50 text-blue-500 p-2 rounded-xl">
                    <Info className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Message Payload */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-normal">
                  {toast.message}
                </p>
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 mt-1 block">
                  {toast.type} notification
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
