import './styles/index.css';
import './styles/layout.css';
import './styles/buttons.css';
import './styles/cards.css';
import './styles/forms.css';
import './styles/tables.css';
// import './styles/utils.css'; // Deprecated or kept for flex utilities
import './styles/utils.css'; 

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthProvider';
import { ThemeProvider } from './contexts/ThemeProvider';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/history" element={<History />} />
                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
