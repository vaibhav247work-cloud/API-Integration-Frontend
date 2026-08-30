import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PayloadPreview({ payload }) {
  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    toast.success('Payload copied to clipboard');
  };

  return (
    <div className="relative group p-4 border border-zinc-800 bg-[#0a0a0a] rounded-xl overflow-hidden shadow-inner h-full flex flex-col">
       <button 
         onClick={handleCopy}
         className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10 hidden xl:flex items-center gap-2 text-xs"
       >
         <Copy className="w-3.5 h-3.5" />
         Copy JSON
       </button>
       <div className="flex-1 overflow-auto custom-scrollbar">
         <pre className="text-[11px] leading-relaxed font-mono text-emerald-400/90 whitespace-pre">
           {jsonString}
         </pre>
       </div>
    </div>
  );
}
