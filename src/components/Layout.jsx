import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-dark-bg text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200 overflow-hidden">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#14111c] border-b border-zinc-200 dark:border-white/5 flex items-center px-4 z-30">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="ml-2 font-bold text-lg flex items-center gap-2 text-primary-500 dark:text-primary-400">
          <div className="w-6 h-6 rounded bg-primary-500 flex items-center justify-center">
             <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
          Integration Hub
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 overflow-y-auto hidden-scrollbar mt-16 p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto w-full">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
