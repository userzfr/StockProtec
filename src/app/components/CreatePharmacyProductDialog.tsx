import { useState } from 'react';
import { PharmacyProduct } from '@/app/App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Plus } from 'lucide-react';
import { generateUniqueBarcode } from '@/app/utils/codeGenerator';
import { toast } from 'sonner';

interface CreatePharmacyProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProduct: (product: PharmacyProduct) => void;
}

export function CreatePharmacyProductDialog({ open, onOpenChange, onCreateProduct }: CreatePharmacyProductDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [lot, setLot] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [minStock, setMinStock] = useState('');
  const [location, setLocation] = useState('');
  const [supplier, setSupplier] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Veuillez saisir un nom de produit');
      return;
    }
    if (!category.trim()) {
      toast.error('Veuillez saisir une catégorie');
      return;
    }
    if (!lot.trim()) {
      toast.error('Veuillez saisir un numéro de lot');
      return;
    }
    if (!expiryDate) {
      toast.error('Veuillez saisir une date de péremption');
      return;
    }

    const newProduct: PharmacyProduct = {
      id: Date.now().toString(),
      barcode: await generateUniqueBarcode(),
      name: name.trim(),
      category: category.trim(),
      lot: lot.trim(),
      expiryDate,
      quantity,
      minStock: minStock ? parseInt(minStock) : undefined,
      location: location.trim() || undefined,
      supplier: supplier.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onCreateProduct(newProduct);

    // Reset
    setName('');
    setCategory('');
    setLot('');
    setExpiryDate('');
    setQuantity(1);
    setMinStock('');
    setLocation('');
    setSupplier('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Ajouter un produit pharmacie</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Compresses stériles" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Pansements" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lot">Numéro de lot *</Label>
              <Input id="lot" value={lot} onChange={(e) => setLot(e.target.value)} placeholder="Ex: LOT-2024-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Date de péremption *</Label>
              <Input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock minimum (optionnel)</Label>
              <Input id="minStock" type="number" min="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} placeholder="Seuil d'alerte" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Emplacement (optionnel)</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Armoire A, Étagère 2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur (optionnel)</Label>
              <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Ex: Laboratoire XYZ" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}