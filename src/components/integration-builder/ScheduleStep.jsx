import { Clock, Code, History, Workflow } from 'lucide-react';

const SCHEDULE_TYPES = [
  { id: 'DAILY', label: 'Daily', description: 'Run once per day window.' },
  { id: 'MONTHLY', label: 'Monthly', description: 'Run once per month.' },
  { id: 'HOURLY', label: 'Hourly', description: 'Run continuously at intervals.' },
];

const SCHEDULER_MODES = [
  {
    id: 'QUEUE',
    label: 'Queue-First',
    description: 'Recommended. Schedules enqueue execution jobs for the scalable worker pipeline.',
    icon: Workflow,
  },
  {
    id: 'LEGACY',
    label: 'Legacy',
    description: 'Compatibility mode for older in-app scheduling behavior during rollout.',
    icon: History,
  },
];

export default function ScheduleStep({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleToggleSchedule = (typeId) => {
    const items = [...data.items];
    const existingIndex = items.findIndex(i => i.type === typeId);
    
    if (existingIndex >= 0) {
      items.splice(existingIndex, 1);
    } else {
      items.push({ type: typeId, enabled: true, intervalHours: typeId === 'HOURLY' ? 1 : null });
    }
    
    handleChange('items', items);
  };

  const activeTypes = data.items.map(i => i.type);
  const activeSchedulerMode = data.schedulerMode || 'QUEUE';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Scheduler Mode</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Save how this integration should participate in the scalable scheduling rollout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCHEDULER_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeSchedulerMode === mode.id;

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleChange('schedulerMode', mode.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  isActive
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10'
                    : 'border-zinc-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-lg p-2 ${isActive ? 'bg-primary-500/10 text-primary-500' : 'bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-semibold ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {mode.label}
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                  <div className={`mt-1 h-4 w-4 rounded-full border-2 ${isActive ? 'border-primary-500 bg-primary-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                    {isActive && <div className="h-full w-full scale-[0.4] rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SCHEDULE_TYPES.map(type => {
           const isActive = activeTypes.includes(type.id);
           return (
             <div 
               key={type.id}
               onClick={() => handleToggleSchedule(type.id)}
               className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                 isActive 
                   ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10' 
                   : 'border-zinc-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-white/20'
               }`}
             >
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <Clock className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-zinc-400'}`} />
                   <h3 className={`font-semibold ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{type.label}</h3>
                 </div>
                 <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'bg-primary-500 border-primary-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                   {isActive && <div className="w-full h-full bg-white rounded-full scale-[0.4]" />}
                 </div>
               </div>
               <p className="text-xs text-zinc-500">{type.description}</p>
             </div>
           );
        })}
      </div>

      {activeTypes.includes('HOURLY') && (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full md:w-1/3">
           <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
             Interval (Hours)
           </label>
           <input
             type="number"
             min="1"
             value={data.items.find(i => i.type === 'HOURLY')?.intervalHours || 1}
             onChange={(e) => {
               const val = parseInt(e.target.value, 10) || 1;
               const newItems = data.items.map(i => i.type === 'HOURLY' ? { ...i, intervalHours: val } : i);
               handleChange('items', newItems);
             }}
             className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm transition-all"
           />
        </div>
      )}

      {/* Advanced Legacy Cron */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mt-8">
         <div 
           className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 cursor-pointer"
           onClick={() => handleChange('useLegacyCron', !data.useLegacyCron)}
         >
           <Code className="w-4 h-4 text-zinc-500" />
           <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Advanced: Fallback to Legacy Cron String</span>
         </div>
         
         {data.useLegacyCron && (
           <div className="p-4 bg-white dark:bg-[#14111c] border-t border-zinc-200 dark:border-zinc-800">
             <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
               Legacy Cron Expression
             </label>
             <input
               type="text"
               value={data.legacyCron}
               onChange={(e) => handleChange('legacyCron', e.target.value)}
               placeholder="0 0 * * * *"
               className="w-full lg:w-1/2 px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm transition-all font-mono text-sm"
             />
             <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                Warning: Legacy crons bypass normal scheduling logic. Use only if required.
             </p>
           </div>
         )}
      </div>
    </div>
  );
}
