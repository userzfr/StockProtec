import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Product } from '@/app/App';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
}

export function AddProductDialog({ isOpen, onClose, onAddProduct }: AddProductDialogProps) {
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    lot: '',
    expiryDate: '',
    quantity: '',
    category: '',
    bagBarcode: ''
  });

  const categories = [
    'LOT A',
    'LOT B',
    'LOT C',
    'EQUIPEMENT ELECTRONIQUE',
    'Matériel médical',
    'Équipement de protection',
    'Hygiène',
    'Équipement de secours',
    'Médicaments',
    'Matériel de premiers secours'
  ];

  const generateBarcode = () => {
    // Generate EAN-13 like barcode
    const prefix = '340';
    const randomPart = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const barcode = prefix + randomPart;
    setFormData({ ...formData, barcode });
    toast.success('Code-barres généré !');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.barcode || !formData.name || !formData.lot || !formData.expiryDate || 
        !formData.quantity || !formData.category) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Control date is set automatically to today (product is new, just controlled)
    const today = new Date();
    // Add 3 months for next control
    const controlDate = new Date(today);
    controlDate.setMonth(controlDate.getMonth() + 3);

    const productData: Omit<Product, 'id'> = {
      barcode: formData.barcode,
      name: formData.name,
      lot: formData.lot,
      expiryDate: formData.expiryDate,
      controlDate: controlDate.toISOString(),
      quantity: parseInt(formData.quantity),
      category: formData.category
    };

    // Add bagBarcode if LOT A, B, or C
    if (formData.category === 'LOT A' || formData.category === 'LOT B' || formData.category === 'LOT C') {
      if (formData.bagBarcode) {
        productData.bagBarcode = formData.bagBarcode;
      }
    }

    onAddProduct(productData);

    toast.success('Produit ajouté avec succès (contrôle automatique effectué)');
    setFormData({
      barcode: '',
      name: '',
      lot: '',
      expiryDate: '',
      quantity: '',
      category: '',
      bagBarcode: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ajouter un nouveau produit</DialogTitle>
          <DialogDescription>
            Remplissez les informations du produit à ajouter à l'inventaire
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Code-barres *</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  placeholder="3401597847110"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={generateBarcode}>
                  <RefreshCw className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500">Cliquez sur l'icône pour générer un code-barres automatiquement</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category">
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
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                placeholder="Compresses stériles 10x10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot">Numéro de lot *</Label>
              <Input
                id="lot"
                placeholder="LOT-2024-001"
                value={formData.lot}
                onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="150"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Date de péremption *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="text-sm text-green-800 font-medium">ℹ️ Date de contrôle automatique</p>
                <p className="text-xs text-green-700 mt-1">La date de contrôle sera automatiquement fixée à 3 mois après aujourd'hui car le produit est neuf.</p>
              </div>
            </div>

            {formData.category === 'LOT A' || formData.category === 'LOT B' || formData.category === 'LOT C' ? (
              <div className="space-y-2">
                <Label htmlFor="bagBarcode">Code-barres du sac</Label>
                <Input
                  id="bagBarcode"
                  placeholder="LOTA2024"
                  value={formData.bagBarcode}
                  onChange={(e) => setFormData({ ...formData, bagBarcode: e.target.value })}
                />
                <p className="text-xs text-slate-500">Pour regrouper plusieurs produits dans un même sac</p>
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Ajouter le produit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}