import { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Search, ChevronLeft, ChevronRight, Filter, Compass, AlertCircle, Clock, Calendar, Workflow } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { cn, extractError } from '../lib/utils';

export default function RetryQueue() {
  const navigate = useNavigate();
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(null);

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const sortFailures = (items) => [...items].sort((a, b) => b.id - a.id);

  const fetchData = async () => {
    try {
      setLoading(true);
      const failuresData = await api.get('/failures');
      setFailures(sortFailures(failuresData));
    } catch (error) {
       toast.error('Failed to fetch retry queue: ' + extractError(error));
    } finally {
       setLoading(false);
    }
  };

  const waitForRetryOutcome = async (failureId, integrationId, previousLatestRunId) => {
    const timeoutAt = Date.now() + 20000;

    while (Date.now() < timeoutAt) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const [latestFailures, integrationRuns] = await Promise.all([
        api.get('/failures'),
        api.get(`/integrations/${integrationId}/runs`),
      ]);

      const sortedFailures = sortFailures(latestFailures);
      setFailures(sortedFailures);

      const latestRun = Array.isArray(integrationRuns) && integrationRuns.length > 0 ? integrationRuns[0] : null;
      const activeQueueItem = sortedFailures.find((item) => item.id === failureId && item.active !== false);

      if (latestRun && latestRun.id !== previousLatestRunId) {
        if (latestRun.status === 'SUCCESS' || latestRun.status === 'NO_DATA') {
          toast.success(`Retry finished with ${latestRun.status.toLowerCase()} for Run #${latestRun.id}.`);
          return;
        }

        if (latestRun.status === 'FAILED' || latestRun.status === 'RETRY_QUEUED') {
          const errorMessage = latestRun.errorMessage || activeQueueItem?.lastError || 'The run failed again.';
          toast.error(`Retry finished with ${latestRun.status.toLowerCase()} for Run #${latestRun.id}: ${errorMessage}`);
          return;
        }
      }

      if (!activeQueueItem && latestRun && latestRun.id === previousLatestRunId) {
        toast.success(`Retry for Failure #${failureId} was accepted and the queue item cleared.`);
        return;
      }
    }

    await fetchData();
    toast('Retry submitted. It is still processing, so check Runs History for the final result.');
  };

  const handleRetry = async (failureId, integrationId) => {
    try {
      setRetrying(failureId);
      const existingRuns = await api.get(`/integrations/${integrationId}/runs`);
      const previousLatestRunId = Array.isArray(existingRuns) && existingRuns.length > 0 ? existingRuns[0].id : null;

      await api.post(`/failures/${failureId}/retry`);
      toast.success(`Retry started for Failure #${failureId}. Waiting for result...`);
      await waitForRetryOutcome(failureId, integrationId, previousLatestRunId);
    } catch (error) {
      toast.error(`Retry failed for Failure #${failureId}: ${extractError(error)}`);
    } finally {
      setRetrying((current) => (current === failureId ? null : current));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
  };

  // Get unique categories for the filter dropdown
  const uniqueCategories = [...new Set(failures.map(f => f.failureCategory).filter(Boolean))];

  const filteredFailures = failures.filter(failure => {
    const clientName = (failure.clientName || `Integration #${failure.integrationId}`).toLowerCase();
    const stepName = (failure.failedStepName || '').toLowerCase();
    const matchesSearch = clientName.includes(searchQuery.toLowerCase()) || 
                          stepName.includes(searchQuery.toLowerCase()) || 
                          failure.id.toString().includes(searchQuery);
    
    const matchesCategory = categoryFilter === 'ALL' || failure.failureCategory === categoryFilter;
    
    let matchesDate = true;
    if (startDateFilter || endDateFilter) {
      const failDate = new Date(failure.failedAt);
      if (startDateFilter) {
        const start = new Date(startDateFilter);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && failDate >= start;
      }
      if (endDateFilter) {
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && failDate <= end;
      }
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  const totalPages = Math.ceil(filteredFailures.length / itemsPerPage);
  const currentFailures = filteredFailures.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start lg:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight text-zinc-900 dark:text-white">
             <AlertTriangle className="w-8 h-8 text-amber-500" />
             Legacy Retry Queue
           </h1>
           <p className="text-zinc-500 mt-1">Compatibility view for old retry records. Queue-first executions are tracked in Execution Jobs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#14111c] px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
          >
            <Workflow className="w-4 h-4 text-primary-500" />
            Execution Jobs
          </button>
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input 
               type="text" 
               placeholder="Search Client or Step..." 
               value={searchQuery}
               onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
               className="pl-9 pr-4 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#14111c] dark:text-zinc-200 outline-none focus:ring-2 focus:ring-amber-500/50 w-full sm:w-48 shadow-sm transition-all"
             />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg p-1 shadow-sm">
            <div className="relative group flex items-center">
              <Calendar className="w-4 h-4 absolute left-2.5 text-zinc-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" />
              <input 
                type="date"
                value={startDateFilter}
                onChange={(e) => { setStartDateFilter(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-2 py-1.5 w-full sm:w-[130px] text-xs sm:text-sm bg-transparent text-zinc-700 dark:text-zinc-200 outline-none focus:ring-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-0"
                title="Start Date"
              />
            </div>
            <div className="w-px h-4 bg-zinc-200 dark:bg-white/10"></div>
            <div className="relative group flex items-center">
              <Calendar className="w-4 h-4 absolute left-2.5 text-zinc-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" />
              <input 
                type="date"
                value={endDateFilter}
                onChange={(e) => { setEndDateFilter(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-2 py-1.5 w-full sm:w-[130px] text-xs sm:text-sm bg-transparent text-zinc-700 dark:text-zinc-200 outline-none focus:ring-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-0"
                title="End Date"
              />
            </div>
          </div>
          {uniqueCategories.length > 0 && (
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-8 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#14111c] text-zinc-700 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none shadow-sm cursor-pointer transition-all"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredFailures.length === 0 ? (
            <div className="col-span-full text-center py-16 text-zinc-500 bg-zinc-50/50 dark:bg-white/[0.02] border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl">
              {failures.length === 0 ? 'No legacy retry items found. Queue-first jobs now appear in Execution Jobs.' : 'No legacy retry items match your search criteria.'}
            </div>
          ) : currentFailures.map((failure) => {
            const clientName = failure.clientName || `Integration #${failure.integrationId}`;
            const isInactive = failure.active === false;
            const hasMaxRetries = failure.attemptCount >= failure.maxAttempts;
            const cardBadge = isInactive ? 'FAILED' : (failure.failureCategory || 'FAILED');
            const scheduleLabel = isInactive ? 'Closed At' : 'Next Retry At';
            const scheduleValue = isInactive ? formatDate(failure.updatedAt) : formatDate(failure.nextRetryAt);
             
            return (
              <div key={failure.id} className="bg-white dark:bg-[#14111c] border border-red-200 dark:border-red-500/20 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500" />
                
                <div className="flex justify-between items-start mb-4 mt-2">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1">{clientName}</h3>
                    <div className="flex gap-2 text-sm text-zinc-500 font-mono mb-3">
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">Queue #{failure.id}</span>
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">Run #{failure.runId || 'N/A'}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20 shadow-sm uppercase shrink-0">
                    {cardBadge}
                  </span>
                </div>

                <div className="bg-red-50 dark:bg-red-500/5 rounded-xl p-4 border border-red-100 dark:border-red-500/10 mb-5 relative flex-1">
                  <AlertCircle className="absolute top-4 right-4 w-12 h-12 text-red-500/[0.05] dark:text-red-500/5 pointer-events-none" />
                  
                  {failure.failedStepName && (
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
                       <Compass className="w-3.5 h-3.5" /> Step: {failure.failedStepName}
                    </div>
                  )}

                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 font-mono whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {failure.lastError || 'No error message or stack trace available.'}
                  </p>

                  {failure.failureCategory && (
                    <div className="mt-3 text-xs font-medium text-red-600/80 dark:text-red-400/80 uppercase tracking-wide">
                      Failure Type: {failure.failureCategory}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm">
                   <div>
                     <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5 font-medium flex items-center gap-1">
                        Attempts
                     </div>
                     <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {failure.attemptCount}/{failure.maxAttempts} 
                        {failure.attemptCount >= failure.maxAttempts && <span className="text-red-500 ml-1 text-xs">(Maxed)</span>}
                     </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5 font-medium flex items-center gap-1">
                         <Clock className="w-3 h-3" /> {scheduleLabel}
                      </div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                         {scheduleValue}
                      </div>
                    </div>
                 </div>

                 {isInactive ? (
                   <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-sm font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                     Retry not available for inactive queue items
                   </div>
                 ) : (
                   <button
                     onClick={(e) => { e.stopPropagation(); handleRetry(failure.id, failure.integrationId); }}
                     disabled={hasMaxRetries || retrying === failure.id}
                     className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-700 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                   >
                     <RefreshCw className={cn("w-4 h-4 transition-transform duration-500", retrying === failure.id ? "animate-spin" : "group-hover:rotate-180")} />
                     {hasMaxRetries
                       ? 'Max Retries Reached'
                       : retrying === failure.id
                         ? 'Retrying...'
                         : 'Retry Job Now'}
                   </button>
                 )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200 dark:border-white/10">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{Math.min(currentPage * itemsPerPage, filteredFailures.length)}</span> of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filteredFailures.length}</span> entries
          </span>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-transparent shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                .map((page, idx, arr) => {
                  const isGap = idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <Fragment key={page}>
                      {isGap && <span className="px-2 text-zinc-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-sm font-medium transition-colors shadow-sm",
                          currentPage === page 
                            ? "bg-amber-500 text-white shadow-amber-500/20 border border-amber-600" 
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/10 bg-white dark:bg-transparent border border-zinc-200 dark:border-white/10"
                        )}
                      >
                        {page}
                      </button>
                    </Fragment>
                  );
              })}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-transparent shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
