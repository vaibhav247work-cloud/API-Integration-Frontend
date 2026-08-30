import { Layers, ListOrdered, Link as LinkIcon, AlertTriangle } from 'lucide-react';

const PATH_TYPES = ['JSON_PATH', 'XPATH', 'REGEX', 'PLAIN_TEXT'];

export default function PaginationStep({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        
        <div className="flex items-start justify-between mb-6 pb-6 border-b border-zinc-100 dark:border-white/5">
           <div>
             <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
               <Layers className="w-5 h-5 text-primary-500" />
               Global Pagination Rules
             </h3>
             <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
               Configure how the backend should paginate through records. Pagination will automatically execute in a loop for any Fetch Step that has <strong>Enable Pagination</strong> checked.
             </p>
           </div>
           
           <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
             <input type="checkbox" checked={data.enabled} onChange={e => handleChange('enabled', e.target.checked)} className="sr-only peer" />
             <div className="w-14 h-7 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-zinc-600 peer-checked:bg-primary-500"></div>
           </label>
        </div>

        {data.enabled ? (
          <div className="space-y-8 animate-fade-in">
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Pagination Strategy</label>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 
                 <div 
                   onClick={() => handleChange('mode', 'PAGE_NUMBER')}
                   className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                     data.mode === 'PAGE_NUMBER' 
                       ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10' 
                       : 'border-zinc-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-white/20'
                   }`}
                 >
                   <div className="flex items-center gap-3 mb-2">
                     <ListOrdered className={`w-5 h-5 flex-shrink-0 ${data.mode === 'PAGE_NUMBER' ? 'text-primary-500' : 'text-zinc-400'}`} />
                     <h4 className={`font-semibold ${data.mode === 'PAGE_NUMBER' ? 'text-primary-700 dark:text-primary-400' : 'text-zinc-700 dark:text-zinc-300'}`}>Offset / Page Number</h4>
                   </div>
                   <p className="text-xs text-zinc-500">Increments a query parameter (e.g. ?page=1) until Total Pages limit is reached.</p>
                 </div>

                 <div 
                   onClick={() => handleChange('mode', 'NEXT_URL')}
                   className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                     data.mode === 'NEXT_URL' 
                       ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10' 
                       : 'border-zinc-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-white/20'
                   }`}
                 >
                   <div className="flex items-center gap-3 mb-2">
                     <LinkIcon className={`w-5 h-5 flex-shrink-0 ${data.mode === 'NEXT_URL' ? 'text-primary-500' : 'text-zinc-400'}`} />
                     <h4 className={`font-semibold ${data.mode === 'NEXT_URL' ? 'text-primary-700 dark:text-primary-400' : 'text-zinc-700 dark:text-zinc-300'}`}>Next URL / Cursor</h4>
                   </div>
                   <p className="text-xs text-zinc-500">Extracts the next page URL or cursor string directly from each response body.</p>
                 </div>

               </div>
             </div>

             {/* Configuration Fields */}
             <div className="p-6 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-xl">
               
               {data.mode === 'PAGE_NUMBER' && (
                 <div className="space-y-6 animate-fade-in">
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Page Query Parameter</label>
                       <input type="text" value={data.pageParam} onChange={e => handleChange('pageParam', e.target.value)} placeholder="page" className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Page Number</label>
                       <input type="number" value={data.startPage} onChange={e => handleChange('startPage', parseInt(e.target.value) || 0)} placeholder="1" className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 dark:border-white/5">
                     <div>
                       <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Page Size Query Parameter (Optional)</label>
                       <input type="text" value={data.sizeParam} onChange={e => handleChange('sizeParam', e.target.value)} placeholder="limit" className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Page Size Value (Optional)</label>
                       <input type="number" value={data.pageSize || ''} onChange={e => handleChange('pageSize', parseInt(e.target.value) || null)} placeholder="100" className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 dark:border-white/5">
                     <div>
                       <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Pages Extraction Path <span className="text-red-500">*</span></label>
                       <input type="text" value={data.totalPagesPath} onChange={e => handleChange('totalPagesPath', e.target.value)} placeholder="$.meta.totalPages" className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                       <p className="text-xs text-zinc-500 mt-1">Required to know when to stop paginating.</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Path Type</label>
                       <select value={data.totalPagesPathType} onChange={e => handleChange('totalPagesPathType', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm">
                         {PATH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                     </div>
                   </div>

                 </div>
               )}

               {data.mode === 'NEXT_URL' && (
                 <div className="space-y-6 animate-fade-in">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Next Link/Cursor Extraction Path <span className="text-red-500">*</span></label>
                       <input type="text" value={data.nextPagePath} onChange={e => handleChange('nextPagePath', e.target.value)} placeholder="$.links.next" className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                       <p className="text-xs text-zinc-500 mt-1">Extracts the direct URL, or the cursor string to append to the URL.</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Path Type</label>
                       <select value={data.nextPagePathType} onChange={e => handleChange('nextPagePathType', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm">
                         {PATH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                     </div>
                   </div>

                   <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">Cursor Variables</h5>
                        <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-1">
                           If the extracted path returns a cursor rather than a full URL, you can use <code>{`\${page}`}</code> in your Fetch Step URL or Query Params to inject it dynamically during subsequent requests!
                        </p>
                      </div>
                   </div>
                 </div>
               )}

             </div>

          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]">
            <p className="text-zinc-500">Pagination is disabled. The integration will only fetch one page per request window.</p>
          </div>
        )}

      </div>
    </div>
  );
}
