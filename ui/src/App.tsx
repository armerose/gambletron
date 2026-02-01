import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAppStore } from './store';
import './styles/index.css';

// Layouts
import RootLayout from './components/layout/RootLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import CreateAgent from './pages/CreateAgent';
import AgentDetail from './pages/AgentDetail';
import Monitor from './pages/Monitor';
import Analytics from './pages/Analytics';
import Logs from './pages/Logs';
import Strategies from './pages/Strategies';
import DataSources from './pages/DataSources';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, gcTime: 1000 * 60 * 5 },
  },
});

export default function App() {
  const { isDarkMode } = useAppStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className={isDarkMode ? 'dark' : ''}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/create" element={<CreateAgent />} />
              <Route path="/agents/:id" element={<AgentDetail />} />
              <Route path="/monitor" element={<Monitor />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/data-sources" element={<DataSources />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}
