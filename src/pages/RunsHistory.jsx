import React, { useState, useEffect } from 'react';
import { History, FileText, CheckCircle2, XCircle, Clock, ChevronDown, Search, Filter, ChevronLeft, ChevronRight, HardDrive, Calendar, Database, ShieldAlert, Cpu, Link, Globe, Code, Workflow } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { cn, extractError } from '../lib/utils';

export default function RunsHistory() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedRunId, setExpandedRunId] = useState(null);
  
  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const runsData = await api.get('/runs');
      // Sort runs by newest first
      const sortedRuns = runsData.sort((a, b) => b.id - a.id);
      setRuns(sortedRuns);
    } catch (error) {
      toast.error('Failed to fetch runs history: ' + extractError(error));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'FAILED': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'RETRY_QUEUED': return 'text-violet-500 bg-violet-500/10 border-violet-500/20';
      case 'NO_DATA': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'RUNNING': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'RETRY_QUEUED': return <History className="w-5 h-5 text-violet-500" />;
      case 'NO_DATA': return <Database className="w-5 h-5 text-amber-500" />;
      case 'RUNNING': return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      default: return <FileText className="w-5 h-5 text-zinc-500" />;
    }
  };

  const calculateDuration = (run) => {
    const start = run.startedAt;
    const end = run.finishedAt;
    
    if (!start) return 'N/A';
    if (!end || run.status === 'RUNNING') return 'Running...';
    
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const durationMs = endTime - startTime;
    
    if (durationMs < 0) return '0s';
    
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatDate = (dateString, includeSeconds = true) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    if (includeSeconds) options.second = '2-digit';
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const filteredRuns = runs.filter(run => {
    const clientName = (run.clientName || '').toLowerCase();
    const correlationId = (run.correlationId || '').toLowerCase();
    const matchesSearch = clientName.includes(searchQuery.toLowerCase()) || 
                          correlationId.includes(searchQuery.toLowerCase()) ||
                          String(run.executionJobId || '').includes(searchQuery) ||
                          run.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || run.status === statusFilter;
    
    let matchesDate = true;
    if (startDateFilter || endDateFilter) {
      const runDate = new Date(run.startedAt);
      if (startDateFilter) {
        const start = new Date(startDateFilter);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && runDate >= start;
      }
      if (endDateFilter) {
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && runDate <= end;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredRuns.length / itemsPerPage);
  const currentRuns = filteredRuns.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start lg:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight text-zinc-900 dark:text-white">
             <History className="w-8 h-8 text-primary-500" />
             Runs History
            </h1>
           <p className="text-zinc-500 mt-1">Detailed execution logs, payload diagnostics, and queue-linked run outcomes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input 
               type="text" 
               placeholder="Search Client, Run, or Job..." 
               value={searchQuery}
               onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
               className="pl-9 pr-4 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#14111c] dark:text-zinc-200 outline-none focus:ring-2 focus:ring-primary-500/50 w-full sm:w-48 shadow-sm transition-all"
             />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg p-1 shadow-sm">
            <div className="relative group flex items-center">
              <Calendar className="w-4 h-4 absolute left-2.5 text-zinc-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10" />
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
              <Calendar className="w-4 h-4 absolute left-2.5 text-zinc-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10" />
              <input 
                type="date"
                value={endDateFilter}
                onChange={(e) => { setEndDateFilter(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-2 py-1.5 w-full sm:w-[130px] text-xs sm:text-sm bg-transparent text-zinc-700 dark:text-zinc-200 outline-none focus:ring-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-0"
                title="End Date"
              />
            </div>
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-8 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#14111c] text-zinc-700 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none shadow-sm cursor-pointer transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="RETRY_QUEUED">Retry Queued</option>
              <option value="NO_DATA">No Data</option>
              <option value="RUNNING">Running</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden relative transition-all duration-300">
          {filteredRuns.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 bg-zinc-50/50 dark:bg-white/[0.02] flex flex-col items-center">
              <History className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
              <p>{searchQuery !== '' || statusFilter !== 'ALL' ? 'No runs match your filters.' : 'No execution history found.'}</p>
            </div>
          ) : (
             <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs font-bold border-b border-zinc-200 dark:border-white/10 uppercase tracking-wider">
                     <th className="px-6 py-4">Run ID</th>
                     <th className="px-6 py-4">Integration Client</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Started At</th>
                     <th className="px-6 py-4">Duration</th>
                     <th className="px-6 py-4">Records</th>
                     <th className="px-6 py-4 text-right">Details</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                   {currentRuns.map((run) => {
                     const clientName = run.clientName || `Integration #${run.integrationId}`;

                     return (
                          <tr key={run.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4 text-sm font-mono text-zinc-500">
                              <div>#{run.id}</div>
                              {run.executionJobId && (
                                <div className="mt-1 text-[11px] font-semibold text-primary-500">
                                  Job #{run.executionJobId}
                                </div>
                              )}
                            </td>
                           <td className="px-6 py-4">
                             <div className="font-semibold text-zinc-900 dark:text-zinc-100">{clientName}</div>
                             {run.scheduleType && (
                               <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mt-0.5 opacity-80">{run.scheduleType}</div>
                             )}
                           </td>
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                               {getStatusIcon(run.status)}
                               <span className={cn('px-2.5 py-1 rounded-md text-xs font-bold border', getStatusColor(run.status))}>
                                 {run.status}
                               </span>
                             </div>
                           </td>
                           <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                             {formatDate(run.startedAt)}
                           </td>
                           <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                             {calculateDuration(run)}
                           </td>
                           <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 font-semibold font-mono">
                             {run.status === 'SUCCESS' ? (run.recordsProcessed ?? 0) : '-'}
                           </td>
                           <td className="px-6 py-4 text-right">
                             <button 
                               onClick={() => setExpandedRunId(run)}
                               className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-lg transition-colors border border-primary-200 dark:border-primary-500/20 shadow-sm"
                             >
                               Show More
                             </button>
                           </td>
                         </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/30 font-medium">
              <span className="text-sm text-zinc-500 dark:text-zinc-400 pl-2">
                Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{Math.min(currentPage * itemsPerPage, filteredRuns.length)}</span> of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filteredRuns.length}</span> entries
              </span>
              <div className="flex items-center gap-2 pr-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-transparent shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                    .map((page, idx, arr) => {
                      const isGap = idx > 0 && page - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={page}>
                          {isGap && <span className="px-2 text-zinc-400">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "w-8 h-8 rounded-lg text-sm transition-colors shadow-sm",
                              currentPage === page 
                                ? "bg-primary-500 text-white shadow-primary-500/30 border border-primary-600 font-bold" 
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/10 bg-white dark:bg-transparent border border-zinc-200 dark:border-white/10"
                            )}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                  })}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-transparent shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Glass Modal for Expanded Details */}
      {expandedRunId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/90 dark:bg-[#14111c]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col zoom-in-95 animate-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-200/50 dark:border-white/10">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <History className="w-5 h-5 text-primary-500" />
                Run Details: #{expandedRunId.id}
              </h2>
              <button 
                onClick={() => setExpandedRunId(null)}
                className="p-2 -mr-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto hidden-scrollbar flex-1">
               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                 {/* Summary Cards */}
                 <div className="space-y-4 col-span-1 lg:col-span-2 xl:col-span-1 border-r border-transparent xl:border-zinc-200/50 dark:xl:border-white/5 xl:pr-6">
                    <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4" /> Execution Summary
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm backdrop-blur-md">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Records Processed</div>
                        <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">{expandedRunId.recordsProcessed ?? 0}</div>
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm backdrop-blur-md">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Attempt Number</div>
                        <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">{expandedRunId.attemptNumber ?? 1}</div>
                      </div>
                      {expandedRunId.executionJobId && (
                        <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm col-span-2 backdrop-blur-md">
                          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Workflow className="w-3 h-3" /> Execution Job</div>
                          <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Job #{expandedRunId.executionJobId}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">
                            This run was started through the queue-first execution pipeline.
                          </div>
                        </div>
                      )}
                      <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm col-span-2 backdrop-blur-md">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Finished At</div>
                        <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          {formatDate(expandedRunId.finishedAt, true)}
                        </div>
                      </div>
                      {expandedRunId.scheduleType && (
                        <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm col-span-2 backdrop-blur-md">
                          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Time Window</div>
                          <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            {formatDate(expandedRunId.windowStart, false)} <span className="text-zinc-400 mx-1">-&gt;</span> {formatDate(expandedRunId.windowEnd, false)}
                          </div>
                        </div>
                      )}
                      {expandedRunId.fileToken && (
                        <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm col-span-2 backdrop-blur-md">
                          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><HardDrive className="w-3 h-3"/> File Token</div>
                          <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all">{expandedRunId.fileToken}</div>
                        </div>
                      )}
                      <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm col-span-2 backdrop-blur-md">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Link className="w-3 h-3"/> Correlation ID</div>
                        <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all">{expandedRunId.correlationId || 'N/A'}</div>
                      </div>
                    </div>
                 </div>

                 {/* Payload / Context Details */}
                 <div className="col-span-1 lg:col-span-2">
                   <div className="grid gap-6">
                     {expandedRunId.outputLocation && (
                       <div>
                          <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-emerald-500" /> Output Location
                          </h4>
                          <div className="bg-emerald-50/80 dark:bg-emerald-500/10 backdrop-blur-md border border-emerald-200/50 dark:border-emerald-500/20 rounded-xl p-3 text-sm font-mono text-emerald-800 dark:text-emerald-300 break-all shadow-inner">
                            {expandedRunId.outputLocation}
                          </div>
                       </div>
                     )}

                     {(expandedRunId.failedRequestUrl || expandedRunId.httpStatusCode) && (
                       <div>
                          <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-amber-500" /> Request Details
                          </h4>
                          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md border border-zinc-200/50 dark:border-white/5 rounded-xl p-4 shadow-sm">
                            {expandedRunId.httpStatusCode && (
                              <div className="mb-3">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mr-2">Status Code:</span>
                                <span className={cn("px-2 py-0.5 rounded text-xs font-bold", 
                                  expandedRunId.httpStatusCode >= 200 && expandedRunId.httpStatusCode < 300 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400")}>
                                  {expandedRunId.httpStatusCode}
                                </span>
                              </div>
                            )}
                            {expandedRunId.failedRequestUrl && (
                              <div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Target URL:</span>
                                <div className="text-xs font-mono bg-zinc-50/50 dark:bg-black/40 p-2 rounded border border-zinc-200/50 dark:border-white/5 text-amber-700 dark:text-amber-400 break-all">
                                  {expandedRunId.failedRequestUrl}
                                </div>
                              </div>
                            )}
                          </div>
                       </div>
                     )}

                     {expandedRunId.errorMessage && (
                       <div>
                          <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" /> Error Trace
                          </h4>
                          <div className="bg-red-50/80 dark:bg-red-500/10 backdrop-blur-md border border-red-200/50 dark:border-red-500/20 rounded-xl p-4 shadow-inner overflow-auto custom-scrollbar max-h-48">
                            {expandedRunId.failureCategory && (
                              <span className="inline-block px-2 py-1 bg-red-100 stretch dark:bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold rounded mb-2 uppercase">
                                {expandedRunId.failureCategory}
                              </span>
                            )}
                            {expandedRunId.failedStepName && (
                              <span className="inline-block ml-2 text-xs font-mono text-red-500 dark:text-red-400 bg-white/50 dark:bg-black/20 px-2 py-1 rounded border border-red-200/50 dark:border-red-500/20 mb-2">
                                [Step: {expandedRunId.failedStepName}]
                              </span>
                            )}
                            <pre className="text-xs font-mono text-red-800 dark:text-red-200 whitespace-pre-wrap">
                              {expandedRunId.errorMessage}
                            </pre>
                          </div>
                       </div>
                     )}

                     {expandedRunId.responsePreview && (
                       <div>
                          <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Code className="w-4 h-4 text-blue-500" /> Response Preview
                          </h4>
                          <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 shadow-inner overflow-auto custom-scrollbar max-h-48">
                            <pre className="text-xs font-mono text-blue-100 whitespace-pre-wrap">
                              {expandedRunId.responsePreview}
                            </pre>
                          </div>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
            </div>
            
            <div className="p-4 border-t border-zinc-200/50 dark:border-white/10 flex justify-end">
              <button 
                onClick={() => setExpandedRunId(null)}
                className="px-5 py-2 rounded-lg font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100/80 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
