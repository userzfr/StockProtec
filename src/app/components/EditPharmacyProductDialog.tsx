import { useState, useEffect } from 'react';
import { PharmacyProduct } from '@/app/App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface EditPharmacyProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PharmacyProduct;
  onUpdateProduct: (product: PharmacyProduct) => void;
}

export function EditPharmacyProductDialog({ open, onOpenChange, product, onUpdateProduct }: EditPharmacyProductDialogProps) {
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [lot, setLot] = useState(product.lot);
  const [expiryDate, setExpiryDate] = useState(product.expiryDate);
  const [quantity, setQuantity] = useState(product.quantity);
  const [minStock, setMinStock] = useState(product.minStock?.toString() || '');
  const [location, setLocation] = useState(product.location || '');
  const [supplier, setSupplier] = useState(product.supplier || '');

  useEffect(() => {
    setName(product.name);
    setCategory(product.category);
    setLot(product.lot);
    setExpiryDate(product.expiryDate);
    setQuantity(product.quantity);
    setMinStock(product.minStock?.toString() || '');
    setLocation(product.location || '');
    setSupplier(product.supplier || '');
  }, [product]);

  const handleUpdate = () => {
    if (!name.trim()) {
      toast.error('Veuillez saisir un nom de produit');
      return;
    }

    const updatedProduct: PharmacyProduct = {
      ...product,
      name: name.trim(),
      category: category.trim(),
      lot: lot.trim(),
      expiryDate,
      quantity,
      minStock: minStock ? parseInt(minStock) : undefined,
      location: location.trim() || undefined,
      supplier: supplier.trim() || undefined,
    };

    onUpdateProduct(updatedProduct);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Modifier le produit - {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lot">Numéro de lot *</Label>
              <Input id="lot" value={lot} onChange={(e) => setLot(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Date de péremption *</Label>
              <Input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input id="quantity" type="number" min="0" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock minimum</Label>
              <Input id="minStock" type="number" min="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Emplacement</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur</Label>
              <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">
              <strong>Code-barres :</strong> {product.barcode}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleUpdate} className="bg-red-600 hover:bg-red-700">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}