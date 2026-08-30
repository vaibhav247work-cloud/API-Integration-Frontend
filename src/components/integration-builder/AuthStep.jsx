import { KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';

const AUTH_TYPES = [
  { id: 'NONE', label: 'None', desc: 'No authentication required.' },
  { id: 'BASIC', label: 'Basic Auth', desc: 'Username and password.' },
  { id: 'API_KEY_HEADER', label: 'API Key (Header)', desc: 'Custom header with token.' },
  { id: 'API_KEY_QUERY', label: 'API Key (Query)', desc: 'Custom query parameter with token.' },
  { id: 'BEARER_STATIC', label: 'Static Bearer Token', desc: 'Standard Bearer Authorization header.' },
  { id: 'TOKEN_API', label: 'Token API (Dynamic)', desc: 'Fetch token via separate API call before main steps.' },
  { id: 'OAUTH2_CLIENT_CREDENTIALS', label: 'OAuth2 Client Credentials', desc: 'Standard client_id/client_secret exchange.' },
];

export default function AuthStep({ data, onChange }) {
  // Ensure data and config are always valid objects to prevent crashes
  const safeData = data || { type: 'NONE', config: {} };
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
          Authentication Strategy
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AUTH_TYPES.map(type => (
            <div 
              key={type.id}
              onClick={() => {
                if (safeData.type !== type.id) {
                  onChange({ type: type.id, config: {} });
                }
              }}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                safeData.type === type.id 
                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10' 
                  : 'border-zinc-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {safeData.type === type.id ? (
                    <ShieldCheck className="w-4 h-4 text-primary-500" />
                  ) : (
                    <KeyRound className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={`text-sm font-semibold ${safeData.type === type.id ? 'text-primary-700 dark:text-primary-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    {type.label}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{type.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {safeData.type !== 'NONE' && (
        <div className="p-6 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 pb-2 border-b border-zinc-200 dark:border-white/10 flex items-center gap-2">
             <ShieldAlert className="w-4 h-4 text-amber-500" />
             Credential Configuration
          </h3>
          
          {safeData.type === 'BASIC' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Username</label>
                  <input type="text" value={safeConfig.username || ''} onChange={e => handleConfigChange('username', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
                  <input type="password" value={safeConfig.password || ''} onChange={e => handleConfigChange('password', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
               </div>
            </div>
          )}

          {safeData.type === 'API_KEY_HEADER' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Header Name</label>
                  <input type="text" placeholder="x-api-key" value={safeConfig.headerName || ''} onChange={e => handleConfigChange('headerName', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Header Value</label>
                  <input type="password" placeholder="secret-token" value={safeConfig.headerValue || ''} onChange={e => handleConfigChange('headerValue', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
               </div>
            </div>
          )}

          {safeData.type === 'API_KEY_QUERY' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Query Param Name</label>
                  <input type="text" placeholder="apikey" value={safeConfig.queryParamName || ''} onChange={e => handleConfigChange('queryParamName', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Query Param Value</label>
                  <input type="password" placeholder="secret-token" value={safeConfig.queryParamValue || ''} onChange={e => handleConfigChange('queryParamValue', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
               </div>
            </div>
          )}

          {safeData.type === 'BEARER_STATIC' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Token Priority/Prefix</label>
                  <input type="text" placeholder="Bearer " value={safeConfig.tokenPrefix || 'Bearer '} onChange={e => handleConfigChange('tokenPrefix', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Token Value</label>
                  <input type="password" placeholder="ey..." value={safeConfig.headerValue || ''} onChange={e => handleConfigChange('headerValue', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
               </div>
            </div>
          )}

          {safeData.type === 'TOKEN_API' && (
            <div className="grid grid-cols-1 gap-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Token URL</label>
                    <input type="url" placeholder="https://auth.example.com/token" value={safeConfig.tokenUrl || ''} onChange={e => handleConfigChange('tokenUrl', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Method</label>
                    <select value={safeConfig.method || 'POST'} onChange={e => handleConfigChange('method', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm">
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                    </select>
                 </div>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Body Template (Raw JSON/String)</label>
                 <textarea value={safeConfig.bodyTemplate || ''} onChange={e => handleConfigChange('bodyTemplate', e.target.value)} rows="3" className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" placeholder='{"username":"admin", "password":"123"}' />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Extraction Path (e.g. $.access_token)</label>
                    <input type="text" placeholder="$.token" value={safeConfig.tokenPath || ''} onChange={e => handleConfigChange('tokenPath', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Path Type</label>
                    <select value={safeConfig.tokenPathType || 'JSON_PATH'} onChange={e => handleConfigChange('tokenPathType', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm">
                      <option value="JSON_PATH">JSON_PATH</option>
                      <option value="XPATH">XPATH</option>
                      <option value="REGEX">REGEX</option>
                      <option value="PLAIN_TEXT">PLAIN_TEXT</option>
                    </select>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Subsequent Header Name</label>
                    <input type="text" placeholder="Authorization" value={safeConfig.tokenHeaderName || 'Authorization'} onChange={e => handleConfigChange('tokenHeaderName', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Subsequent Header Prefix</label>
                    <input type="text" placeholder="Bearer " value={safeConfig.tokenPrefix || 'Bearer '} onChange={e => handleConfigChange('tokenPrefix', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                 </div>
               </div>
            </div>
          )}

          {safeData.type === 'OAUTH2_CLIENT_CREDENTIALS' && (
            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Token URL</label>
                  <input type="url" placeholder="https://auth.example.com/oauth/token" value={safeConfig.tokenUrl || ''} onChange={e => handleConfigChange('tokenUrl', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Client ID</label>
                    <input type="text" value={safeConfig.clientId || ''} onChange={e => handleConfigChange('clientId', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Client Secret</label>
                    <input type="password" value={safeConfig.clientSecret || ''} onChange={e => handleConfigChange('clientSecret', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Scope (Optional)</label>
                    <input type="text" value={safeConfig.scope || ''} onChange={e => handleConfigChange('scope', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Audience (Optional)</label>
                    <input type="text" value={safeConfig.audience || ''} onChange={e => handleConfigChange('audience', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
                 </div>
               </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

