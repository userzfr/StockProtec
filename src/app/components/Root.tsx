import { Outlet } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Header } from '@/app/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Package, Pill, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { AdminPanel } from '@/app/components/AdminPanel';
import { BugReportButton } from '@/app/components/BugReportButton';

export function Root() {
  const { currentUser, logout } = useAuth();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState({ bugReports: 0, passwordResets: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Vérifier les notifications admin
    if (currentUser?.role === 'admin') {
      checkAdminNotifications();
    }
  }, [currentUser]);

  const checkAdminNotifications = () => {
    const bugReports = JSON.parse(localStorage.getItem('bugReports') || '[]');
    const newBugReports = bugReports.filter((r: any) => r.status === 'new').length;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const passwordResets = users.filter((u: any) => u.passwordResetRequested).length;

    setAdminNotifications({
      bugReports: newBugReports,
      passwordResets,
    });
  };

  const addLog = (action: string, user: string, details: string) => {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    logs.unshift({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      user,
      details,
    });
    if (logs.length > 100) logs.pop();
    localStorage.setItem('logs', JSON.stringify(logs));
  };

  const isPharmacyRoute = location.pathname === '/pharmacy';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        onLogout={logout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        adminNotifications={adminNotifications}
      />

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Tabs value={isPharmacyRoute ? 'pharmacy' : 'operational'} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 mb-6">
            <TabsTrigger
              value="operational"
              className="flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <Package className="w-4 h-4" />
              Matériel opérationnel
            </TabsTrigger>
            <TabsTrigger
              value="pharmacy"
              className="flex items-center gap-2"
              onClick={() => navigate('/pharmacy')}
            >
              <Pill className="w-4 h-4" />
              Stock pharmacie
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <Outlet />
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            Fait avec ❤️ par Mathieu.M
          </p>
        </div>
      </footer>

      {/* Admin Panel */}
      {currentUser?.role === 'admin' && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          currentUser={currentUser}
          onAddLog={addLog}
        />
      )}

      {/* Bug Report Button */}
      <BugReportButton currentUser={currentUser} />
    </div>
  );
}