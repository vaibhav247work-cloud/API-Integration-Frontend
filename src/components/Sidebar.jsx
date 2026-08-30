import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Network, History, AlertTriangle, Blocks, Workflow, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: Network, label: 'Integrations', path: '/integrations' },
    { icon: Workflow, label: 'Execution Jobs', path: '/jobs' },
    { icon: History, label: 'Runs History', path: '/runs' },
    { icon: AlertTriangle, label: 'Legacy Retry Queue', path: '/failures' }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#14111c] border-r border-zinc-200 dark:border-white/5 flex flex-col transition-transform duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400">
               <Blocks className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <span>Integration Hub</span>
          </div>
          <button 
            className="p-2 -mr-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive 
                    ? "bg-primary-500/10 text-primary-700 dark:text-primary-400" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary-600 dark:text-primary-400" : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>


      </div>
    </>
  );
}
