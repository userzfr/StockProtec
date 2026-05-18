import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { usersApi } from '@/app/services/api';

interface UserSettingsDialogProps {
  userId: string;
  user: {
    username: string;
    email?: string;
    role: 'admin' | 'user';
    createdAt: string;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordChanged: () => void;
}

export function UserSettingsDialog({ userId, user, isOpen, onOpenChange, onPasswordChanged }: UserSettingsDialogProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Tous les champs sont requis');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setIsLoading(true);
      await usersApi.changePassword(userId, oldPassword, newPassword);
      toast.success('Mot de passe modifié avec succès');
      onPasswordChanged();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe :', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de modifier le mot de passe';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="settings-description">
        <DialogHeader>
          <DialogTitle>Paramètres du compte</DialogTitle>
        </DialogHeader>

        <div id="settings-description" className="space-y-4 py-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-900">Informations du compte</p>
              <p className="text-xs text-gray-600">Détails de votre profil pour mieux vous repérer dans l'application.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3 border border-gray-200">
                <p className="text-xs uppercase tracking-wide text-gray-500">Nom d'utilisateur</p>
                <p className="mt-1 font-medium text-gray-900">{user.username}</p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-gray-200">
                <p className="text-xs uppercase tracking-wide text-gray-500">Adresse email</p>
                <p className="mt-1 font-medium text-gray-900">{user.email || 'Non renseignée'}</p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-gray-200">
                <p className="text-xs uppercase tracking-wide text-gray-500">Rôle</p>
                <p className="mt-1 font-medium text-gray-900 capitalize">{user.role}</p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-gray-200">
                <p className="text-xs uppercase tracking-wide text-gray-500">Inscrit le</p>
                <p className="mt-1 font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="old-password">Ancien mot de passe</Label>
            <Input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Entrez votre ancien mot de passe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Entrez votre nouveau mot de passe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre nouveau mot de passe"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Modifier le mot de passe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
