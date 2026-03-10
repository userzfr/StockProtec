import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Users, FileText, Bug, Key } from 'lucide-react';
import { UserManagement } from '@/app/components/UserManagement';
import { LogsViewer } from '@/app/components/LogsViewer';
import { BugReportsManager } from '@/app/components/BugReportsManager';
import { PasswordResetManager } from '@/app/components/PasswordResetManager';
import { User } from '@/app/App';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAddLog: (action: string, user: string, details: string) => void;
}

export function AdminPanel({ isOpen, onClose, currentUser, onAddLog }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Panneau d'Administration</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="size-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="password-reset" className="flex items-center gap-2">
              <Key className="size-4" />
              Réinit. MDP
            </TabsTrigger>
            <TabsTrigger value="bug-reports" className="flex items-center gap-2">
              <Bug className="size-4" />
              Rapports
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="size-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="users" className="mt-0 h-full">
              <UserManagement currentUser={currentUser} onAddLog={onAddLog} />
            </TabsContent>

            <TabsContent value="password-reset" className="mt-0 h-full">
              <PasswordResetManager onAddLog={onAddLog} />
            </TabsContent>

            <TabsContent value="bug-reports" className="mt-0 h-full">
              <BugReportsManager currentUser={currentUser} />
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