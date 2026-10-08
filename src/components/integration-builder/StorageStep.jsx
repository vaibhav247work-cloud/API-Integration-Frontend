import { HardDrive, Cloud, Network, Server, ArrowUpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import AuthStep from './AuthStep';

const STORAGE_TYPES = [
  { id: 'LOCAL', label: 'Local File System', icon: HardDrive, desc: 'Saves file directly to the server.' },
  { id: 'S3', label: 'Amazon S3', icon: Cloud, desc: 'Uploads the CSV to an S3 bucket.' },
  { id: 'FTP', label: 'FTP', icon: Server, desc: 'Transfers the file to an FTP server.' },
  { id: 'FTPS', label: 'FTPS (Implicit TLS)', icon: Server, desc: 'Transfers the file using implicit TLS/SSL encryption.' },
  { id: 'SFTP', label: 'SFTP', icon: Server, desc: 'Transfers the file over SSH.' },
  { id: 'TENANT_DEFAULT', label: 'Default Tenant Upload', icon: Network, desc: 'Uses the configured tenant upload endpoint.' },
  { id: 'HTTP_API', label: 'HTTP API Upload', icon: Network, desc: 'POSTs the file to an external API endpoint.' },
];

export default function StorageStep({ data, onChange }) {
  // Ensure data and config are always valid objects to prevent crashes
  const safeData = data || { type: 'LOCAL', config: {} };
  const safeConfig = safeData.config || {};

  const handleChange = (field, value) => {
    onChange({ ...safeData, [field]: value });
  };

  const handleConfigChange = (field, value) => {
    onChange({ ...safeData, config: { ...safeConfig, [field]: value } });
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Destination Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STORAGE_TYPES.map(type => {
            const Icon = type.icon;
            const isActive = safeData.type === type.id;
            
            return (
              <div 
                key={type.id}
                onClick={() => {
                  if (safeData.type !== type.id) {
                    onChange({ type: type.id, config: {} });
                  }
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isActive 
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10' 
                    : 'border-zinc-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-white/20'
                }`}
              >
                <Icon className={`w-6 h-6 mb-3 ${isActive ? 'text-primary-500' : 'text-zinc-400'}`} />
                <h4 className={`font-semibold mb-1 ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                  {type.label}
                </h4>
                <p className="text-xs text-zinc-500">{type.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm min-h-[250px] animate-fade-in">
         {safeData.type === 'LOCAL' && (
           <div className="max-w-xl space-y-4">
             <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Local Storage Settings</h3>
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Local Directory</label>
               <input 
                 type="text"                  value={safeConfig.localDirectory || ''} 
                  onChange={e => handleConfigChange('localDirectory', e.target.value)} 
                 placeholder="/var/lib/integrations/output" 
                 className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm"
               />
               <p className="text-xs text-zinc-500 mt-1">If blank, it falls back to the Output Directory defined in the Basics step.</p>
             </div>
           </div>
         )}

         {safeData.type === 'S3' && (
           <div className="space-y-6">
             <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Amazon S3 Configuration</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Bucket Name <span className="text-red-500">*</span></label>
                  <input type="text" value={safeConfig.bucket || ''} onChange={e => handleConfigChange('bucket', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm shadow-sm" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Region <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="us-east-1" value={safeConfig.region || ''} onChange={e => handleConfigChange('region', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm" />
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Key Prefix (Folder Path)</label>
                <input type="text" placeholder="exports/daily/" value={safeConfig.keyPrefix || ''} onChange={e => handleConfigChange('keyPrefix', e.target.value)} className="w-full md:w-1/2 px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm" />
             </div>
             <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 mt-4">
               Note: AWS Credentials should be provided via environment variables (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) or IAM Roles attached to the server instance.
             </div>
           </div>
         )}

         {(safeData.type === 'FTP' || safeData.type === 'FTPS' || safeData.type === 'SFTP') && (
           <div className="space-y-6">
             <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{safeData.type} Configuration</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Host <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="ftp.example.com" value={safeConfig.host || ''} onChange={e => handleConfigChange('host', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Port</label>
                  <input type="number" placeholder="21" value={safeConfig.port || ''} onChange={e => handleConfigChange('port', parseInt(e.target.value, 10))} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm" />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Username <span className="text-red-500">*</span></label>
                  <input type="text" value={safeConfig.username || ''} onChange={e => handleConfigChange('username', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm shadow-sm" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password <span className="text-red-500">*</span></label>
                  <input type="password" value={safeConfig.password || ''} onChange={e => handleConfigChange('password', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm shadow-sm" />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
               <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Remote Directory</label>
                  <input type="text" placeholder="/incoming/sales" value={safeConfig.remoteDirectory || ''} onChange={e => handleConfigChange('remoteDirectory', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm" />
               </div>
               <div className="pt-6 border-zinc-200 dark:border-white/5">
                 <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={safeConfig.passiveMode ?? true} onChange={e => handleConfigChange('passiveMode', e.target.checked)} className="w-4 h-4 text-primary-600 rounded bg-white border-zinc-300" />
                   <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Use Passive Mode</span>
                 </label>
               </div>
             </div>
           </div>
         )}

         {safeData.type === 'TENANT_DEFAULT' && (
           <div className="max-w-xl space-y-4">
             <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Default Tenant Upload</h3>
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tenant ID <span className="text-red-500">*</span></label>
               <input type="text" placeholder="_2012119111101" value={safeConfig.tenantId || ''} onChange={e => handleConfigChange('tenantId', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm" />
               <p className="text-xs text-zinc-500 mt-1">The backend must find this tenant in INTEGRATION_HTTP_API_TENANTS_JSON.</p>
             </div>
           </div>
         )}

         {safeData.type === 'HTTP_API' && (
           <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-white">API Push Configuration</h3>
                <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-1 rounded font-bold uppercase tracking-wider">Multipart Upload</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
               <div className="md:col-span-9">
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Upload URL Endpoint</label>
                 <div className="relative">
                    <input type="url" placeholder="https://api.receiver.com/upload" value={safeConfig.uploadUrl || ''} onChange={e => handleConfigChange('uploadUrl', e.target.value)} className="w-full pl-3 pr-4 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm" />
                 </div>
               </div>
               <div className="md:col-span-3">
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Method</label>
                  <select value={safeConfig.uploadMethod || 'POST'} onChange={e => handleConfigChange('uploadMethod', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm shadow-sm">
                   <option value="POST">POST</option>
                   <option value="PUT">PUT</option>
                 </select>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-zinc-100 dark:border-white/5 pb-6">
                <div>
                   <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tenant ID <span className="text-zinc-400 font-normal">(Optional lookup)</span></label>
                    <input type="text" placeholder="SYS_01" value={safeConfig.tenantId || ''} onChange={e => handleConfigChange('tenantId', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm" />
                   <p className="text-xs text-zinc-500 mt-1">If the backend is configured, this maps to dynamic URLs/Credentials.</p>
                </div>
                <div>
                   <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">File Form Parameter Name</label>
                    <input type="text" placeholder="file" value={safeConfig.uploadFileParam || 'file'} onChange={e => handleConfigChange('uploadFileParam', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono shadow-sm" />
                </div>
             </div>

             <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Static Form Fields (Optional)</label>
                  {/* Reuse KeyValueEditor or build simple comma list */}
                   <textarea rows="2" placeholder='{"type": "SALES_REPORT"}' value={JSON.stringify(safeConfig.uploadFormFields || {}) === "{}" ? "" : JSON.stringify(safeConfig.uploadFormFields, null, 2)} onChange={e => {
                      try {
                        handleConfigChange('uploadFormFields', e.target.value ? JSON.parse(e.target.value) : {});
                      } catch(err) { /* silent fail for raw typing */ }
                    }} 
                    className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-mono shadow-sm"
                  />
                </div>
             </div>

             <div className="border-t border-zinc-100 dark:border-white/5 pt-6">
               <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Upload Authentication</h4>
               <p className="text-xs text-zinc-500 mb-4">Authentication used only for this file-upload endpoint. It can differ from the source API authentication.</p>
               <AuthStep
                 data={safeConfig.uploadAuthConfig || { type: 'NONE', config: {} }}
                 onChange={value => handleConfigChange('uploadAuthConfig', value)}
               />
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
