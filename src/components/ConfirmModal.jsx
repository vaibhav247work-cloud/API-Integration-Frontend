import { AlertTriangle, X } from 'lucide-react';
import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', dangerous = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ margin: 0 }}>
      <div className="bg-white dark:bg-[#14111c] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-white/10 zoom-in-95 animate-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${dangerous ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500'}`}>
               <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 mt-1">
               <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
               <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
             <button 
               onClick={onCancel} 
               className="px-5 py-2.5 rounded-lg text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors border border-transparent dark:border-white/10"
             >
               {cancelText}
             </button>
             <button 
               onClick={onConfirm} 
               className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-lg transition-all ${
                 dangerous 
                 ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 hover:shadow-red-500/40' 
                 : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 hover:shadow-primary-500/40'
               }`}
             >
               {confirmText}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
