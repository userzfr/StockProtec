import { useState, useEffect } from 'react';
import { ControlHistory } from '@/app/App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, XCircle, AlertTriangle, Zap, LogOut, LogIn, FileText } from 'lucide-react';
import { Separator } from '@/app/components/ui/separator';
import { controlHistoryApi } from '@/app/services/api';

interface ControlHistoryViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bagId: string;
}

export function ControlHistoryViewer({ open, onOpenChange, bagId }: ControlHistoryViewerProps) {
  const [histories, setHistories] = useState<ControlHistory[]>([]);

  useEffect(() => {
    const loadHistories = async () => {
      if (open) {
        try {
          const bagHistories = await controlHistoryApi.getByBagId(bagId);
          setHistories(bagHistories);
        } catch (error) {
          console.error('Erreur lors du chargement de l\'historique:', error);
        }
      }
    };

    loadHistories();
  }, [open, bagId]);

  const getControlTypeIcon = (type: 'quick' | 'departure' | 'return') => {
    switch (type) {
      case 'quick':
        return <Zap className="w-4 h-4" />;
      case 'departure':
        return <LogOut className="w-4 h-4" />;
      case 'return':
        return <LogIn className="w-4 h-4" />;
    }
  };

  const getControlTypeLabel = (type: 'quick' | 'departure' | 'return') => {
    switch (type) {
      case 'quick':
        return 'Contrôle rapide';
      case 'departure':
        return 'Sortie en poste';
      case 'return':
        return 'Retour de poste';
    }
  };

  const getResultIcon = (result: any) => {
    if (result.status === 'present') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (result.status === 'missing') return <XCircle className="w-4 h-4 text-red-500" />;
    if (result.status === 'damaged') return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    
    if (result.actualQuantity !== undefined) {
      if (result.actualQuantity === result.expectedQuantity) {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      } else if (result.actualQuantity < result.expectedQuantity) {
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      } else {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      }
    }
    
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Historique des contrôles</DialogTitle>
        </DialogHeader>

        {histories.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun contrôle enregistré pour ce sac</p>
          </div>
        ) : (
          <div className="space-y-4">
            {histories.map((history) => (
              <Card key={history.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getControlTypeIcon(history.controlType)}
                        {getControlTypeLabel(history.controlType)}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {format(new Date(history.timestamp), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-500">
                        Par : {history.user || history.userId || 'Utilisateur inconnu'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {history.results.length} article{history.results.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Grouper par poche */}
                  {Object.entries(
                    history.results.reduce((acc, result) => {
                      if (!acc[result.pocketName]) {
                        acc[result.pocketName] = [];
                      }
                      acc[result.pocketName].push(result);
                      return acc;
                    }, {} as Record<string, typeof history.results>)
                  ).map(([pocketName, results]) => (
                    <div key={pocketName} className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">{pocketName}</h4>
                      <div className="space-y-1">
                        {results.map((result, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm p-2 bg-gray-50 rounded">
                            {getResultIcon(result)}
                            <div className="flex-1">
                              <p className="font-medium">{result.itemName}</p>
                              <p className="text-xs text-gray-500">
                                {result.status ? (
                                  result.status === 'present' ? 'Présent' :
                                  result.status === 'missing' ? 'Manquant' :
                                  'Endommagé'
                                ) : (
                                  `Quantité : ${result.actualQuantity}/${result.expectedQuantity}`
                                )}
                              </p>
                              {result.notes && (
                                <p className="text-xs text-gray-600 italic mt-1">
                                  Note : {result.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {history.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes générales</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {history.notes}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}