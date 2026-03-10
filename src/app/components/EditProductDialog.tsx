import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Product } from '@/app/App';
import { toast } from 'sonner';

interface EditProductDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
}

export function EditProductDialog({ product, isOpen, onClose, onUpdateProduct }: EditProductDialogProps) {
  const [formData, setFormData] = useState({
    barcode: product.barcode,
    name: product.name,
    lot: product.lot,
    expiryDate: product.expiryDate,
    controlDate: product.controlDate,
    quantity: product.quantity.toString(),
    category: product.category
  });

  useEffect(() => {
    setFormData({
      barcode: product.barcode,
      name: product.name,
      lot: product.lot,
      expiryDate: product.expiryDate,
      controlDate: product.controlDate,
      quantity: product.quantity.toString(),
      category: product.category
    });
  }, [product]);

  const categories = [
    'LOT A',
    'LOT B',
    'EQUIPEMENT ELECTRONIQUE',
    'Matériel médical',
    'Équipement de protection',
    'Hygiène',
    'Équipement de secours',
    'Médicaments',
    'Matériel de premiers secours'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.barcode || !formData.name || !formData.lot || !formData.expiryDate || 
        !formData.controlDate || !formData.quantity || !formData.category) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    onUpdateProduct(product.id, {
      barcode: formData.barcode,
      name: formData.name,
      lot: formData.lot,
      expiryDate: formData.expiryDate,
      controlDate: formData.controlDate,
      quantity: parseInt(formData.quantity),
      category: formData.category
    });

    toast.success('Produit modifié avec succès');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Modifier le produit</DialogTitle>
          <DialogDescription>
            Modifiez les informations du produit
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-barcode">Code-barres *</Label>
              <Input
                id="edit-barcode"
                placeholder="3401597847110"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-name">Nom du produit *</Label>
              <Input
                id="edit-name"
                placeholder="Compresses stériles 10x10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lot">Numéro de lot *</Label>
              <Input
                id="edit-lot"
                placeholder="LOT-2024-001"
                value={formData.lot}
                onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantité *</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                placeholder="150"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-expiryDate">Date de péremption *</Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-controlDate">Date de contrôle *</Label>
              <Input
                id="edit-controlDate"
                type="date"
                value={formData.controlDate}
                onChange={(e) => setFormData({ ...formData, controlDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}