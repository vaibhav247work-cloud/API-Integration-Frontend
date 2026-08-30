import { useEffect, useState } from 'react';
import {
  Workflow,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
  Calendar,
  HardDrive,
  Link,
  ShieldAlert,
  History,
  Code,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { cn, extractError } from '../lib/utils';

const ACTIVE_JOB_STATUSES = ['PENDING', 'CLAIMED', 'RUNNING', 'RETRY_WAIT'];

export default function ExecutionJobs() {
  const [jobs, setJobs] = useState([]);
  const [integrationsById, setIntegrationsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData({ showLoader: false, notifyOnError: false, background: true });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async ({ showLoader = true, notifyOnError = true, background = false } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      if (background) {
        setRefreshing(true);
      }

      const [jobsData, integrationsData] = await Promise.all([
        api.get('/jobs'),
        api.get('/integrations'),
      ]);

      const sortedJobs = [...jobsData].sort((a, b) => b.id - a.id);
      setJobs(sortedJobs);
      setIntegrationsById(
        integrationsData.reduce((accumulator, integration) => {
          accumulator[integration.id] = integration;
          return accumulator;
        }, {})
      );
      setLastUpdated(new Date());
    } catch (error) {
      if (notifyOnError) {
        toast.error('Failed to fetch execution jobs: ' + extractError(error));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'FAILED':
      case 'DEAD':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'NO_DATA':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'RUNNING':
      case 'CLAIMED':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'RETRY_WAIT':
        return 'text-violet-500 bg-violet-500/10 border-violet-500/20';
      case 'PENDING':
      default:
        return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'FAILED':
      case 'DEAD':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'NO_DATA':
        return <Database className="w-5 h-5 text-amber-500" />;
      case 'RUNNING':
      case 'CLAIMED':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'RETRY_WAIT':
        return <History className="w-5 h-5 text-violet-500" />;
      case 'PENDING':
      default:
        return <Workflow className="w-5 h-5 text-zinc-500" />;
    }
  };

  const formatDate = (dateString, includeSeconds = true) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    if (includeSeconds) options.second = '2-digit';
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const getIntegrationLabel = (job) => {
    const integration = integrationsById[job.integrationId];
    if (!integration) {
      return `Integration #${job.integrationId}`;
    }
    return integration.brandCode
      ? `${integration.clientName} (${integration.brandCode})`
      : integration.clientName;
  };

  const filteredJobs = jobs.filter((job) => {
    const integrationLabel = getIntegrationLabel(job).toLowerCase();
    const matchesSearch = integrationLabel.includes(searchQuery.toLowerCase())
      || (job.workerId || '').toLowerCase().includes(searchQuery.toLowerCase())
      || (job.dedupeKey || '').toLowerCase().includes(searchQuery.toLowerCase())
      || String(job.id).includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;

    let matchesDate = true;
    if (startDateFilter || endDateFilter) {
      const plannedDate = new Date(job.plannedFireAt);
      if (startDateFilter) {
        const start = new Date(startDateFilter);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && plannedDate >= start;
      }
      if (endDateFilter) {
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && plannedDate <= end;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeJobCount = jobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status)).length;

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col gap-4 mb-8 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight text-zinc-900 dark:text-white">
            <Workflow className="w-8 h-8 text-primary-500" />
            Execution Jobs
          </h1>
          <p className="text-zinc-500 mt-1">
            Queue-first monitoring for enqueued runs, retries, workers, and terminal job outcomes.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500">
            <span className="rounded-full border border-zinc-200 dark:border-white/10 px-3 py-1 bg-white dark:bg-[#14111c]">
              Active Queue: {activeJobCount}
            </span>
            <span className="rounded-full border border-zinc-200 dark:border-white/10 px-3 py-1 bg-white dark:bg-[#14111c]">
              Auto-refresh: 5s
            </span>
            <span className="rounded-full border border-zinc-200 dark:border-white/10 px-3 py-1 bg-white dark:bg-[#14111c]">
              Last Updated: {lastUpdated ? formatDate(lastUpdated, true) : 'Waiting...'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search Job, Integration, Worker..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#14111c] dark:text-zinc-200 outline-none focus:ring-2 focus:ring-primary-500/50 w-full sm:w-60 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/10 rounded-lg p-1 shadow-sm">
            <div className="relative group flex items-center">
              <Calendar className="w-4 h-4 absolute left-2.5 text-zinc-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10" />
              <input
                type="date"
                value={startDateFilter}
                onChange={(event) => {
                  setStartDateFilter(event.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(event) => {
                  setEndDateFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-2 py-1.5 w-full sm:w-[130px] text-xs sm:text-sm bg-transparent text-zinc-700 dark:text-zinc-200 outline-none focus:ring-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-0"
                title="End Date"
              />
            </div>
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 py-2 border border-zinc-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#14111c] text-zinc-700 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none shadow-sm cursor-pointer transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CLAIMED">Claimed</option>
              <option value="RUNNING">Running</option>
              <option value="RETRY_WAIT">Retry Wait</option>
              <option value="SUCCESS">Success</option>
              <option value="NO_DATA">No Data</option>
              <option value="FAILED">Failed</option>
              <option value="DEAD">Dead</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          <button
            onClick={() => fetchData({ showLoader: false, notifyOnError: true, background: true })}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#14111c] px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing ? 'animate-spin' : '')} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden relative transition-all duration-300">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 bg-zinc-50/50 dark:bg-white/[0.02] flex flex-col items-center">
              <Workflow className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
              <p>{searchQuery !== '' || statusFilter !== 'ALL' ? 'No execution jobs match your filters.' : 'No execution jobs found yet.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs font-bold border-b border-zinc-200 dark:border-white/10 uppercase tracking-wider">
                    <th className="px-6 py-4">Job ID</th>
                    <th className="px-6 py-4">Integration</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Planned At</th>
                    <th className="px-6 py-4">Attempts</th>
                    <th className="px-6 py-4">Worker</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                  {currentJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-zinc-500">
                        #{job.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{getIntegrationLabel(job)}</div>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mt-0.5 opacity-80">
                          {job.scheduleType}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className={cn('px-2.5 py-1 rounded-md text-xs font-bold border', getStatusColor(job.status))}>
                            {job.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {formatDate(job.plannedFireAt)}
                        {(job.status === 'RETRY_WAIT' || job.nextAttemptAt) && (
                          <div className="text-[11px] text-violet-500 mt-1">
                            Next: {formatDate(job.nextAttemptAt, false)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                        {job.attemptCount}/{job.maxAttempts}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="max-w-[220px] truncate" title={job.workerId || 'Unclaimed'}>
                          {job.workerId || 'Unclaimed'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setExpandedJob(job)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-lg transition-colors border border-primary-200 dark:border-primary-500/20 shadow-sm"
                        >
                          Show More
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/30 font-medium">
              <span className="text-sm text-zinc-500 dark:text-zinc-400 pl-2">
                Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{Math.min(currentPage * itemsPerPage, filteredJobs.length)}</span> of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filteredJobs.length}</span> entries
              </span>
              <div className="flex items-center gap-2 pr-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-transparent shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                    .map((page, index, array) => {
                      const isGap = index > 0 && page - array[index - 1] > 1;
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {isGap && <span className="px-2 text-zinc-400">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              'w-8 h-8 rounded-lg text-sm transition-colors shadow-sm',
                              currentPage === page
                                ? 'bg-primary-500 text-white shadow-primary-500/30 border border-primary-600 font-bold'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/10 bg-white dark:bg-transparent border border-zinc-200 dark:border-white/10'
                            )}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-transparent shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {expandedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/90 dark:bg-[#14111c]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col zoom-in-95 animate-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-200/50 dark:border-white/10">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Workflow className="w-5 h-5 text-primary-500" />
                Execution Job Details: #{expandedJob.id}
              </h2>
              <button
                onClick={() => setExpandedJob(null)}
                className="p-2 -mr-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto hidden-scrollbar flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="space-y-4 col-span-1 lg:col-span-2 xl:col-span-1 border-r border-transparent xl:border-zinc-200/50 dark:xl:border-white/5 xl:pr-6">
                  <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Queue Summary
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm backdrop-blur-md">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Status</div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(expandedJob.status)}
                        <span className={cn('px-2 py-1 rounded text-xs font-bold border', getStatusColor(expandedJob.status))}>
                          {expandedJob.status}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm backdrop-blur-md">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Attempts</div>
                      <div className="text-xl font-black text-zinc-800 dark:text-zinc-200">{expandedJob.attemptCount}/{expandedJob.maxAttempts}</div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm col-span-2 backdrop-blur-md">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Planned Fire</div>
                      <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{formatDate(expandedJob.plannedFireAt)}</div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm col-span-2 backdrop-blur-md">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Window</div>
                      <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {formatDate(expandedJob.windowStart, false)} <span className="text-zinc-400 mx-1">-&gt;</span> {formatDate(expandedJob.windowEnd, false)}
                      </div>
                    </div>
                    {expandedJob.fileToken && (
                      <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm col-span-2 backdrop-blur-md">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><HardDrive className="w-3 h-3" /> File Token</div>
                        <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all">{expandedJob.fileToken}</div>
                      </div>
                    )}
                    <div className="bg-white/50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-xl p-3 shadow-sm col-span-2 backdrop-blur-md">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Link className="w-3 h-3" /> Dedupe Key</div>
                      <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all">{expandedJob.dedupeKey}</div>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 lg:col-span-2">
                  <div className="grid gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-primary-500" /> Worker And Lease
                      </h4>
                      <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md border border-zinc-200/50 dark:border-white/5 rounded-xl p-4 shadow-sm">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Integration</div>
                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{getIntegrationLabel(expandedJob)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Worker</div>
                            <div className="text-sm font-mono text-zinc-700 dark:text-zinc-300 break-all">{expandedJob.workerId || 'Unclaimed'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Claimed At</div>
                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{formatDate(expandedJob.claimedAt)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Lease Until</div>
                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{formatDate(expandedJob.leaseUntil)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Started At</div>
                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{formatDate(expandedJob.startedAt)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Finished At</div>
                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{formatDate(expandedJob.finishedAt)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(expandedJob.lastFailureCategory || expandedJob.lastFailedStepName || expandedJob.lastHttpStatus || expandedJob.lastError) && (
                      <div>
                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-500" /> Failure Snapshot
                        </h4>
                        <div className="bg-red-50/80 dark:bg-red-500/10 backdrop-blur-md border border-red-200/50 dark:border-red-500/20 rounded-xl p-4 shadow-inner">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {expandedJob.lastFailureCategory && (
                              <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold rounded uppercase">
                                {expandedJob.lastFailureCategory}
                              </span>
                            )}
                            {expandedJob.lastFailedStepName && (
                              <span className="inline-block text-xs font-mono text-red-500 dark:text-red-400 bg-white/50 dark:bg-black/20 px-2 py-1 rounded border border-red-200/50 dark:border-red-500/20">
                                Step: {expandedJob.lastFailedStepName}
                              </span>
                            )}
                            {expandedJob.lastHttpStatus && (
                              <span className="inline-block text-xs font-mono text-red-500 dark:text-red-400 bg-white/50 dark:bg-black/20 px-2 py-1 rounded border border-red-200/50 dark:border-red-500/20">
                                HTTP: {expandedJob.lastHttpStatus}
                              </span>
                            )}
                          </div>
                          <pre className="text-xs font-mono text-red-800 dark:text-red-200 whitespace-pre-wrap">
                            {expandedJob.lastError || 'No stored error payload.'}
                          </pre>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-500" /> Queue Payload
                      </h4>
                      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 shadow-inner overflow-auto custom-scrollbar max-h-56">
                        <pre className="text-xs font-mono text-blue-100 whitespace-pre-wrap">
                          {JSON.stringify(expandedJob, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200/50 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setExpandedJob(null)}
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
