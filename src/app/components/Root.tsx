import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Header } from '@/app/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Package, Pill, Settings } from 'lucide-react';
import { AdminPanel } from '@/app/components/AdminPanel';
import { UserSettingsDialog } from '@/app/components/UserSettingsDialog';
import { BugReportButton } from '@/app/components/BugReportButton';
import { bugReportsApi, usersApi, logsApi } from '@/app/services/api';

export function Root() {
  const { currentUser, logout } = useAuth();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState({ bugReports: 0, passwordResets: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Vérifier les notifications admin au chargement
    if (currentUser?.role === 'admin') {
      checkAdminNotifications();
    }
  }, [currentUser]);

  // Polling pour les notifications en temps quasi-réel
  useEffect(() => {
    if (currentUser?.role !== 'admin') return;

    // Vérifier les notifications immédiatement quand le panneau admin s'ouvre
    if (isAdminOpen) {
      checkAdminNotifications();
    }

    // Puis configurer le polling toutes les 10 secondes
    const interval = setInterval(() => {
      checkAdminNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser, isAdminOpen]);

  const checkAdminNotifications = async () => {
    try {
      const bugReports = await bugReportsApi.getAll();
      const newBugReports = (bugReports || []).filter((r: any) => r.status === 'new').length;

      const users = await usersApi.getAll();
      const passwordResets = (users || []).filter((u: any) => u.password_reset_requested).length;

      setAdminNotifications({
        bugReports: newBugReports,
        passwordResets,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications admin :', error);
    }
  };

  const addLog = async (action: string, user: string, details: string) => {
    try {
      await logsApi.create({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action,
        user,
        details,
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du log :', error);
    }
  };

  const isPharmacyRoute = location.pathname === '/pharmacy';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        onLogout={logout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        adminNotifications={adminNotifications}
      />

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Tabs
          value={isPharmacyRoute ? 'pharmacy' : 'operational'}
          onValueChange={(value) => navigate(value === 'pharmacy' ? '/pharmacy' : '/')}
          className="w-full"
        >
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 mb-6">
            <TabsTrigger value="operational" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Matériel opérationnel
            </TabsTrigger>
            <TabsTrigger value="pharmacy" className="flex items-center gap-2">
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
            <span className="mx-2">|</span>
            <Link to="/legal" className="text-blue-600 hover:text-blue-800 hover:underline">
              Mentions légales
            </Link>
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
          onLogout={logout}
        />
      )}

      {currentUser && (
        <UserSettingsDialog
          userId={currentUser.id}
          user={currentUser}
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          onPasswordChanged={() => addLog('PASSWORD_CHANGE', currentUser.username, `Mot de passe modifié pour ${currentUser.username}`)}
        />
      )}

      {/* Bug Report Button */}
      <BugReportButton currentUser={currentUser} onAddLog={addLog} />
    </div>
  );
}