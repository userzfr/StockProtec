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

interface BugReportButtonProps {
  currentUser: { username: string };
}

export function BugReportButton({ currentUser }: BugReportButtonProps) {
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

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('Veuillez décrire le bug');
      return;
    }

    setIsSubmitting(true);

    const bugReports: BugReport[] = JSON.parse(localStorage.getItem('bugReports') || '[]');
    const newReport: BugReport = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: currentUser.username,
      page: getCurrentPage(),
      description: description.trim(),
      userAgent: navigator.userAgent,
      status: 'new',
    };

    bugReports.unshift(newReport);
    localStorage.setItem('bugReports', JSON.stringify(bugReports));

    setTimeout(() => {
      setIsSubmitting(false);
      setDescription('');
      setIsOpen(false);
      toast.success('Rapport de bug envoyé avec succès');
    }, 500);
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