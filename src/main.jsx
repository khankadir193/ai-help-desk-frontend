import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './features/auth/AuthContext';
import { apiClient } from './lib/axios';
import './styles/global.css';
import App from './App.jsx';

// Fire an optional, non-blocking wake-up ping to warm up the backend
// during cold starts without delaying initial UI mount.
apiClient.get('/health').catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* v7 migration flags: silences v6→v7 transition warnings now and
          keeps identical semantics once react-router-dom v7 is installed */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
