import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Users, FileText, Bug, Key, Database } from 'lucide-react';
import { UserManagement } from '@/app/components/UserManagement';
import { LogsViewer } from '@/app/components/LogsViewer';
import { BugReportsManager } from '@/app/components/BugReportsManager';
import { PasswordResetManager } from '@/app/components/PasswordResetManager';
import { BackupManager } from '@/app/components/BackupManager';
import { User } from '@/app/App';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAddLog: (action: string, user: string, details: string) => void;
  onLogout: () => void;
}

export function AdminPanel({ isOpen, onClose, currentUser, onAddLog, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 gap-0 border-0 rounded-0" aria-describedby={undefined}>
        <DialogHeader className="px-8 py-6 border-b bg-white">
          <DialogTitle className="text-4xl font-bold text-gray-900">Panneau d'Administration</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 pt-6">
            <TabsList className="grid w-full grid-cols-5 gap-2 bg-slate-100 p-3 rounded-lg">
              <TabsTrigger value="users" className="flex items-center gap-2 text-base px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold rounded-md transition-all duration-200">
                <Users className="size-6" />
                <span>Utilisateurs</span>
              </TabsTrigger>
              <TabsTrigger value="password-reset" className="flex items-center gap-2 text-base px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold rounded-md transition-all duration-200">
                <Key className="size-6" />
                <span>Réinit. MDP</span>
              </TabsTrigger>
              <TabsTrigger value="backups" className="flex items-center gap-2 text-base px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold rounded-md transition-all duration-200">
                <Database className="size-6" />
                <span>Sauvegardes</span>
              </TabsTrigger>
              <TabsTrigger value="bug-reports" className="flex items-center gap-2 text-base px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold rounded-md transition-all duration-200">
                <Bug className="size-6" />
                <span>Rapports</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2 text-base px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-bold rounded-md transition-all duration-200">
                <FileText className="size-6" />
                <span>Logs</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto bg-gray-50 px-8 py-6">
            <TabsContent value="users" className="mt-0 h-full">
              <UserManagement currentUser={currentUser} onAddLog={onAddLog} onLogout={onLogout} />
            </TabsContent>

            <TabsContent value="password-reset" className="mt-0 h-full">
              <PasswordResetManager onAddLog={onAddLog} />
            </TabsContent>

            <TabsContent value="backups" className="mt-0 h-full">
              <BackupManager currentUser={currentUser.username} onAddLog={onAddLog} />
            </TabsContent>

            <TabsContent value="bug-reports" className="mt-0 h-full">
              <BugReportsManager currentUser={currentUser} onAddLog={onAddLog} />
            </TabsContent>

            <TabsContent value="logs" className="mt-0 h-full">
              <LogsViewer />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}