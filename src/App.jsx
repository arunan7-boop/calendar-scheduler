import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/Dashboard';
import ProfessionalDashboard from './pages/professional/Dashboard';
import CreateOrganization from './pages/professional/CreateOrganization';
import OnboardingWizard from './pages/professional/onboarding/OnboardingWizard';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/join" element={<OnboardingWizard />} />
      
      <Route
        path="/org/create"
        element={
          <ProtectedRoute userType="PROFESSIONAL">
            <CreateOrganization />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/professional/onboard"
        element={
          <ProtectedRoute userType="PROFESSIONAL">
            <OnboardingWizard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/client/*"
        element={
          <ProtectedRoute userType="CLIENT">
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/professional/*"
        element={
          <ProtectedRoute userType="PROFESSIONAL">
            <ProfessionalDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={user ? (
        user.userType === 'CLIENT' ? 
          <ClientDashboard /> : 
          <ProfessionalDashboard />
      ) : (
        <Login />
      )} />
    </Routes>
  );
}

export default App;
