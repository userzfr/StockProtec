import { useState, useEffect } from 'react';
import { Bug, CheckCircle2, Clock, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { BugReport } from '@/app/App';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { bugReportsApi } from '@/app/services/api';

interface BugReportsManagerProps {
  currentUser: { username: string };
  onAddLog: (action: string, user: string, details: string) => Promise<void>;
}

export function BugReportsManager({ currentUser, onAddLog }: BugReportsManagerProps) {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);

  useEffect(() => {
    loadBugReports();
  }, []);

  const loadBugReports = async () => {
    try {
      const reports = await bugReportsApi.getAll();
      setBugReports(reports);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      toast.error('Erreur lors du chargement des rapports');
    }
  };

  const updateStatus = async (id: string, status: BugReport['status']) => {
    try {
      const report = bugReports.find(r => r.id === id);
      await bugReportsApi.updateStatus(id, status);
      
      // Mettre à jour l'état local
      const reports = bugReports.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status,
            ...(status === 'resolved' && {
              resolvedAt: new Date().toISOString(),
              resolvedBy: currentUser.username,
            }),
          };
        }
        return r;
      });
      
      setBugReports(reports);
      if (report) {
        await onAddLog(
          'UPDATE_BUG_REPORT',
          currentUser.username,
          `Modification du rapport de bug #${report.id} sur la page ${report.page} : statut ${report.status} → ${status}. Description : ${report.description}`
        );
      }
      toast.success('Statut mis à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const report = bugReports.find(r => r.id === id);
      await bugReportsApi.delete(id);
      
      const reports = bugReports.filter(r => r.id !== id);
      setBugReports(reports);
      if (report) {
        await onAddLog(
          'DELETE_BUG_REPORT',
          currentUser.username,
          `Suppression du rapport de bug #${report.id} sur la page ${report.page} : ${report.description}`
        );
      }
      toast.success('Rapport supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression du rapport:', error);
      toast.error('Erreur lors de la suppression du rapport');
    }
  };

  const getStatusBadge = (status: BugReport['status']) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-red-500">Nouveau</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-500">En cours</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Résolu</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bug className="size-5 text-red-600" />
        <h3 className="text-lg font-semibold">Rapports de bugs et améliorations</h3>
        <Badge variant="outline" className="ml-auto">
          {bugReports.filter(r => r.status === 'new').length} nouveau{bugReports.filter(r => r.status === 'new').length > 1 ? 'x' : ''}
        </Badge>
      </div>

      {bugReports.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Bug className="size-12 mx-auto mb-4 opacity-20" />
          <p>Aucun rapport de bug</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bugReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="text-sm">
                    {format(new Date(report.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{report.user}</span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">{report.page}</code>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm line-clamp-2">{report.description}</p>
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                        Voir les détails techniques
                      </summary>
                      <div className="mt-2 text-xs bg-slate-50 p-2 rounded">
                        <p className="font-mono break-all">{report.userAgent}</p>
                      </div>
                    </details>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {getStatusBadge(report.status)}
                      <Select
                        value={report.status}
                        onValueChange={(value) => updateStatus(report.id, value as BugReport['status'])}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nouveau</SelectItem>
                          <SelectItem value="in-progress">En cours</SelectItem>
                          <SelectItem value="resolved">Résolu</SelectItem>
                        </SelectContent>
                      </Select>
                      {report.status === 'resolved' && report.resolvedBy && (
                        <p className="text-xs text-slate-500">
                          Résolu par {report.resolvedBy}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteReport(report.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
