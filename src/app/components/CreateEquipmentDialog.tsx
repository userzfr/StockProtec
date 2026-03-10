import { useState } from 'react';
import { OperationalEquipment } from '@/app/App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Plus } from 'lucide-react';
import { generateUniqueBarcode } from '@/app/utils/codeGenerator';
import { toast } from 'sonner';

interface CreateEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEquipment: (equipment: OperationalEquipment) => void;
}

export function CreateEquipmentDialog({ open, onOpenChange, onCreateEquipment }: CreateEquipmentDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<OperationalEquipment['type']>('DSA');
  const [quantity, setQuantity] = useState(1);
  const [controlDate, setControlDate] = useState('');
  const [status, setStatus] = useState<OperationalEquipment['status']>('ok');
  const [notes, setNotes] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Veuillez saisir un nom de matériel');
      return;
    }

    if (quantity < 1) {
      toast.error('La quantité doit être au moins 1');
      return;
    }

    const newEquipment: OperationalEquipment = {
      id: Date.now().toString(),
      name: name.trim(),
      barcode: generateUniqueBarcode(),
      type,
      quantity,
      controlDate: controlDate || undefined,
      status,
      notes: notes.trim() || undefined,
    };

    onCreateEquipment(newEquipment);
    toast.success(`Matériel "${name}" créé avec succès`);

    // Reset form
    setName('');
    setType('DSA');
    setQuantity(1);
    setControlDate('');
    setStatus('ok');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Ajouter du matériel opérationnel</DialogTitle>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}