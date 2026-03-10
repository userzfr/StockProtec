import { useState, useEffect } from 'react';
import { Key, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { User } from '@/app/App';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PasswordResetManagerProps {
  onAddLog: (action: string, user: string, details: string) => void;
}

export function PasswordResetManager({ onAddLog }: PasswordResetManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(allUsers);
  };

  const pendingResets = users.filter(u => u.passwordResetRequested);

  const handleResetPassword = () => {
    if (!selectedUser || !newPassword) {
      toast.error('Veuillez entrer un nouveau mot de passe');
      return;
    }

    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          password: newPassword,
          passwordResetRequested: false,
          passwordResetDate: undefined,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    onAddLog('PASSWORD_RESET', 'admin', `Réinitialisation du mot de passe pour ${selectedUser.username}`);
    toast.success(`Mot de passe réinitialisé pour ${selectedUser.username}`);
    
    setIsResetDialogOpen(false);
    setSelectedUser(null);
    setNewPassword('');
  };

  const handleRejectReset = (userId: string, username: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          passwordResetRequested: false,
          passwordResetDate: undefined,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    onAddLog('PASSWORD_RESET_REJECTED', 'admin', `Demande de réinitialisation rejetée pour ${username}`);
    toast.info(`Demande rejetée pour ${username}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Key className="size-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Demandes de réinitialisation de mot de passe</h3>
        {pendingResets.length > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {pendingResets.length} en attente
          </Badge>
        )}
      </div>

      {pendingResets.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Key className="size-12 mx-auto mb-4 opacity-20" />
          <p>Aucune demande de réinitialisation en attente</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Date de la demande</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingResets.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <span className="font-medium">{user.username}</span>
                  </TableCell>
                  <TableCell>
                    {user.passwordResetDate ? (
                      format(new Date(user.passwordResetDate), 'dd/MM/yyyy HH:mm', { locale: fr })
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsResetDialogOpen(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="size-4 mr-1" />
                      Réinitialiser
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectReset(user.id, user.username)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="size-4 mr-1" />
                      Rejeter
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              Définir un nouveau mot de passe pour {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Entrez le nouveau mot de passe"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleResetPassword} className="bg-blue-600 hover:bg-blue-700">
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
