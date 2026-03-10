import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Bag, ControlHistory } from '@/app/App';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, CheckCircle, ClipboardCheck, Package, Zap, LogOut, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { ControlDialog } from './ControlDialog';
import { ControlHistoryViewer } from './ControlHistoryViewer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function BagDetailPage() {
  const { qrCode } = useParams<{ qrCode: string }>();
  const navigate = useNavigate();
  const [bag, setBag] = useState<Bag | null>(null);
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [controlType, setControlType] = useState<'quick' | 'departure' | 'return'>('quick');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [lastControl, setLastControl] = useState<ControlHistory | null>(null);

  useEffect(() => {
    if (qrCode) {
      const bags: Bag[] = JSON.parse(localStorage.getItem('bags') || '[]');
      const foundBag = bags.find(b => b.qrCode === qrCode);
      
      if (foundBag) {
        setBag(foundBag);
        
        // Récupérer le dernier contrôle pour ce sac
        const histories: ControlHistory[] = JSON.parse(localStorage.getItem('controlHistories') || '[]');
        const bagHistories = histories.filter(h => h.bagId === foundBag.id);
        if (bagHistories.length > 0) {
          setLastControl(bagHistories[0]); // Le plus récent (déjà trié par date)
        }
      } else {
        toast.error('Sac non trouvé');
        navigate('/');
      }
    }
  }, [qrCode, navigate]);

  const handleStartControl = (type: 'quick' | 'departure' | 'return') => {
    setControlType(type);
    setControlDialogOpen(true);
  };

  const handleControlComplete = (history: ControlHistory) => {
    if (!bag) return;

    // Sauvegarder l'historique
    const histories: ControlHistory[] = JSON.parse(localStorage.getItem('controlHistories') || '[]');
    histories.unshift(history);
    localStorage.setItem('controlHistories', JSON.stringify(histories));

    // Mettre à jour le dernier contrôle affiché
    setLastControl(history);

    // Mettre à jour le sac
    const bags: Bag[] = JSON.parse(localStorage.getItem('bags') || '[]');
    const updatedBags = bags.map(b => {
      if (b.id === bag.id) {
        // Calculer le statut basé sur les résultats
        let status: 'ok' | 'warning' | 'critical' = 'ok';
        const hasCritical = history.results.some(r => r.status === 'missing' || r.status === 'damaged');
        const hasWarning = history.results.some(r => 
          r.actualQuantity !== undefined && r.actualQuantity < r.expectedQuantity
        );
        
        if (hasCritical) status = 'critical';
        else if (hasWarning) status = 'warning';

        // Mettre à jour le statut de déploiement
        let deploymentStatus = b.deploymentStatus;
        let deploymentLocation = b.deploymentLocation;
        let deploymentDate = b.deploymentDate;

        if (history.controlType === 'departure') {
          deploymentStatus = 'deployed';
          deploymentLocation = history.deploymentLocation;
          deploymentDate = history.timestamp;
        } else if (history.controlType === 'return') {
          deploymentStatus = 'present';
          deploymentLocation = undefined;
          deploymentDate = undefined;
        }

        return {
          ...b,
          lastControlDate: history.timestamp,
          status,
          deploymentStatus,
          deploymentLocation,
          deploymentDate,
        };
      }
      return b;
    });

    localStorage.setItem('bags', JSON.stringify(updatedBags));
    
    const updatedBag = updatedBags.find(b => b.id === bag.id);
    if (updatedBag) {
      setBag(updatedBag);
    }

    toast.success('Contrôle enregistré avec succès');
    setControlDialogOpen(false);
  };

  if (!bag) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  const totalItems = bag.pockets.reduce((acc, pocket) => acc + pocket.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white hover:bg-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{bag.name}</h1>
              <p className="text-blue-100">
                {bag.pockets.length} poche{bag.pockets.length > 1 ? 's' : ''} • {totalItems} article{totalItems > 1 ? 's' : ''}
              </p>
              {bag.deploymentStatus === 'deployed' && bag.deploymentLocation && (
                <p className="text-sm text-blue-100 mt-1">
                  📍 Déployé à : {bag.deploymentLocation}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end">
              {bag.status && (
                <Badge
                  className={
                    bag.status === 'ok' ? 'bg-green-500' :
                    bag.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }
                >
                  {bag.status === 'ok' ? 'OK' :
                   bag.status === 'warning' ? 'Attention' :
                   'Critique'}
                </Badge>
              )}
              {bag.deploymentStatus && (
                <Badge
                  className={
                    bag.deploymentStatus === 'present' ? 'bg-gray-500' : 'bg-blue-500'
                  }
                >
                  {bag.deploymentStatus === 'present' ? 'Présent' : 'En déploiement'}
                </Badge>
              )}
            </div>
          </div>
          {lastControl && (
            <p className="text-sm text-blue-100 mt-2">
              Dernier contrôle : {format(new Date(lastControl.timestamp), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Boutons de contrôle */}
        <Card>
          <CardHeader>
            <CardTitle>Types de contrôle</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleStartControl('quick')}
              className="h-auto py-6 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Zap className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold">Contrôle rapide</div>
                <div className="text-xs opacity-90">Vérification rapide</div>
              </div>
            </Button>
            
            {bag.deploymentStatus === 'present' && (
              <Button
                onClick={() => handleStartControl('departure')}
                className="h-auto py-6 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <LogOut className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold">Sortie en poste</div>
                  <div className="text-xs opacity-90">Contrôle avant départ</div>
                </div>
              </Button>
            )}
            
            {bag.deploymentStatus === 'deployed' && (
              <Button
                onClick={() => handleStartControl('return')}
                className="h-auto py-6 flex flex-col items-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                <LogIn className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold">Retour de poste</div>
                  <div className="text-xs opacity-90">Contrôle après dispositif</div>
                </div>
              </Button>
            )}
            
            {!bag.deploymentStatus && (
              <>
                <Button
                  onClick={() => handleStartControl('departure')}
                  className="h-auto py-6 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <LogOut className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">Sortie en poste</div>
                    <div className="text-xs opacity-90">Contrôle avant départ</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => handleStartControl('return')}
                  className="h-auto py-6 flex flex-col items-center gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  <LogIn className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">Retour de poste</div>
                    <div className="text-xs opacity-90">Contrôle après dispositif</div>
                  </div>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Historique */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Historique des contrôles</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryDialogOpen(true)}
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Voir tout
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Contenu du sac */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Contenu du sac</h2>
          {bag.pockets.map((pocket, index) => {
            // Récupérer les résultats du dernier contrôle pour cette poche
            const getLastControlResult = (itemId: string) => {
              if (!lastControl) return null;
              return lastControl.results.find(r => r.itemId === itemId);
            };

            return (
              <Card key={pocket.id}>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: pocket.color || '#gray',
                      }}
                    />
                    {pocket.name}
                    <Badge variant="outline" className="ml-auto">
                      {pocket.items.length} article{pocket.items.length > 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {pocket.items.map((item) => {
                      const lastResult = getLastControlResult(item.id);
                      const hasIssue = lastResult && (
                        lastResult.status === 'missing' ||
                        lastResult.status === 'damaged' ||
                        (lastResult.actualQuantity !== undefined && lastResult.actualQuantity < item.expectedQuantity)
                      );

                      // Déterminer la couleur et le statut
                      let statusColor = 'bg-gray-100 border-gray-300';
                      let statusText = 'Non contrôlé';
                      let actualQuantityDisplay = '-';
                      
                      if (lastResult) {
                        if (item.checkType === 'quantity' && lastResult.actualQuantity !== undefined) {
                          actualQuantityDisplay = lastResult.actualQuantity.toString();
                          if (lastResult.actualQuantity >= item.expectedQuantity) {
                            statusColor = 'bg-green-100 border-green-500';
                            statusText = 'OK';
                          } else {
                            statusColor = 'bg-red-100 border-red-500';
                            statusText = 'Manquant';
                          }
                        } else if (item.checkType === 'button') {
                          if (lastResult.status === 'present') {
                            statusColor = 'bg-green-100 border-green-500';
                            statusText = 'Présent';
                            actualQuantityDisplay = '✓';
                          } else if (lastResult.status === 'missing') {
                            statusColor = 'bg-red-100 border-red-500';
                            statusText = 'Manquant';
                            actualQuantityDisplay = '✗';
                          } else if (lastResult.status === 'damaged') {
                            statusColor = 'bg-orange-100 border-orange-500';
                            statusText = 'Endommagé';
                            actualQuantityDisplay = '⚠';
                          }
                        }
                      }

                      return (
                        <div
                          key={item.id}
                          className="bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex items-center justify-between gap-4">
                            {/* Informations de l'article */}
                            <div className="flex-1">
                              <p className="font-medium mb-1">{item.name}</p>
                              <div className="text-sm text-gray-600">
                                Attendu : <span className="font-semibold text-gray-900">{item.expectedQuantity}</span>
                              </div>
                            </div>
                            
                            {/* État actuel du dernier contrôle - VISIBLE */}
                            <div className={`${statusColor} border-2 rounded-lg p-3 min-w-[140px] text-center`}>
                              <div className="text-xs text-gray-600 mb-1">Actuel</div>
                              <div className="text-2xl font-bold text-gray-900">
                                {actualQuantityDisplay}
                              </div>
                              <div className="text-xs mt-1 font-medium text-gray-700">
                                {statusText}
                              </div>
                            </div>
                            
                            {/* Badge du type de contrôle */}
                            <Badge variant="outline" className="self-start">
                              {item.checkType === 'button' ? 'Présence' : 'Quantité'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dialogs */}
      {bag && (
        <>
          <ControlDialog
            open={controlDialogOpen}
            onOpenChange={setControlDialogOpen}
            bag={bag}
            controlType={controlType}
            onComplete={handleControlComplete}
          />
          <ControlHistoryViewer
            open={historyDialogOpen}
            onOpenChange={setHistoryDialogOpen}
            bagId={bag.id}
          />
        </>
      )}
    </div>
  );
}