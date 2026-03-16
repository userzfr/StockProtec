import { useState } from 'react';
import { Bag, BagPocket, BagPocketItem } from '@/app/App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Trash2, Package } from 'lucide-react';
import { generateUniqueQRCode } from '@/app/utils/codeGenerator';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Separator } from '@/app/components/ui/separator';

interface CreateBagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBag: (bag: Bag) => void;
}

export function CreateBagDialog({ open, onOpenChange, onCreateBag }: CreateBagDialogProps) {
  const [bagName, setBagName] = useState('');
  const [pockets, setPockets] = useState<BagPocket[]>([]);
  const [currentPocket, setCurrentPocket] = useState({
    name: '',
    color: '',
  });
  const [currentItem, setCurrentItem] = useState({
    name: '',
    expectedQuantity: 1,
    checkType: 'quantity' as 'button' | 'quantity',
  });

  const handleAddPocket = () => {
    if (!currentPocket.name.trim()) {
      toast.error('Veuillez saisir un nom de poche');
      return;
    }

    const newPocket: BagPocket = {
      id: Date.now().toString(),
      name: currentPocket.name,
      color: currentPocket.color,
      items: [],
      order: pockets.length,
    };

    setPockets([...pockets, newPocket]);
    setCurrentPocket({ name: '', color: '' });
    toast.success(`Poche "${currentPocket.name}" ajoutée`);
  };

  const handleRemovePocket = (pocketId: string) => {
    setPockets(pockets.filter(p => p.id !== pocketId));
  };

  const handleAddItemToPocket = (pocketId: string) => {
    if (!currentItem.name.trim()) {
      toast.error('Veuillez saisir un nom d\'article');
      return;
    }

    const newItem: BagPocketItem = {
      id: Date.now().toString(),
      name: currentItem.name,
      expectedQuantity: currentItem.expectedQuantity,
      checkType: currentItem.checkType,
    };

    setPockets(pockets.map(pocket => {
      if (pocket.id === pocketId) {
        return {
          ...pocket,
          items: [...pocket.items, newItem],
        };
      }
      return pocket;
    }));

    setCurrentItem({ name: '', expectedQuantity: 1, checkType: 'quantity' });
    toast.success(`Article "${currentItem.name}" ajouté`);
  };

  const handleRemoveItem = (pocketId: string, itemId: string) => {
    setPockets(pockets.map(pocket => {
      if (pocket.id === pocketId) {
        return {
          ...pocket,
          items: pocket.items.filter(item => item.id !== itemId),
        };
      }
      return pocket;
    }));
  };

  const handleCreateBag = async () => {
    if (!bagName.trim()) {
      toast.error('Veuillez saisir un nom de sac');
      return;
    }

    if (pockets.length === 0) {
      toast.error('Veuillez ajouter au moins une poche');
      return;
    }

    const hasEmptyPocket = pockets.some(p => p.items.length === 0);
    if (hasEmptyPocket) {
      toast.error('Toutes les poches doivent contenir au moins un article');
      return;
    }

    const newBag: Bag = {
      id: Date.now().toString(),
      name: bagName,
      qrCode: await generateUniqueQRCode(),
      pockets: pockets,
      createdAt: new Date().toISOString(),
      deploymentStatus: 'present',
    };

    onCreateBag(newBag);
    toast.success(`Sac "${bagName}" créé avec succès`);
    
    // Reset form
    setBagName('');
    setPockets([]);
    setCurrentPocket({ name: '', color: '' });
    setCurrentItem({ name: '', expectedQuantity: 1, checkType: 'quantity' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Créer un nouveau sac de secours</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nom du sac */}
          <div className="space-y-2">
            <Label htmlFor="bagName">Nom du sac *</Label>
            <Input
              id="bagName"
              value={bagName}
              onChange={(e) => setBagName(e.target.value)}
              placeholder="Ex: Sac n°1, Sac urgence, etc."
            />
          </div>

          <Separator />

          {/* Ajouter une poche */}
          <div className="space-y-4">
            <h3 className="font-semibold">Ajouter une poche</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pocketName">Nom de la poche *</Label>
                <Input
                  id="pocketName"
                  value={currentPocket.name}
                  onChange={(e) => setCurrentPocket({ ...currentPocket, name: e.target.value })}
                  placeholder="Ex: Poche rouge, Poche bleue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pocketColor">Couleur (optionnel)</Label>
                <Input
                  id="pocketColor"
                  value={currentPocket.color}
                  onChange={(e) => setCurrentPocket({ ...currentPocket, color: e.target.value })}
                  placeholder="Ex: Rouge, Bleu"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddPocket} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter la poche
                </Button>
              </div>
            </div>
          </div>

          {/* Liste des poches */}
          {pockets.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Poches créées ({pockets.length})</h3>
              {pockets.map((pocket) => (
                <Card key={pocket.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {pocket.name}
                        {pocket.color && (
                          <span className="ml-2 text-sm text-gray-500">({pocket.color})</span>
                        )}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemovePocket(pocket.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Articles de la poche */}
                    {pocket.items.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Articles ({pocket.items.length})</p>
                        <div className="space-y-2">
                          {pocket.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  Quantité attendue: {item.expectedQuantity} | Type: {item.checkType === 'button' ? 'Bouton' : 'Quantité'}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveItem(pocket.id, item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ajouter un article */}
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-sm font-medium">Ajouter un article</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Input
                          placeholder="Nom de l'article"
                          value={currentItem.name}
                          onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                        />
                        <Input
                          type="number"
                          min="1"
                          placeholder="Quantité"
                          value={currentItem.expectedQuantity}
                          onChange={(e) => setCurrentItem({ ...currentItem, expectedQuantity: parseInt(e.target.value) || 1 })}
                        />
                        <Select
                          value={currentItem.checkType}
                          onValueChange={(value: 'button' | 'quantity') => setCurrentItem({ ...currentItem, checkType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quantity">Quantité</SelectItem>
                            <SelectItem value="button">Bouton</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={() => handleAddItemToPocket(pocket.id)} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreateBag} className="bg-blue-600 hover:bg-blue-700">
            <Package className="w-4 h-4 mr-2" />
            Créer le sac
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}