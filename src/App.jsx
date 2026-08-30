
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Integrations from './pages/Integrations';
import IntegrationBuilder from './pages/IntegrationBuilder';
import ExecutionJobs from './pages/ExecutionJobs';
import RunsHistory from './pages/RunsHistory';
import RetryQueue from './pages/RetryQueue';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          className: 'dark:bg-[#14111c] dark:text-zinc-100 bg-white text-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl px-5 py-3.5 rounded-2xl font-semibold',
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} 
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="integrations/new" element={<IntegrationBuilder />} />
          <Route path="integrations/:id/edit" element={<IntegrationBuilder />} />
          <Route path="jobs" element={<ExecutionJobs />} />
          <Route path="runs" element={<RunsHistory />} />
          <Route path="failures" element={<RetryQueue />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
