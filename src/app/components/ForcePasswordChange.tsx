import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { AuthUser } from '@/app/App';
import { toast } from 'sonner';
import { usersApi } from '@/app/services/api';

interface ForcePasswordChangeProps {
  user: AuthUser;
  sessionId: string;
  onPasswordChanged: () => void;
}

export function ForcePasswordChange({ user, sessionId, onPasswordChanged }: ForcePasswordChangeProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = () => {
    if (!currentPassword.trim()) {
      toast.error('Veuillez entrer votre mot de passe actuel');
      return false;
    }
    if (!newPassword.trim()) {
      toast.error('Veuillez entrer votre nouveau mot de passe');
      return false;
    }
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }
    if (newPassword === currentPassword) {
      toast.error('Le nouveau mot de passe doit être différent de l\'ancien');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    try {
      await usersApi.changePassword(user.id, currentPassword, newPassword);
      toast.success('Mot de passe changé avec succès !');
      onPasswordChanged();
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de changer le mot de passe';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-white rounded-full p-4 shadow-2xl mb-4">
            <Shield className="size-12 text-blue-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">StockProtec</h1>
          <p className="text-blue-200">
            Protection Civile de la Loire - Antenne de Saint-Étienne
          </p>
        </div>

        {/* Password Change Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="size-5 text-blue-600" />
              <CardTitle className="text-2xl">Changement de mot de passe requis</CardTitle>
            </div>
            <CardDescription>
              Pour votre sécurité, veuillez changer votre mot de passe lors de votre première connexion
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-900">
              <AlertDescription>
                Vous êtes connecté en tant que <strong>{user.username}</strong>. Veuillez définir un nouveau mot de passe sécurisé.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe actuel"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Entrez votre nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Changement en cours...' : 'Changer le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
