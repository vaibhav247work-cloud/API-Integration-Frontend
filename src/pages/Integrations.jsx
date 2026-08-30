import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Settings2, Trash2, Power, Pause, Plus, ChevronDown, Clock, Search, ChevronLeft, ChevronRight, Calendar, Workflow } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { cn, extractError } from '../lib/utils';
import ConfirmModal from '../components/ConfirmModal';

export default function Integrations() {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [integrationToDelete, setIntegrationToDelete] = useState(null);
  const [customRunIntegration, setCustomRunIntegration] = useState(null);
  const [customRunForm, setCustomRunForm] = useState({
    fromDate: '',
    toDate: '',
    fileToken: '',
  });
  const [activeActionKey, setActiveActionKey] = useState(null);
  const [submittingCustomRun, setSubmittingCustomRun] = useState(false);
  
  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchIntegrations();
    
    const handleClickOutside = (event) => {
      // If click is outside the entire table/grid or doesn't match an active dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    
    // Using capture phase to ensure it fires before child stops propagation
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const data = await api.get('/integrations');
      setIntegrations(data);
    } catch (error) {
      toast.error('Failed to fetch integrations: ' + extractError(error));
    } finally {
       setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const desiredStatus = !currentStatus;
    const loadingToast = toast.loading(`${desiredStatus ? 'Enabling' : 'Disabling'} integration...`);
    try {
      await api.patch(`/integrations/${id}/enabled?value=${desiredStatus}`);
      toast.success(`Integration ${desiredStatus ? 'enabled' : 'disabled'}!`, { id: loadingToast });
      fetchIntegrations();
    } catch (error) {
      toast.error('Failed to toggle status: ' + extractError(error), { id: loadingToast });
    }
  };

  const triggerRun = async (id) => {
    const loadingToast = toast.loading('Queueing run...');
    setActiveActionKey(`enqueue-${id}`);
    try {
       const job = await api.post(`/integrations/${id}/enqueue`);
       toast.success(`Run queued as Job #${job.id}. Track it in Execution Jobs.`, { id: loadingToast });
    } catch (error) {
       toast.error('Failed to queue run: ' + extractError(error), { id: loadingToast });
    } finally {
       setActiveActionKey((current) => (current === `enqueue-${id}` ? null : current));
    }
  };

  const triggerScheduleRun = async (id, scheduleType) => {
    const loadingToast = toast.loading(`Triggering ${scheduleType} run...`);
    setActiveActionKey(`schedule-${id}-${scheduleType}`);
    setOpenDropdownId(null); // Close dropdown immediately
    try {
       const run = await api.post(`/integrations/${id}/run/schedule?scheduleType=${scheduleType}`);
       toast.success(`Compatibility run started as Run #${run.id}. Track the result in Runs History.`, { id: loadingToast });
    } catch (error) {
       toast.error(`Failed to trigger ${scheduleType} run: ` + extractError(error), { id: loadingToast });
    } finally {
       setActiveActionKey((current) => (current === `schedule-${id}-${scheduleType}` ? null : current));
    }
  };

  const openCustomRunModal = (integration) => {
    setOpenDropdownId(null);
    setCustomRunIntegration(integration);
    setCustomRunForm({
      fromDate: '',
      toDate: '',
      fileToken: '',
    });
  };

  const closeCustomRunModal = () => {
    setCustomRunIntegration(null);
    setCustomRunForm({
      fromDate: '',
      toDate: '',
      fileToken: '',
    });
  };

  const submitCustomRun = async () => {
    if (!customRunIntegration) return;

    if (!customRunForm.fromDate && !customRunForm.toDate) {
      toast.error('Choose at least a from date for a custom run.');
      return;
    }

    if (customRunForm.fromDate && customRunForm.toDate && customRunForm.toDate < customRunForm.fromDate) {
      toast.error('To date must be the same as or after from date.');
      return;
    }

    const payload = {
      ...(customRunForm.fromDate ? { fromDate: customRunForm.fromDate } : {}),
      ...(customRunForm.toDate ? { toDate: customRunForm.toDate } : {}),
      ...(customRunForm.fileToken.trim() ? { fileToken: customRunForm.fileToken.trim() } : {}),
    };

    const loadingToast = toast.loading('Queueing custom run...');
    setSubmittingCustomRun(true);
    try {
      const job = await api.post(`/integrations/${customRunIntegration.id}/enqueue/custom`, payload);
      toast.success(`Custom run queued as Job #${job.id}. Track it in Execution Jobs.`, { id: loadingToast });
      closeCustomRunModal();
    } catch (error) {
      toast.error('Failed to queue custom run: ' + extractError(error), { id: loadingToast });
    } finally {
      setSubmittingCustomRun(false);
    }
  };

  const executeDelete = async () => {
    if (!integrationToDelete) return;
    const id = integrationToDelete.id;
    const loadingToast = toast.loading('Deleting integration...');
    try {
      await api.delete(`/integrations/${id}`);
      toast.success('Integration deleted successfully', { id: loadingToast });
      setIntegrationToDelete(null);
      fetchIntegrations();
    } catch (error) {
      toast.error('Failed to delete integration: ' + extractError(error), { id: loadingToast });
      setIntegrationToDelete(null);
    }
  };

  const parseScheduleConfig = (config) => {
    if (!config) return [];
    try {
      const parsed = typeof config === 'string' ? JSON.parse(config) : config;
      if (Array.isArray(parsed)) {
        return parsed.filter(s => s.type && s.enabled !== false);
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const toggleDropdown = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Filter & Pagination Logic
  const filteredIntegrations = integrations.filter(intg => 
    (intg.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (intg.brandCode || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredIntegrations.length / itemsPerPage);
  const currentIntegrations = filteredIntegrations.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-fade-in-up" ref={dropdownRef}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
         <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
           <p className="text-zinc-500 mt-1">Manage integration endpoints. Manual runs now queue asynchronously, so use Execution Jobs to monitor progress.</p>
         </div>
        <div className="flex items-center gap-3">
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input 
               type="text" 
               placeholder="Search client or brand..." 
               value={searchQuery}
               onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
               className="pl-9 pr-4 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#14111c] dark:text-zinc-200 outline-none focus:ring-2 focus:ring-primary-500/50 w-full sm:w-64"
             />
          </div>
          <button 
             onClick={() => navigate('/integrations/new')}
             className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 font-medium shrink-0"
          >
            <Plus className="w-5 h-5"/>
            <span className="hidden sm:inline">New Integration</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIntegrations.length === 0 ? (
              <div className="col-span-full text-center py-16 text-zinc-500 bg-white/50 dark:bg-[#14111c]/50 border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl">
                {searchQuery ? 'No integrations match your search.' : 'No integration definitions found.'}
              </div>
            ) : currentIntegrations.map((intg) => {
              const activeSchedules = parseScheduleConfig(intg.scheduleConfig);

              return (
              <div key={intg.id} className="bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-visible h-full">
                <div className={cn("absolute top-0 left-0 w-full h-1", intg.enabled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700")} />
                
                <div className="flex justify-between items-start mb-4 mt-1">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                       <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1" title={intg.clientName}>
                         {intg.clientName} {intg.brandCode && <span className="text-zinc-400 font-normal">({intg.brandCode})</span>}
                       </h3>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded text-xs font-bold border inline-block mt-1 mb-2', intg.enabled ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20')}>
                         {intg.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                    <span className={cn(
                      'ml-2 px-2 py-0.5 rounded text-xs font-bold border inline-block mt-1 mb-2',
                      intg.schedulerMode === 'QUEUE'
                        ? 'bg-primary-500/10 text-primary-600 border-primary-500/20 dark:text-primary-400'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
                    )}>
                      {intg.schedulerMode === 'QUEUE' ? 'QUEUE-FIRST' : 'LEGACY'}
                    </span>
                    <p className="text-xs text-zinc-500 line-clamp-1 break-all" title={intg.baseUrl}>{intg.baseUrl || 'No Base URL configured.'}</p>
                    <div className="mt-3 flex gap-2">
                      <span className="text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-300 font-mono border border-zinc-200 dark:border-zinc-700 truncate max-w-[120px]" title={intg.csvFileName}>
                        CSV: {intg.csvFileName || 'N/A'}
                      </span>
                      <span className="text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-300 font-mono border border-zinc-200 dark:border-zinc-700">
                        Try: {intg.maxRetries}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleStatus(intg.id, intg.enabled)}
                    className="p-2 text-zinc-400 hover:text-primary-500 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors shrink-0 ml-3"
                    title={intg.enabled ? "Disable" : "Enable"}
                  >
                    {intg.enabled ? <Pause className="w-4 h-4"/> : <Power className="w-4 h-4"/>}
                  </button>
                </div>
                
                 <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-white/5 mt-auto gap-2">
                    <div className="flex items-center gap-2 relative flex-1 flex-wrap">
                      <button
                        onClick={() => triggerRun(intg.id)}
                        disabled={activeActionKey === `enqueue-${intg.id}`}
                        className="inline-flex h-10 min-w-[110px] items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:hover:bg-emerald-400/20"
                      >
                        <Play className={cn('w-3.5 h-3.5', activeActionKey === `enqueue-${intg.id}` ? 'animate-pulse' : '')} /> Queue Run
                      </button>

                      {activeSchedules.length > 0 && (
                        <div className="relative">
                          <button
                            onClick={(e) => toggleDropdown(intg.id, e)}
                            className={cn(
                              "inline-flex h-10 min-w-[110px] items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors",
                              openDropdownId === intg.id 
                                ? "text-blue-700 bg-blue-100 border-blue-300 dark:bg-blue-500/20 dark:border-blue-500/40"
                                : "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 hover:bg-blue-100 dark:hover:bg-blue-400/20 border-blue-200 dark:border-blue-400/20"
                            )}
                          >
                            <Clock className="w-3.5 h-3.5" /> Run With <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                         
                         {openDropdownId === intg.id && (
                           <div className="absolute top-[calc(100%+6px)] left-0 min-w-[140px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 transform origin-top">
                             <div className="py-1">
                               <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800/50">
                                 Schedules
                               </div>
                               {activeSchedules.map((schedule, idx) => (
                                  <button
                                    key={idx}
                                    disabled={activeActionKey === `schedule-${intg.id}-${schedule.type}`}
                                    onClick={(e) => { e.stopPropagation(); triggerScheduleRun(intg.id, schedule.type); }}
                                    className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {schedule.type}
                                 </button>
                               ))}
                             </div>
                           </div>
                         )}
                        </div>
                      )}

                      <button
                        onClick={() => openCustomRunModal(intg)}
                        className="inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/20"
                      >
                        <Workflow className="w-3.5 h-3.5" /> Queue Custom
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/integrations/${intg.id}/edit`)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-zinc-200"
                      >
                        <Settings2 className="w-4 h-4"/>
                      </button>
                      <button
                        onClick={() => setIntegrationToDelete(intg)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-400 transition-colors hover:bg-red-100 hover:text-red-500 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                </div>
              </div>
            )})}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200 dark:border-white/10">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{Math.min(currentPage * itemsPerPage, filteredIntegrations.length)}</span> of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filteredIntegrations.length}</span> entries
              </span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                        currentPage === page 
                          ? "bg-primary-500 text-white shadow-md shadow-primary-500/20" 
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal 
        isOpen={!!integrationToDelete}
        title="Delete Integration"
        message={`Are you sure you want to delete ${integrationToDelete?.clientName || 'this integration'}? This action cannot be undone and will remove all associated configurations.`}
        confirmText="Delete Integration"
        cancelText="Keep It"
        dangerous={true}
        onConfirm={executeDelete}
        onCancel={() => setIntegrationToDelete(null)}
      />

      {customRunIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#14111c]">
            <div className="border-b border-zinc-200 px-6 py-4 dark:border-white/10">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Custom Run</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Queue {customRunIntegration.clientName} for a specific date window.
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">From Date</label>
                  <input
                    type="date"
                    value={customRunForm.fromDate}
                    onChange={(e) => setCustomRunForm((prev) => ({ ...prev, fromDate: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/50 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">To Date</label>
                  <input
                    type="date"
                    value={customRunForm.toDate}
                    min={customRunForm.fromDate || undefined}
                    onChange={(e) => setCustomRunForm((prev) => ({ ...prev, toDate: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/50 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">File Token (Optional)</label>
                <input
                  type="text"
                  value={customRunForm.fileToken}
                  onChange={(e) => setCustomRunForm((prev) => ({ ...prev, fileToken: e.target.value }))}
                  placeholder="backfill_20260322"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/50 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200"
                />
              </div>

              <p className="text-xs text-zinc-500">
                If you only choose a from date, the backend will queue that single day. Track the created job in Execution Jobs.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-200 px-6 py-4 dark:border-white/10">
              <button
                onClick={closeCustomRunModal}
                className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={submitCustomRun}
                disabled={submittingCustomRun}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Workflow className={cn('w-4 h-4', submittingCustomRun ? 'animate-pulse' : '')} />
                Queue Custom Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
