import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import LoginPage from './pages/login-page';
import ProtectedRoute from './components/protected-route';
import { ClientDetail } from './pages/client-detail';
import { AnnualSummary } from './pages/annual-summary';
import { Dashboard } from './pages/dashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-4 bg-gray-50">
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['SGR', 'ADM']}>
              <h1 className="text-2xl">Benvenuto Admin</h1>
            </ProtectedRoute>
          } />

          <Route path="/trainer-dashboard" element={
            <ProtectedRoute allowedRoles={['IST', 'ADM']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['IST', 'ADM']}>
              <ClientDetail />
            </ProtectedRoute>
          } />

          <Route path="/annual-summary" element={
            <ProtectedRoute allowedRoles={['IST', 'ADM']}>
              <AnnualSummary />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;