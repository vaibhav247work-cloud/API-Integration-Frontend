import { Database, Filter, Layers, Copy, CheckSquare } from 'lucide-react';

const PATH_TYPES = ['JSON_PATH', 'XPATH', 'REGEX', 'PLAIN_TEXT'];
const DUPLICATE_ACTIONS = ['KEEP_FIRST', 'SUM'];

export default function ResponseStep({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleDuplicateChange = (field, value) => {
    onChange({ ...data, duplicateHandling: { ...data.duplicateHandling, [field]: value } });
  };

  const handleFieldActionsChange = (header, action) => {
    const newFieldActions = { ...data.duplicateHandling.fieldActions };
    if (action === 'DEFAULT') {
      delete newFieldActions[header];
    } else {
      newFieldActions[header] = action;
    }
    handleDuplicateChange('fieldActions', newFieldActions);
  };

  return (
    <div className="space-y-8">
      {/* Target Records Extraction */}
      <div className="bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-500" />
          Where are the records?
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Record Path (e.g. $.data.items)</label>
            <input 
              type="text" 
              value={data.recordPath} 
              onChange={e => handleChange('recordPath', e.target.value)} 
              placeholder="$.items" 
              className="w-full px-4 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-mono shadow-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" 
            />
            <p className="text-xs text-zinc-500 mt-2">The path locating the array of items to extract from the final Data Step response. Leave blank if the response is natively an array or text lines.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Path Type</label>
            <select 
              value={data.recordPathType} 
              onChange={e => handleChange('recordPathType', e.target.value)} 
              className="w-full px-4 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
            >
              {PATH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Window Filtering */}
      <div className="bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
           <div>
             <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
               <Filter className="w-5 h-5 text-primary-500" />
               Filter Records to Schedule Window
             </h3>
             <p className="text-sm text-zinc-500 mt-1">Useful when an API returns older data and you only want new records within the execution window.</p>
           </div>
           <label className="relative inline-flex items-center cursor-pointer ml-2">
             <input type="checkbox" checked={data.filterByWindow} onChange={e => handleChange('filterByWindow', e.target.checked)} className="sr-only peer" />
             <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-primary-500"></div>
           </label>
        </div>

        {data.filterByWindow && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Record Date Path</label>
              <input 
                type="text" 
                value={data.recordDatePath} 
                onChange={e => handleChange('recordDatePath', e.target.value)} 
                placeholder="$.createdAt" 
                className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" 
              />
              <p className="text-xs text-zinc-500 mt-1">Relative to each record.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Path Type</label>
              <select 
                value={data.recordDatePathType} 
                onChange={e => handleChange('recordDatePathType', e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
              >
                {PATH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date Format (Optional)</label>
              <input 
                type="text" 
                value={data.recordDateFormat} 
                onChange={e => handleChange('recordDateFormat', e.target.value)} 
                placeholder="yyyy-MM-dd HH:mm:ss" 
                className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" 
              />
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Leave blank if the date is ISO-8601 formatted.</p>
            </div>
          </div>
        )}
      </div>

      {/* Duplicate Handling */}
      <div className="bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
           <div>
             <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
               <Copy className="w-5 h-5 text-primary-500" />
               Duplicate Handling & Aggregation
             </h3>
             <p className="text-sm text-zinc-500 mt-1">Merge duplicate records locally before output using finalized target headers.</p>
           </div>
           <label className="relative inline-flex items-center cursor-pointer ml-2">
             <input type="checkbox" checked={data.duplicateHandling.enabled} onChange={e => handleDuplicateChange('enabled', e.target.checked)} className="sr-only peer" />
             <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-primary-500"></div>
           </label>
        </div>

        {data.duplicateHandling.enabled && (
          <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                     Unique Key Headers (Comma Separated)
                   </label>
                   <input 
                     type="text" 
                     value={data.duplicateHandling.keyHeaders.join(', ')} 
                     onChange={e => handleDuplicateChange('keyHeaders', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                     placeholder="ORDER_ID, ITEM_ID" 
                     className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" 
                   />
                   <p className="text-xs text-zinc-500 mt-1">Use the final output headers (target mapped names), not source JSON paths.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Default Fallback Action</label>
                  <select 
                    value={data.duplicateHandling.defaultAction} 
                    onChange={e => handleDuplicateChange('defaultAction', e.target.value)} 
                    className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                  >
                    {DUPLICATE_ACTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
             </div>

             <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl mt-4">
                <h4 className="font-semibold text-amber-900 dark:text-amber-400 text-sm mb-2 flex items-center gap-1">
                  <CheckSquare className="w-4 h-4" /> Per-Field Action Overrides
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-500 mb-4">
                  Define specific actions for particular headers. For example, setting "SUM" means numeric fields on duplicate rows will be added together.
                </p>
                
                <div className="space-y-3">
                  {Object.entries(data.duplicateHandling.fieldActions || {}).map(([header, action], idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={header}
                        readOnly
                        className="flex-1 px-3 py-1.5 bg-white/50 dark:bg-[#14111c]/50 border border-amber-200/50 dark:border-white/5 rounded-lg text-sm font-mono text-zinc-600 dark:text-zinc-400 cursor-not-allowed"
                      />
                      <select 
                        value={action}
                        onChange={e => handleFieldActionsChange(header, e.target.value)}
                        className="w-48 px-3 py-1.5 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm"
                      >
                        <option value="DEFAULT">Use Default</option>
                        {DUPLICATE_ACTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  ))}
                  
                  {/* Empty Add Row */}
                  <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="Add header to override..."
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleFieldActionsChange(e.target.value, data.duplicateHandling.defaultAction === 'SUM' ? 'KEEP_FIRST' : 'SUM');
                            e.target.value = '';
                          }
                        }}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' && e.target.value) {
                             handleFieldActionsChange(e.target.value, data.duplicateHandling.defaultAction === 'SUM' ? 'KEEP_FIRST' : 'SUM');
                             e.target.value = '';
                           }
                        }}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono border-dashed"
                      />
                      <div className="w-48 text-xs text-zinc-400 pl-2">Press enter to add</div>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

    </div>
  );
}
