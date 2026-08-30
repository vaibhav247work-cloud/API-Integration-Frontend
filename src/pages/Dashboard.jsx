import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Network, Workflow } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { extractError } from '../lib/utils';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [totalIntegrations, setTotalIntegrations] = useState(0);
  const [activeIntegrations, setActiveIntegrations] = useState(0);
  const [recentRuns, setRecentRuns] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [legacyFailures, setLegacyFailures] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [integrations, runs, failures, jobs] = await Promise.all([
        api.get('/integrations'),
        api.get('/runs'),
        api.get('/failures'),
        api.get('/jobs'),
      ]);

      setTotalIntegrations(integrations.length);
      setActiveIntegrations(integrations.filter(i => i.enabled).length);
      
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recent = runs.filter(r => {
         const runDate = new Date(r.createdAt || r.updatedAt || r.startedAt);
         return runDate >= oneDayAgo;
      });
      setRecentRuns(recent.length);
      setLegacyFailures(failures.filter(failure => failure.active !== false).length);
      setActiveJobs(jobs.filter(job => ['PENDING', 'CLAIMED', 'RUNNING', 'RETRY_WAIT'].includes(job.status)).length);

      // Generate last 7 days chart data
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
           date: d.toLocaleDateString('en-US', { weekday: 'short' }),
           fullDate: d.toDateString(),
           total: 0,
           failed: 0
        };
      });

      runs.forEach(r => {
         const runDate = new Date(r.createdAt || r.updatedAt || r.startedAt);
         const dayMatch = last7Days.find(d => d.fullDate === runDate.toDateString());
         if (dayMatch) {
            dayMatch.total += 1;
            if (r.status === 'FAILED') dayMatch.failed += 1;
         }
      });

      setChartData(last7Days);

    } catch (error) {
       console.error('Failed to fetch dashboard metrics', error);
       toast.error('Failed to load dashboard metrics: ' + extractError(error));
    } finally {
       setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
       <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">System Overview</h1>
        <p className="text-zinc-500 mt-1">Real-time metrics and integration health across all services.</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="Total Integrations" 
            value={totalIntegrations} 
            icon={<Network className="w-5 h-5 text-primary-500" />} 
            trend="+2 this week"
            trendUp={true}
          />
          <MetricCard 
            title="Active Integrations" 
            value={activeIntegrations} 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} 
            trend="All systems go"
            trendUp={true}
          />
          <MetricCard 
            title="Recent Runs (24h)" 
            value={recentRuns} 
            icon={<Activity className="w-5 h-5 text-blue-500" />} 
            trend="+12% vs yesterday"
            trendUp={true}
          />
          <MetricCard 
             title="Execution Jobs In Flight" 
             value={activeJobs} 
             icon={<Workflow className="w-5 h-5 text-violet-500" />} 
             trend={legacyFailures > 0 ? `${legacyFailures} legacy retries pending` : "Queue-first monitoring active"}
             trendUp={legacyFailures === 0}
           />
        </div>

        <div className="bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                 Execution Activity <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">7 Days</span>
              </h2>
              <p className="text-sm text-zinc-500">Volume and success rate of integration runs</p>
            </div>
          </div>
          <div className="h-[400px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                 <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b21ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b21ff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dx={-10} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                   itemStyle={{ color: '#e4e4e7' }}
                 />
                 <Area type="monotone" dataKey="total" stroke="#8b21ff" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Total Runs" />
                 <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorFailed)" name="Failed Runs" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, trendUp }) {
  return (
    <div className="bg-white dark:bg-[#14111c] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-zinc-100 to-transparent dark:from-white/5 dark:to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-zinc-500 dark:text-zinc-400 font-medium">{title}</h3>
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 shadow-inner">
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">{value}</div>
        {trend && (
          <div className={cn("text-xs font-semibold mt-3 flex items-center gap-1.5", trendUp ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400")}>
            <div className={cn("w-1.5 h-1.5 rounded-full", trendUp ? "bg-emerald-500" : "bg-amber-500")} />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
