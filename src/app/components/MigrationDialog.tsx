import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Database, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { migrationApi } from '../services/api';
import { toast } from 'sonner';

interface MigrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMigrationComplete: () => void;
}

export function MigrationDialog({ open, onOpenChange, onMigrationComplete }: MigrationDialogProps) {
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    setMigrating(true);
    setError(null);

    try {
      // Récupérer toutes les données du localStorage
      const data = {
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        bags: JSON.parse(localStorage.getItem('bags') || '[]'),
        pharmacyProducts: JSON.parse(localStorage.getItem('pharmacyProducts') || '[]'),
        operationalEquipment: JSON.parse(localStorage.getItem('operationalEquipment') || '[]'),
        controlHistories: JSON.parse(localStorage.getItem('controlHistories') || '[]'),
        logs: JSON.parse(localStorage.getItem('logs') || '[]'),
        bugReports: JSON.parse(localStorage.getItem('bugReports') || '[]'),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        customCategories: JSON.parse(localStorage.getItem('customCategories') || '[]'),
      };

      // Envoyer les données à l'API pour migration
      await migrationApi.migrateFromLocalStorage(data);

      setMigrated(true);
      toast.success('Migration réussie !');

      // Attendre 2 secondes avant de fermer
      setTimeout(() => {
        onMigrationComplete();
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la migration');
      toast.error('Erreur lors de la migration');
    } finally {
      setMigrating(false);
    }
  };

  const hasLocalStorageData = () => {
    const users = localStorage.getItem('users');
    const bags = localStorage.getItem('bags');
    const products = localStorage.getItem('pharmacyProducts');
    const customCategories = localStorage.getItem('customCategories');
    return users || bags || products || customCategories;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Migration vers SQLite
          </DialogTitle>
          <DialogDescription>
            Migrez vos données existantes du localStorage vers la base de données SQLite locale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!migrated && !error && (
            <>
              {hasLocalStorageData() ? (
                <Alert>
                  <Download className="h-4 w-4" />
                  <AlertDescription>
                    Des données ont été détectées dans le localStorage. Nous recommandons de les migrer
                    vers la base de données SQLite pour améliorer la fiabilité et les performances.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Aucune donnée n'a été détectée dans le localStorage.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 text-sm">
                <p className="font-semibold">Avantages de SQLite :</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Fiabilité accrue des données</li>
                  <li>Meilleures performances</li>
                  <li>Sauvegarde simplifiée (un seul fichier)</li>
                  <li>Intégrité des données garantie</li>
                </ul>
              </div>
            </>
          )}

          {migrated && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Migration terminée avec succès ! Vos données sont maintenant stockées dans la base de
                données SQLite.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {!migrated && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={migrating}
              >
                Annuler
              </Button>
              <Button
                onClick={handleMigrate}
                disabled={migrating || !hasLocalStorageData()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {migrating ? (
                  <>
                    <Database className="w-4 h-4 mr-2 animate-spin" />
                    Migration en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Migrer les données
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
