import { useState, useEffect } from 'react';
import { Activity, Download, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { LogEntry } from '@/app/App';
import { logsApi } from '@/app/services/api';
import { toast } from 'sonner';

export function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const fetchedLogs = await logsApi.getAll();
      setLogs(fetchedLogs);
    } catch (error) {
      console.error('Erreur lors du chargement des journaux :', error);
      toast.error('Impossible de charger les journaux');
    }
  };

  const handleClearLogs = async () => {
    try {
      await logsApi.clear();
      setLogs([]);
      toast.success('Journaux effacés');
    } catch (error) {
      console.error('Erreur lors de la suppression des journaux :', error);
      toast.error('Impossible d\'effacer les journaux');
    }
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Journaux exportés');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action: string) => {
    const actionConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'warning' }> = {
      LOGIN: { label: 'Connexion', variant: 'default' },
      LOGOUT: { label: 'Déconnexion', variant: 'secondary' },
      ADD_PRODUCT: { label: 'Ajout produit', variant: 'default' },
      UPDATE_PRODUCT: { label: 'Modification', variant: 'warning' },
      DELETE_PRODUCT: { label: 'Suppression', variant: 'destructive' },
      LOT_OUT: { label: 'Sortie LOT', variant: 'warning' },
      LOT_IN: { label: 'Retour LOT', variant: 'default' },
      CATEGORY_OUT: { label: 'Sortie catégorie', variant: 'warning' },
      CATEGORY_IN: { label: 'Retour catégorie', variant: 'default' },
      ADD_USER: { label: 'Ajout utilisateur', variant: 'default' },
      DELETE_USER: { label: 'Suppr. utilisateur', variant: 'destructive' },
      INSPECTION: { label: 'Contrôle matériel', variant: 'default' }
    };

    const config = actionConfig[action] || { label: action, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.user.toLowerCase().includes(searchLower) ||
      log.details.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Journaux d'Activité ({logs.length} entrées)
            </CardTitle>
            <CardDescription className="mt-2">
              Historique de toutes les actions effectuées dans le système
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadLogs}
              className="shrink-0"
            >
              <RefreshCw className="size-4 mr-2" />
              Actualiser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLogs}
              disabled={logs.length === 0}
              className="shrink-0"
            >
              <Download className="size-4 mr-2" />
              Exporter
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearLogs}
              disabled={logs.length === 0}
              className="shrink-0"
            >
              <Trash2 className="size-4 mr-2" />
              Effacer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Rechercher dans les journaux..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow>
                  <TableHead className="w-[180px]">Date & Heure</TableHead>
                  <TableHead className="w-[150px]">Action</TableHead>
                  <TableHead className="w-[120px]">Utilisateur</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      {searchTerm ? 'Aucun résultat trouvé' : 'Aucun journal disponible'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-slate-600 font-mono">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.user}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}