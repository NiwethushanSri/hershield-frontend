import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import SOSPage      from './pages/SOSPage';
import TrustedCircle from './pages/TrustedCircle';
import SafeRoute    from './pages/SafeRoute';
import CommunityMap from './pages/CommunityMap';
import MoreHub      from './pages/MoreHub';
import AIChatPage   from './pages/AIChatPage';
import EvidenceVault from './pages/EvidenceVault';
import DVMode       from './pages/DVMode';
import MissingPerson from './pages/MissingPerson';
import LegalHelp    from './pages/LegalHelp';
import CyberSafety  from './pages/CyberSafety';
import MentalHealth from './pages/MentalHealth';
import SafeBusinesses from './pages/SafeBusinesses';
import BottomNav    from './components/BottomNav';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-xl">
          <span className="text-3xl">🛡️</span>
        </div>
        <p className="text-violet-600 font-semibold">HerShield</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Pages that get the bottom nav
const NAV_ROUTES = ['/', '/sos', '/circle', '/map', '/more'];

function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <div className="flex-1 pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}

// Full-screen pages (no bottom nav padding needed)
function FullLayout({ children }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <div className="flex-1 pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <Protected>
            <AppLayout>
              <Routes>
                <Route path="/"           element={<Dashboard />}     />
                <Route path="/sos"        element={<SOSPage />}       />
                <Route path="/circle"     element={<TrustedCircle />} />
                <Route path="/route"      element={<SafeRoute />}     />
                <Route path="/map"        element={<CommunityMap />}  />
                <Route path="/more"       element={<MoreHub />}       />
                <Route path="/chat"       element={<AIChatPage />}    />
                <Route path="/vault"      element={<EvidenceVault />} />
                <Route path="/dv-mode"    element={<DVMode />}        />
                <Route path="/missing"    element={<MissingPerson />} />
                <Route path="/legal"      element={<LegalHelp />}     />
                <Route path="/cyber"      element={<CyberSafety />}   />
                <Route path="/mental"     element={<MentalHealth />}  />
                <Route path="/businesses" element={<SafeBusinesses />}/>
              </Routes>
            </AppLayout>
          </Protected>
        } />
      </Routes>
    </AuthProvider>
  );
}
