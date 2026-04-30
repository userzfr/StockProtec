import { Shield, Settings, LogOut, User as UserIcon, Scan } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { User } from '@/app/App';

interface HeaderProps {
  currentUser: User;
  onOpenAdmin: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onScanClick?: () => void;
  adminNotifications?: { bugReports: number; passwordResets: number };
}

export function Header({ currentUser, onOpenAdmin, onOpenSettings, onLogout, onScanClick, adminNotifications }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="bg-white rounded-full p-3 shadow-md">
              <Shield className="size-8 text-blue-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">StockProtec</h1>
              <p className="text-blue-200 text-sm mt-1">
                Protection Civile de la Loire - Antenne de Saint-Étienne
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 min-w-0">
              <UserIcon className="size-4" />
              <span className="font-medium truncate">{currentUser.username}</span>
              <Badge 
                variant={currentUser.role === 'admin' ? 'destructive' : 'secondary'}
                className="ml-2"
              >
                {currentUser.role === 'admin' ? 'ADMIN' : 'USER'}
              </Badge>
            </div>

            {onScanClick && (
              <Button
                onClick={onScanClick}
                variant="outline"
                className="bg-green-500/20 border-green-300/30 text-white hover:bg-green-500/30 hover:text-white backdrop-blur-sm min-w-[10rem]"
              >
                <Scan className="size-4 mr-2" />
                Scanner
              </Button>
            )}

            <Button
              onClick={onOpenSettings}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm min-w-[10rem]"
            >
              <Settings className="size-4 mr-2" />
              Paramètres
            </Button>

            {currentUser.role === 'admin' && (
              <Button
                onClick={onOpenAdmin}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm relative min-w-[10rem]"
              >
                <Settings className="size-4 mr-2" />
                Admin
                {adminNotifications && (adminNotifications.bugReports > 0 || adminNotifications.passwordResets > 0) && (
                  <Badge className="ml-2 bg-red-500">
                    {adminNotifications.bugReports + adminNotifications.passwordResets}
                  </Badge>
                )}
              </Button>
            )}

            <Button
              onClick={onLogout}
              variant="outline"
              className="bg-red-500/20 border-red-300/30 text-white hover:bg-red-500/30 hover:text-white backdrop-blur-sm min-w-[10rem]"
            >
              <LogOut className="size-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}