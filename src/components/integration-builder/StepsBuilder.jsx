import { Plus, Trash2, ArrowUp, ArrowDown, Settings, Server, Variable, Database, GripHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const FORMATS = ['JSON', 'XML', 'FORM_URLENCODED', 'PLAIN_TEXT'];
const WINDOW_MODES = ['NONE', 'SINGLE_DATE', 'DATE_RANGE'];

// Helper for generic key-value maps
function KeyValueEditor({ map, onChange, placeholderKey = "Key", placeholderValue = "Value" }) {
  const entries = Object.entries(map || {});
  
  const handleUpdate = (idx, newKey, newVal) => {
    const newMap = {};
    entries.forEach(([k, v], i) => {
      if (i === idx) {
        if (newKey) newMap[newKey] = newVal;
      } else {
        newMap[k] = v;
      }
    });
    // Add new row if it's the last one and it has a key
    if (idx === entries.length && newKey) {
      newMap[newKey] = newVal;
    }
    onChange(newMap);
  };

  const handleRemove = (idx) => {
    const newMap = {};
    entries.forEach(([k, v], i) => {
      if (i !== idx) newMap[k] = v;
    });
    onChange(newMap);
  };

  return (
    <div className="space-y-2">
      {entries.map(([k, v], i) => (
        <div key={i} className="flex items-start gap-2 p-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg">
          <div className="flex-1 space-y-1.5">
            <input 
              type="text" 
              value={k} 
              onChange={(e) => handleUpdate(i, e.target.value, v)} 
              placeholder={placeholderKey}
              className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono"
            />
            <input 
              type="text" 
              value={v} 
              onChange={(e) => handleUpdate(i, k, e.target.value)} 
              placeholder={placeholderValue}
              className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono"
            />
          </div>
          <button onClick={() => handleRemove(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors mt-1"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      {/* Empty row for adding */}
      <div className="flex items-center gap-2 opacity-50 focus-within:opacity-100 transition-opacity">
        <input 
          type="text" 
          placeholder={`Add ${placeholderKey}...`}
          onChange={(e) => handleUpdate(entries.length, e.target.value, "")} 
          className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono border-dashed"
        />
        <div className="w-7"></div>
      </div>
    </div>
  );
}

export default function StepsBuilder({ data, onChange }) {
  const [expandedStep, setExpandedStep] = useState(0);

  const steps = data || [];

  const addStep = () => {
    const newStep = {
      orderIndex: steps.length,
      name: `Step ${steps.length + 1}`,
      enabled: true,
      method: 'GET',
      url: '',
      headers: {},
      queryParams: {},
      bodyTemplate: '',
      requestFormat: 'JSON',
      responseFormat: 'JSON',
      requestWindowMode: 'NONE',
      requestDateVariable: '',
      requestDateFormat: '',
      windowStartDateFormat: '',
      windowEndDateFormat: '',
      paginate: false,
      dataStep: true,
      responseAlias: '',
      responseVariables: {},
      responseVariablePathType: 'JSON_PATH'
    };
    onChange([...steps, newStep]);
    setExpandedStep(steps.length);
  };

  const updateStep = (idx, field, value) => {
    const newSteps = [...steps];
    newSteps[idx] = { ...newSteps[idx], [field]: value };
    onChange(newSteps);
  };

  const removeStep = (idx) => {
    const newSteps = steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, orderIndex: i }));
    onChange(newSteps);
  };

  const moveStep = (idx, dir) => {
    if (idx + dir < 0 || idx + dir >= steps.length) return;
    const newSteps = [...steps];
    const temp = newSteps[idx];
    newSteps[idx] = newSteps[idx + dir];
    newSteps[idx + dir] = temp;
    
    // Reindex
    newSteps.forEach((s, i) => s.orderIndex = i);
    onChange(newSteps);
    setExpandedStep(idx + dir);
  };

  return (
    <div className="space-y-6">
      
      {steps.length === 0 ? (
        <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl">
           <Server className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No Fetch Steps Defined</h3>
           <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">Integrations require at least one fetch step to run against the target API.</p>
           <button onClick={addStep} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all">
             <Plus className="w-4 h-4" /> Add First Step
           </button>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isExpanded = expandedStep === idx;
            
            return (
              <div key={idx} className={`bg-white dark:bg-[#14111c] border ${isExpanded ? 'border-primary-500 shadow-md' : 'border-zinc-200 dark:border-white/10'} rounded-2xl overflow-hidden transition-all`}>
                
                {/* Step Header */}
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer ${isExpanded ? 'bg-primary-50/50 dark:bg-primary-500/5 border-b border-primary-100 dark:border-primary-500/20' : 'hover:bg-zinc-50 dark:hover:bg-white/5'}`}
                  onClick={() => setExpandedStep(isExpanded ? null : idx)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col gap-1 hidden sm:flex">
                      <button onClick={(e) => { e.stopPropagation(); moveStep(idx, -1); }} disabled={idx === 0} className="text-zinc-400 hover:text-primary-500 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveStep(idx, 1); }} disabled={idx === steps.length - 1} className="text-zinc-400 hover:text-primary-500 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-bold mr-3 ${
                        step.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                        step.method === 'POST' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>{step.method}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{step.name || 'Unnamed Step'}</span>
                      {step.url && <span className="ml-3 text-sm text-zinc-500 font-mono hidden md:inline-block w-64 truncate align-bottom">{step.url}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!step.dataStep && <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold rounded">SETUP ONLY</span>}
                    {step.paginate && <span className="px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-bold rounded">PAGINATED</span>}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeStep(idx); }}
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Delete step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <label className="relative inline-flex items-center cursor-pointer ml-2" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={step.enabled} onChange={(e) => updateStep(idx, 'enabled', e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>

                {/* Step Body */}
                {isExpanded && (
                  <div className="p-6 space-y-8 animate-fade-in">
                    
                    {/* Top Row: General */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Step Name</label>
                         <input type="text" value={step.name} onChange={e => updateStep(idx, 'name', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm" />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Method</label>
                         <select value={step.method} onChange={e => updateStep(idx, 'method', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm">
                           {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">URL / Endpoint</label>
                       <input type="text" value={step.url} onChange={e => updateStep(idx, 'url', e.target.value)} placeholder="/api/v1/orders" className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-mono" />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {/* Request Payload section */}
                      <div className="space-y-6 border-b border-zinc-200 dark:border-white/10 pb-8">
                         <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                           <Settings className="w-4 h-4 text-primary-500" /> Request Payload
                         </h4>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-xs font-medium text-zinc-500 mb-1">Request Format</label>
                             <select value={step.requestFormat} onChange={e => updateStep(idx, 'requestFormat', e.target.value)} className="w-full px-3 py-1.5 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-xs">
                               {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                             </select>
                           </div>
                           <div>
                             <label className="block text-xs font-medium text-zinc-500 mb-1">Response Format</label>
                             <select value={step.responseFormat} onChange={e => updateStep(idx, 'responseFormat', e.target.value)} className="w-full px-3 py-1.5 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-xs">
                               {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                             </select>
                           </div>
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Query Parameters</label>
                           <KeyValueEditor map={step.queryParams} onChange={val => updateStep(idx, 'queryParams', val)} placeholderKey="Param" />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Custom Headers</label>
                           <KeyValueEditor map={step.headers} onChange={val => updateStep(idx, 'headers', val)} placeholderKey="Header" />
                         </div>

                         {(step.method !== 'GET' && step.method !== 'DELETE') && (
                           <div>
                             <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Body Template</label>
                             <textarea 
                               value={step.bodyTemplate || ''} 
                               onChange={e => updateStep(idx, 'bodyTemplate', e.target.value)} 
                               rows={4} 
                               className="w-full px-3 py-2 bg-zinc-950 text-emerald-400 border border-zinc-800 rounded-lg text-xs font-mono custom-scrollbar"
                               placeholder="{&#10;  &quot;query&quot;: &quot;${businessDate}&quot;&#10;}"
                             />
                           </div>
                         )}
                      </div>

                      {/* Right side Advanced */}
                      <div className="space-y-6">
                         <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                           <Variable className="w-4 h-4 text-primary-500" /> Variables & Execution
                         </h4>

                         <div className="p-4 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-xl space-y-4">
                           <div>
                             <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fan-out Window Mode</label>
                             <select value={step.requestWindowMode} onChange={e => updateStep(idx, 'requestWindowMode', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-sm">
                               {WINDOW_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                             <p className="text-xs text-zinc-500 mt-1">SINGLE_DATE repeats once per day; DATE_RANGE sends one request for the full window.</p>
                           </div>
                           
                           {step.requestWindowMode === 'SINGLE_DATE' && (
                             <div className="grid grid-cols-2 gap-4 pt-2">
                               <div>
                                 <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Request Date Variable</label>
                                 <input type="text" value={step.requestDateVariable} onChange={e => updateStep(idx, 'requestDateVariable', e.target.value)} placeholder="requestDate" className="w-full px-3 py-1.5 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-mono" />
                               </div>
                               <div>
                                 <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date Format Override</label>
                                 <input type="text" value={step.requestDateFormat} onChange={e => updateStep(idx, 'requestDateFormat', e.target.value)} placeholder="yyyy-MM-dd" className="w-full px-3 py-1.5 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-mono" />
                               </div>
                             </div>
                           )}

                           {step.requestWindowMode === 'DATE_RANGE' && (
                             <div className="grid grid-cols-2 gap-4 pt-2">
                               <div>
                                 <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Date Format</label>
                                 <input type="text" value={step.windowStartDateFormat || ''} onChange={e => updateStep(idx, 'windowStartDateFormat', e.target.value)} placeholder="yyyy-MM-dd" className="w-full px-3 py-1.5 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-mono" />
                               </div>
                               <div>
                                 <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">End Date Format</label>
                                 <input type="text" value={step.windowEndDateFormat || ''} onChange={e => updateStep(idx, 'windowEndDateFormat', e.target.value)} placeholder="yyyy-MM-dd" className="w-full px-3 py-1.5 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-mono" />
                               </div>
                               <p className="col-span-2 text-xs text-zinc-500">These formats apply to ${'{windowStartDate}'} and ${'{windowEndDateExclusive}'} in query parameters, headers, URLs, and body templates.</p>
                             </div>
                           )}
                         </div>

                         <div className="flex flex-col gap-3">
                           <label className="flex items-center gap-3 p-3 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                             <input type="checkbox" checked={step.dataStep} onChange={e => updateStep(idx, 'dataStep', e.target.checked)} className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded border-zinc-300" />
                             <div className="flex flex-col">
                               <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Is Data Step</span>
                               <span className="text-xs text-zinc-500">Uncheck if this step just fetches a token or session.</span>
                             </div>
                           </label>
                           
                           {step.dataStep && (
                             <label className="flex items-center gap-3 p-3 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                               <input type="checkbox" checked={step.paginate} onChange={e => updateStep(idx, 'paginate', e.target.checked)} className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded border-zinc-300" />
                               <div className="flex flex-col">
                                 <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Enable Pagination</span>
                                 <span className="text-xs text-zinc-500">Run this step in a loop using Pagination Config.</span>
                               </div>
                             </label>
                           )}
                         </div>

                         <div className="p-4 bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-500/20 rounded-xl space-y-4">
                           <h5 className="text-sm font-semibold text-primary-800 dark:text-primary-300">Extract Variables for Next Steps</h5>
                           <div>
                             <label className="block text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">Response Variable Path Type</label>
                             <select value={step.responseVariablePathType} onChange={e => updateStep(idx, 'responseVariablePathType', e.target.value)} className="w-full px-3 py-1.5 bg-white dark:bg-[#14111c] border border-primary-200 dark:border-primary-500/20 rounded-lg text-xs">
                               <option value="JSON_PATH">JSON_PATH</option>
                               <option value="XPATH">XPATH</option>
                             </select>
                           </div>
                           
                           <div>
                             <label className="block text-xs font-medium text-primary-700 dark:text-primary-400 mb-2">Variables (Path → Name)</label>
                             <KeyValueEditor map={step.responseVariables} onChange={val => updateStep(idx, 'responseVariables', val)} placeholderKey="$.session_id" placeholderValue="sessionId" />
                           </div>

                           <div className="pt-2 border-t border-primary-200 dark:border-primary-500/20">
                             <label className="block text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">Save Entire Response as Alias</label>
                             <input type="text" value={step.responseAlias || ''} onChange={e => updateStep(idx, 'responseAlias', e.target.value)} placeholder="e.g. sessionData" className="w-full px-3 py-1.5 bg-white dark:bg-[#14111c] border border-primary-200 dark:border-primary-500/20 rounded-lg text-xs font-mono" />
                           </div>
                         </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          <button onClick={addStep} className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-xl text-zinc-500 hover:text-primary-600 hover:border-primary-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all font-medium">
            <Plus className="w-5 h-5" /> Add Another Step
          </button>
        </div>
      )}
    </div>
  );
}
