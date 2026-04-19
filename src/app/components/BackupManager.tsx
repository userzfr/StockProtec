import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { Download, Upload, Trash2, Database, HardDrive, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Backup {
  filename: string;
  path: string;
  size: number;
  created: Date;
  createdISO: string;
}

interface BackupStats {
  totalBackups: number;
  totalSize: number;
  oldestBackup: string | null;
  newestBackup: string | null;
}

export function BackupManager() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; backup: Backup | null }>({ open: false, backup: null });
  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; backup: Backup | null }>({ open: false, backup: null });

  useEffect(() => {
    loadBackups();
    loadStats();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/backups');
      if (response.ok) {
        const data = await response.json();
        setBackups(data.map((b: any) => ({
          ...b,
          created: new Date(b.created)
        })));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sauvegardes:', error);
      toast.error('Impossible de charger les sauvegardes');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/backup/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backup', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        toast.success(`Sauvegarde créée: ${result.filename}`);
        await loadBackups();
        await loadStats();
      } else {
        toast.error('Échec de la création de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la sauvegarde:', error);
      toast.error('Impossible de créer la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (backup: Backup) => {
    try {
      const response = await fetch(`/api/backup/restore/${backup.filename}`, { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        toast.success('Sauvegarde restaurée avec succès');
        setRestoreDialog({ open: false, backup: null });
        // Recharger la page pour refléter les changements
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(`Échec de la restauration: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      toast.error('Impossible de restaurer la sauvegarde');
    }
  };

  const deleteBackup = async (backup: Backup) => {
    try {
      const response = await fetch(`/api/backup/${backup.filename}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Sauvegarde supprimée');
        setDeleteDialog({ open: false, backup: null });
        await loadBackups();
        await loadStats();
      } else {
        toast.error('Échec de la suppression de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Impossible de supprimer la sauvegarde');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Gestion des Sauvegardes</h2>
            <p className="text-sm text-gray-600">
              Sauvegardes automatiques hebdomadaires + gestion manuelle
            </p>
          </div>
          <Button onClick={createBackup} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            <Database className="w-4 h-4 mr-2" />
            {loading ? 'Création...' : 'Créer une sauvegarde'}
          </Button>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total sauvegardes</p>
                    <p className="text-2xl font-bold">{stats.totalBackups}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Espace utilisé</p>
                    <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Plus ancienne</p>
                    <p className="text-sm font-bold">
                      {stats.oldestBackup ? formatDate(new Date(stats.oldestBackup)) : 'Aucune'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Plus récente</p>
                    <p className="text-sm font-bold">
                      {stats.newestBackup ? formatDate(new Date(stats.newestBackup)) : 'Aucune'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Liste des sauvegardes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sauvegardes disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune sauvegarde disponible</p>
                <p className="text-sm">Créez votre première sauvegarde ci-dessus</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.filename} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{backup.filename}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(backup.created)} • {formatFileSize(backup.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRestoreDialog({ open: true, backup })}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Restaurer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteDialog({ open: true, backup })}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, backup: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la sauvegarde "{deleteDialog.backup?.filename}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.backup && deleteBackup(deleteDialog.backup)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation de restauration */}
      <AlertDialog open={restoreDialog.open} onOpenChange={(open) => setRestoreDialog({ open, backup: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la restauration</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir restaurer la sauvegarde "{restoreDialog.backup?.filename}" ?
              Cela remplacera la base de données actuelle. Une sauvegarde de sécurité sera créée automatiquement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreDialog.backup && restoreBackup(restoreDialog.backup)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Restaurer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
