import { Building2, Key, Link as LinkIcon, FileText, FolderOutput, RefreshCcw } from 'lucide-react';

export default function BasicsStep({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Client Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
             <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input
               type="text"
               value={data.clientName}
               onChange={(e) => handleChange('clientName', e.target.value)}
               placeholder="e.g. Acme Corp Sales"
               className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm transition-all"
             />
          </div>
          <p className="text-xs text-zinc-500 mt-1">A human-readable name for this integration.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Brand Code
          </label>
          <div className="relative">
             <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input
               type="text"
               value={data.brandCode}
               onChange={(e) => handleChange('brandCode', e.target.value)}
               placeholder="e.g. ACME_01"
               className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm transition-all"
             />
          </div>
          <p className="text-xs text-zinc-500 mt-1">Tenant or system identifier (optional).</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Base URL
        </label>
        <div className="relative">
           <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
           <input
             type="url"
             value={data.baseUrl}
             onChange={(e) => handleChange('baseUrl', e.target.value)}
             placeholder="https://api.example.com/v1"
             className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm transition-all"
           />
        </div>
        <p className="text-xs text-zinc-500 mt-1">The root URL for all requests. Steps can use relative paths.</p>
      </div>

      <div className="border border-zinc-200 dark:border-white/10 rounded-xl p-4 bg-zinc-50/50 dark:bg-white/[0.02]">
        <h3 className="text-sm font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Output & Execution</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              File Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
               <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
               <input
                 type="text"
                 value={data.csvFileName}
                 onChange={(e) => handleChange('csvFileName', e.target.value)}
                 placeholder="sales_data.csv"
                 className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm transition-all"
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Output Directory
            </label>
            <div className="relative">
               <FolderOutput className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
               <input
                 type="text"
                 value={data.outputDirectory}
                 onChange={(e) => handleChange('outputDirectory', e.target.value)}
                 placeholder="output/acme"
                 className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm transition-all"
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Max Retries <span className="text-red-500">*</span>
            </label>
            <div className="relative">
               <RefreshCcw className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
               <input
                 type="number"
                 min="0"
                 value={data.maxRetries}
                 onChange={(e) => handleChange('maxRetries', parseInt(e.target.value, 10) || 0)}
                 className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm transition-all"
               />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 py-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={data.enabled} 
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-primary-500"></div>
        </label>
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Integration is currently {data.enabled ? 'Enabled' : 'Disabled'}</span>
      </div>
    </div>
  );
}
