import { useState } from 'react';
import { Shield, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { AuthUser } from '@/app/App';
import { toast } from 'sonner';
import { usersApi } from '@/app/services/api';

interface LoginPageProps {
  onLogin: (user: AuthUser, sessionId: string | null) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Utiliser l'API pour authentifier
      const user = await usersApi.login(username, password);
      
      // Convertir la réponse au format User attendu par l'app sans stocker le mot de passe
      const appUser: AuthUser = {
        id: user.id,
        username: user.nom,
        role: user.role,
        createdAt: user.date_creation,
      };

      toast.success(`Bienvenue ${appUser.username} !`);
      onLogin(appUser, user.sessionId || null);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Identifiants incorrects';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetUsername.trim()) {
      toast.error('Veuillez entrer votre nom d\'utilisateur');
      return;
    }

    try {
      const users = await usersApi.getAll();
      const user = users.find((u: any) => u.nom === resetUsername);

      if (!user) {
        toast.error('Utilisateur non trouvé');
        return;
      }

      await usersApi.update(user.id, {
        nom: user.nom,
        email: user.email,
        password: user.password,
        role: user.role,
        passwordResetRequested: true,
        passwordResetDate: new Date().toISOString(),
      });

      toast.success('Demande de réinitialisation envoyée à l\'administrateur');
      setIsForgotPasswordOpen(false);
      setResetUsername('');
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation :', error);
      toast.error('Impossible d\'envoyer la demande de réinitialisation');
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

        {/* Login Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder au système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mot de passe oublié</DialogTitle>
            <DialogDescription>
              Entrez votre nom d'utilisateur. Une notification sera envoyée à l'administrateur pour réinitialiser votre mot de passe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-username">Nom d'utilisateur</Label>
              <Input
                id="reset-username"
                type="text"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
                placeholder="Votre nom d'utilisateur"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForgotPasswordOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleForgotPassword} className="bg-blue-600 hover:bg-blue-700">
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
