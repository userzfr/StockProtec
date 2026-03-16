import { useState, useEffect } from 'react';
import { Bag, ControlHistory, ControlResult } from '@/app/App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/AuthContext';
import { controlHistoryApi } from '@/app/services/api';

interface ControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bag: Bag;
  controlType: 'quick' | 'departure' | 'return';
  onComplete: (history: ControlHistory) => void;
}

export function ControlDialog({ open, onOpenChange, bag, controlType, onComplete }: ControlDialogProps) {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<Map<string, ControlResult>>(new Map());
  const [notes, setNotes] = useState('');
  const [deploymentLocation, setDeploymentLocation] = useState('');
  const [lastControlIssues, setLastControlIssues] = useState<{ itemId: string; itemName: string; issue: string }[]>([]);

  useEffect(() => {
    const loadControlData = async () => {
      // Initialiser les résultats
      const initialResults = new Map<string, ControlResult>();
      bag.pockets.forEach(pocket => {
        pocket.items.forEach(item => {
          initialResults.set(item.id, {
            itemId: item.id,
            itemName: item.name,
            pocketName: pocket.name,
            expectedQuantity: item.expectedQuantity,
          });
        });
      });
      setResults(initialResults);

      // Récupérer les problèmes du dernier contrôle
      try {
        const histories = await controlHistoryApi.getByBagId(bag.id);
        const lastControl = histories.length > 0 ? histories[0] : null;
        
        if (lastControl) {
          const issues: { itemId: string; itemName: string; issue: string }[] = [];
          lastControl.results.forEach(result => {
            if (result.status === 'missing') {
              issues.push({
                itemId: result.itemId,
                itemName: result.itemName,
                issue: 'Manquant au dernier contrôle',
              });
            } else if (result.status === 'damaged') {
              issues.push({
                itemId: result.itemId,
                itemName: result.itemName,
                issue: 'Endommagé au dernier contrôle',
              });
            } else if (result.actualQuantity !== undefined && result.actualQuantity < result.expectedQuantity) {
              issues.push({
                itemId: result.itemId,
                itemName: result.itemName,
                issue: `Quantité insuffisante au dernier contrôle (${result.actualQuantity}/${result.expectedQuantity})`,
              });
            }
          });
          setLastControlIssues(issues);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de contrôle:', error);
      }
    };

    if (open) {
      loadControlData();
    }
  }, [open, bag]);

  const handleButtonCheck = (itemId: string, status: 'present' | 'missing' | 'damaged') => {
    const result = results.get(itemId);
    if (result) {
      setResults(new Map(results.set(itemId, {
        ...result,
        status,
      })));
    }
  };

  const handleQuantityCheck = (itemId: string, quantity: number) => {
    const result = results.get(itemId);
    if (result) {
      setResults(new Map(results.set(itemId, {
        ...result,
        actualQuantity: quantity,
      })));
    }
  };

  const handleItemNotes = (itemId: string, itemNotes: string) => {
    const result = results.get(itemId);
    if (result) {
      setResults(new Map(results.set(itemId, {
        ...result,
        notes: itemNotes,
      })));
    }
  };

  const handleComplete = () => {
    // Validation pour les contrôles de départ
    if (controlType === 'departure' && !deploymentLocation.trim()) {
      toast.error('Veuillez saisir le nom du poste de secours');
      return;
    }

    const history: ControlHistory = {
      id: Date.now().toString(),
      bagId: bag.id,
      bagName: bag.name,
      timestamp: new Date().toISOString(),
      user: currentUser.username,
      controlType,
      results: Array.from(results.values()),
      notes,
      deploymentLocation: deploymentLocation || undefined,
    };
    
    onComplete(history);
    setNotes('');
    setDeploymentLocation('');
  };

  const getControlTypeLabel = () => {
    switch (controlType) {
      case 'quick':
        return 'Contrôle rapide';
      case 'departure':
        return 'Sortie en poste de secours';
      case 'return':
        return 'Retour de poste';
    }
  };

  const getItemStatus = (itemId: string) => {
    const result = results.get(itemId);
    const item = bag.pockets.flatMap(p => p.items).find(i => i.id === itemId);
    
    if (!result || !item) return null;

    if (item.checkType === 'button') {
      return result.status;
    } else {
      if (result.actualQuantity === undefined) return null;
      if (result.actualQuantity === result.expectedQuantity) return 'ok';
      if (result.actualQuantity < result.expectedQuantity) return 'warning';
      return 'ok';
    }
  };

  const hasIssue = (itemId: string) => {
    return lastControlIssues.some(issue => issue.itemId === itemId);
  };

  const getIssueText = (itemId: string) => {
    const issue = lastControlIssues.find(i => i.itemId === itemId);
    return issue ? issue.issue : '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{getControlTypeLabel()} - {bag.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              Contrôlez chaque article du sac. Les articles avec un contrôle par <strong>bouton</strong> nécessitent
              une sélection de statut (Présent/Manquant/Endommagé). Les articles avec un contrôle par <strong>quantité</strong>
              nécessitent la saisie du nombre d'articles présents.
            </p>
          </div>

          {/* Champ de saisie du poste de secours pour les sorties */}
          {controlType === 'departure' && (
            <div className="space-y-2">
              <Label htmlFor="deployment-location">Nom du poste de secours *</Label>
              <Input
                id="deployment-location"
                value={deploymentLocation}
                onChange={(e) => setDeploymentLocation(e.target.value)}
                placeholder="Ex: Stade Geoffroy-Guichard"
                required
              />
            </div>
          )}

          {/* Affichage des problèmes du dernier contrôle */}
          {lastControlIssues.length > 0 && (
            <Alert className="border-orange-500 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                <strong>Attention :</strong> Des problèmes ont été signalés au dernier contrôle. Vérifiez particulièrement les articles suivants :
                <ul className="list-disc list-inside mt-2">
                  {lastControlIssues.map(issue => (
                    <li key={issue.itemId}>{issue.itemName} - {issue.issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Poches et items */}
          <div className="space-y-4">
            {bag.pockets.map((pocket) => (
              <Card key={pocket.id}>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: pocket.color || '#gray' }}
                    />
                    {pocket.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {pocket.items.map((item) => {
                    const result = results.get(item.id);
                    const status = getItemStatus(item.id);
                    const hasWarning = hasIssue(item.id);

                    return (
                      <div key={item.id} className={`border rounded-lg p-4 space-y-3 ${hasWarning ? 'border-orange-400 bg-orange-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{item.name}</p>
                              {hasWarning && (
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Quantité attendue : {item.expectedQuantity} • Type : {item.checkType === 'button' ? 'Présence' : 'Quantité'}
                            </p>
                            {hasWarning && (
                              <p className="text-sm text-orange-600 mt-1">
                                ⚠️ {getIssueText(item.id)}
                              </p>
                            )}
                          </div>
                          {status && (
                            <Badge
                              className={
                                status === 'ok' || status === 'present' ? 'bg-green-500' :
                                status === 'warning' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }
                            >
                              {status === 'present' ? 'Présent' :
                               status === 'missing' ? 'Manquant' :
                               status === 'damaged' ? 'Endommagé' :
                               status === 'ok' ? 'OK' :
                               'Attention'}
                            </Badge>
                          )}
                        </div>

                        {item.checkType === 'button' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={result?.status === 'present' ? 'default' : 'outline'}
                              onClick={() => handleButtonCheck(item.id, 'present')}
                              className={result?.status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Présent
                            </Button>
                            <Button
                              size="sm"
                              variant={result?.status === 'missing' ? 'default' : 'outline'}
                              onClick={() => handleButtonCheck(item.id, 'missing')}
                              className={result?.status === 'missing' ? 'bg-red-600 hover:bg-red-700' : ''}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Manquant
                            </Button>
                            <Button
                              size="sm"
                              variant={result?.status === 'damaged' ? 'default' : 'outline'}
                              onClick={() => handleButtonCheck(item.id, 'damaged')}
                              className={result?.status === 'damaged' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Endommagé
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Quantité réelle</Label>
                            <Input
                              type="number"
                              min="0"
                              max={item.expectedQuantity * 2}
                              value={result?.actualQuantity ?? ''}
                              onChange={(e) => handleQuantityCheck(item.id, parseInt(e.target.value) || 0)}
                              placeholder="Saisir la quantité"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Notes (optionnel)</Label>
                          <Input
                            value={result?.notes ?? ''}
                            onChange={(e) => handleItemNotes(item.id, e.target.value)}
                            placeholder="Ajouter une remarque pour cet article"
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notes générales */}
          <div className="space-y-2">
            <Label>Notes générales (optionnel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des remarques générales sur le contrôle"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer le contrôle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
