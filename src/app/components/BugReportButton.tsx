import { useState } from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { BugReport } from '@/app/App';
import { useLocation } from 'react-router';
import { bugReportsApi } from '@/app/services/api';

interface BugReportButtonProps {
  currentUser: { username: string };
  onAddLog: (action: string, user: string, details: string) => Promise<void>;
}

export function BugReportButton({ currentUser, onAddLog }: BugReportButtonProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentPage = () => {
    switch (location.pathname) {
      case '/':
        return 'Matériel opérationnel';
      case '/pharmacy':
        return 'Stock pharmacie';
      default:
        if (location.pathname.startsWith('/bag/')) {
          return 'Détail du sac';
        }
        return location.pathname;
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Veuillez décrire le bug');
      return;
    }

    setIsSubmitting(true);

    try {
      const newReport: BugReport = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        user: currentUser.username,
        page: getCurrentPage(),
        description: description.trim(),
        userAgent: navigator.userAgent,
        status: 'new',
      };

      await bugReportsApi.create(newReport);
      await onAddLog(
        'CREATE_BUG_REPORT',
        currentUser.username,
        `Création d'un rapport de bug sur ${newReport.page} : ${newReport.description}`
      );

      setDescription('');
      setIsOpen(false);
      toast.success('Rapport de bug envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rapport:', error);
      toast.error('Erreur lors de l\'envoi du rapport');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="fixed bottom-4 left-4 opacity-30 hover:opacity-100 transition-opacity z-50 bg-white shadow-lg"
        title="Signaler un bug ou une amélioration"
      >
        <Bug className="size-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Signaler un bug ou une amélioration</DialogTitle>
            <DialogDescription>
              Décrivez le problème rencontré ou l'amélioration souhaitée. Les informations techniques seront automatiquement collectées.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Page actuelle</Label>
              <div className="text-sm bg-slate-100 p-2 rounded">{getCurrentPage()}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description du bug / amélioration</Label>
              <Textarea
                id="description"
                placeholder="Décrivez le problème en détail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer le rapport'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}