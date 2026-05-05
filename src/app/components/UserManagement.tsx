import { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Shield, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { User } from '@/app/App';
import { toast } from 'sonner';
import { usersApi } from '@/app/services/api';
import { UserLogsViewer } from '@/app/components/UserLogsViewer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';

interface UserManagementProps {
  currentUser: User;
  onAddLog: (action: string, user: string, details: string) => void;
  onLogout: () => void;
}

export function UserManagement({ currentUser, onAddLog, onLogout }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUserIdForLogs, setSelectedUserIdForLogs] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await usersApi.getAll();
        setUsers(fetchedUsers
          .filter((u: any) => u.id !== 'deleted-user' && u.nom !== 'Utilisateur supprimé')
          .map((u: any) => ({
            id: u.id,
            username: u.nom,
            password: '',
            role: u.role,
            createdAt: u.date_creation,
            passwordResetRequested: !!u.password_reset_requested,
            passwordResetDate: u.password_reset_date,
            blocked: !!u.blocked,
          })));
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs :', error);
        toast.error('Impossible de charger les utilisateurs');
      }
    };

    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.username || !newUser.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (users.some(u => u.username === newUser.username)) {
      toast.error('Ce nom d\'utilisateur existe déjà');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
      createdAt: new Date().toISOString(),
    };

    try {
      await usersApi.create({
        id: user.id,
        nom: user.username,
        password: user.password,
        role: user.role,
      });

      setUsers(prev => [...prev, user]);
      onAddLog('ADD_USER', currentUser.username, `Création de l'utilisateur: ${user.username} (${user.role})`);
      toast.success('Utilisateur ajouté avec succès');
      setNewUser({ username: '', password: '', role: 'user' });
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur :', error);
      toast.error('Impossible d\'ajouter l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (user.id === currentUser.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    try {
      await usersApi.delete(userId);

      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      onAddLog('DELETE_USER', currentUser.username, `Suppression de l'utilisateur: ${user.username}`);
      toast.success('Utilisateur supprimé avec succès');
      setDeletingUserId(null);

      // Valider que l'utilisateur actuel existe encore (au cas où il se serait supprimé)
      try {
        await usersApi.getById(currentUser.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Utilisateur non trouvé') || errorMessage.includes('404')) {
          toast.error('Votre compte a été supprimé. Déconnexion en cours...');
          onLogout();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur :', error);
      toast.error('Impossible de supprimer l\'utilisateur');
    }
  };

  const handleToggleBlock = async (userId: string, blocked: boolean, username: string) => {
    if (userId === currentUser.id) {
      toast.error('Vous ne pouvez pas bloquer ou débloquer votre propre compte');
      return;
    }

    try {
      await usersApi.block(userId, blocked);
      setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, blocked } : user));
      const action = blocked ? 'BLOQUE_USER' : 'UNBLOCK_USER';
      onAddLog(action, currentUser.username, `${blocked ? 'Blocage' : 'Déblocage'} de l'utilisateur: ${username}`);
      toast.success(`Utilisateur ${blocked ? 'bloqué' : 'débloqué'} avec succès`);
    } catch (error) {
      console.error('Erreur lors du changement du statut de blocage :', error);
      toast.error('Impossible de modifier le statut de l\'utilisateur');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Add User Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Ajouter un nouvel utilisateur
          </CardTitle>
          <CardDescription>
            Créez un nouveau compte utilisateur ou administrateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">Nom d'utilisateur *</Label>
                <Input
                  id="new-username"
                  placeholder="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Mot de passe *</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-role">Rôle *</Label>
                <select
                  id="new-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                  className="block w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="size-4 mr-2" />
              Ajouter l'utilisateur
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Liste des utilisateurs ({users.length})
          </CardTitle>
          <CardDescription>
            Gérez les comptes utilisateurs du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom d'utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Aucun utilisateur
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.username}
                        {user.id === currentUser.id && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Vous
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                            {user.role === 'admin' ? 'ADMIN' : 'USER'}
                          </Badge>
                          {user.blocked && (
                            <Badge variant="warning" className="text-xs">
                              Bloqué
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUserIdForLogs(user.id)}
                            title="Afficher l'historique des connexions"
                            className="hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleBlock(user.id, !user.blocked, user.username)}
                            title={user.blocked ? 'Débloquer l\'utilisateur' : 'Bloquer l\'utilisateur'}
                            className={user.blocked ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'}
                            disabled={user.id === currentUser.id}
                          >
                            {user.blocked ? 'Débloquer' : 'Bloquer'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingUserId(user.id)}
                            disabled={user.id === currentUser.id}
                            title={user.id === currentUser.id ? 'Vous ne pouvez pas supprimer votre propre compte' : 'Supprimer cet utilisateur'}
                            className="hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
              L'utilisateur sera immédiatement déconnecté s'il est connecté.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUserId && handleDeleteUser(deletingUserId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Logs Dialog */}
      <Dialog open={!!selectedUserIdForLogs} onOpenChange={(open) => {
        if (!open) setSelectedUserIdForLogs(null);
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Historique des connexions - {users.find(u => u.id === selectedUserIdForLogs)?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedUserIdForLogs && (
              <UserLogsViewer userId={selectedUserIdForLogs} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
