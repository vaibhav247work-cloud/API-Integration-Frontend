import { BookTemplate, ArrowRight, LayoutTemplate, Copy, Play } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Integration',
    description: 'Start from scratch with an empty configuration.',
    icon: LayoutTemplate,
    color: 'text-zinc-500',
    bg: 'bg-zinc-100 dark:bg-zinc-800'
  },
  {
    id: 'simple-range',
    name: 'Simple Date Range API',
    description: 'A single request mapped with ${windowStartDate} and ${windowEndDateExclusive}.',
    icon: ArrowRight,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-500/10'
  },
  {
    id: 'single-date',
    name: 'Single-Date Fan-out',
    description: 'Automatically loop and make one request per day inside the schedule window.',
    icon: Copy,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-500/10'
  },
  {
    id: 'session-auth',
    name: 'Session Token Flow',
    description: 'Two steps: fetch a session token, then fetch data using the token.',
    icon: Play,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-500/10'
  }
];

export default function TemplatePicker({ onSelect }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ margin: 0 }}>
      <div className="bg-white dark:bg-[#14111c] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-zinc-200 dark:border-white/10 zoom-in-95 animate-in duration-200 flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center gap-3">
          <BookTemplate className="w-6 h-6 text-primary-500" />
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Choose a Template</h2>
            <p className="text-sm text-zinc-500">How would you like to build this integration?</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto hidden-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map(tpl => {
               const Icon = tpl.icon;
               return (
                 <button
                   key={tpl.id}
                   onClick={() => onSelect(tpl.id)}
                   className="text-left p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#14111c] hover:border-primary-500 hover:ring-1 hover:ring-primary-500/50 transition-all group flex gap-4 items-start"
                 >
                   <div className={`p-3 rounded-lg flex-shrink-0 ${tpl.bg}`}>
                     <Icon className={`w-6 h-6 ${tpl.color}`} />
                   </div>
                   <div>
                     <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-primary-500 transition-colors">
                       {tpl.name}
                     </h3>
                     <p className="text-xs text-zinc-500 leading-relaxed">
                       {tpl.description}
                     </p>
                   </div>
                 </button>
               )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
