import { useState, useEffect } from 'react';
import { OperationalEquipment } from '@/app/App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface EditEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: OperationalEquipment;
  onUpdateEquipment: (equipment: OperationalEquipment) => void;
}

export function EditEquipmentDialog({ open, onOpenChange, equipment, onUpdateEquipment }: EditEquipmentDialogProps) {
  const [name, setName] = useState(equipment.name);
  const [type, setType] = useState<OperationalEquipment['type']>(equipment.type);
  const [quantity, setQuantity] = useState(equipment.quantity);
  const [controlDate, setControlDate] = useState(equipment.controlDate ? equipment.controlDate.split('T')[0] : '');
  const [status, setStatus] = useState<OperationalEquipment['status']>(equipment.status || 'ok');
  const [notes, setNotes] = useState(equipment.notes || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(equipment.name);
    setType(equipment.type);
    setQuantity(equipment.quantity);
    setControlDate(equipment.controlDate ? equipment.controlDate.split('T')[0] : '');
    setStatus(equipment.status || 'ok');
    setNotes(equipment.notes || '');
  }, [equipment]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error('Veuillez saisir un nom de matériel');
      return;
    }

    if (quantity < 1) {
      toast.error('La quantité doit être au moins 1');
      return;
    }

    try {
      setIsLoading(true);
      
      const updatedEquipment: OperationalEquipment = {
        ...equipment,
        name: name.trim(),
        type,
        quantity,
        controlDate: controlDate ? new Date(controlDate).toISOString().split('T')[0] : undefined,
        status,
        notes: notes.trim() || undefined,
        lastControlDate: new Date().toISOString(),
      };

      onUpdateEquipment(updatedEquipment);
      toast.success(`Matériel "${name}" mis à jour avec succès`);
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Une erreur est survenue lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Modifier le matériel - {equipment.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du matériel *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: DSA Philips, Aspirateur portable..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={type} onValueChange={(value) => setType(value as OperationalEquipment['type'])}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DSA">DSA</SelectItem>
                  <SelectItem value="ASPIRATEUR">Aspirateur de mucosité</SelectItem>
                  <SelectItem value="OXYGENE">Bouteille d'oxygène</SelectItem>
                  <SelectItem value="ELECTRONIQUE">Matériel électronique</SelectItem>
                  <SelectItem value="AUTRE">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as OperationalEquipment['status'])}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">Opérationnel</SelectItem>
                  <SelectItem value="defective">Défectueux</SelectItem>
                  <SelectItem value="missing">Manquant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="controlDate">Date du prochain contrôle (optionnel)</Label>
            <Input
              id="controlDate"
              type="date"
              value={controlDate}
              onChange={(e) => setControlDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des remarques..."
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">
              <strong>Code-barres :</strong> {equipment.barcode}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}