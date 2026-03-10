import { useState } from 'react';
import { Plus, Trash2, Package, Box, Cpu, FolderOpen } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { CustomCategory, MainCategory, BagItem } from '@/app/App';
import { toast } from 'sonner';

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCategory: (category: Omit<CustomCategory, 'id' | 'createdAt'>) => void;
}

export function CreateCategoryDialog({ isOpen, onClose, onCreateCategory }: CreateCategoryDialogProps) {
  const [mainCategory, setMainCategory] = useState<MainCategory>('SAC');
  const [categoryName, setCategoryName] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [barcode, setBarcode] = useState('');
  const [items, setItems] = useState<Omit<BagItem, 'id'>[]>([]);
  const [currentItem, setCurrentItem] = useState<Omit<BagItem, 'id'>>({
    barcode: '',
    name: '',
    quantity: 1,
    expiryDate: '',
    controlDate: '',
  });

  const resetForm = () => {
    setMainCategory('SAC');
    setCategoryName('');
    setSubCategory('');
    setBarcode('');
    setItems([]);
    setCurrentItem({
      barcode: '',
      name: '',
      quantity: 1,
      expiryDate: '',
      controlDate: '',
    });
  };

  const handleAddItem = () => {
    if (!currentItem.barcode || !currentItem.name) {
      toast.error('Le code-barres et le nom sont requis');
      return;
    }

    setItems([...items, currentItem]);
    setCurrentItem({
      barcode: '',
      name: '',
      quantity: 1,
      expiryDate: '',
      controlDate: '',
    });
    toast.success('Article ajouté');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!categoryName) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    if (!barcode) {
      toast.error('Le code-barres de la catégorie est requis');
      return;
    }

    if (items.length === 0) {
      toast.error('Ajoutez au moins un article à la catégorie');
      return;
    }

    // Generate barcode if needed (auto-generate a unique one)
    const generatedBarcode = barcode || `${mainCategory}-${Date.now()}`;

    const newCategory: Omit<CustomCategory, 'id' | 'createdAt'> = {
      mainCategory,
      categoryName,
      subCategory: (mainCategory === 'SAC' || mainCategory === 'AUTRE') && subCategory ? subCategory : undefined,
      barcode: generatedBarcode,
      items: items.map((item, index) => ({
        ...item,
        id: `${Date.now()}-${index}`,
      })),
    };

    onCreateCategory(newCategory);
    toast.success(`${mainCategory} créé(e) avec succès`);
    resetForm();
    onClose();
  };

  const getCategoryIcon = (category: MainCategory) => {
    switch (category) {
      case 'SAC':
        return <Package className="size-5" />;
      case 'KIT':
        return <Box className="size-5" />;
      case 'APPAREIL':
        return <Cpu className="size-5" />;
      case 'AUTRE':
        return <FolderOpen className="size-5" />;
    }
  };

  const showSubCategory = mainCategory === 'SAC' || mainCategory === 'AUTRE';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
          <DialogDescription>
            Configurez votre sac, kit, appareil ou autre catégorie personnalisée avec tous les articles qu'elle contient.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Type de catégorie */}
          <div className="space-y-2">
            <Label>Type de catégorie</Label>
            <div className="grid grid-cols-4 gap-2">
              {(['SAC', 'KIT', 'APPAREIL', 'AUTRE'] as MainCategory[]).map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={mainCategory === cat ? 'default' : 'outline'}
                  className="flex items-center gap-2 justify-center"
                  onClick={() => setMainCategory(cat)}
                >
                  {getCategoryIcon(cat)}
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nom de la catégorie *</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder={`Ex: ${mainCategory === 'SAC' ? 'Sac PSE1' : mainCategory === 'KIT' ? 'Kit traumatologie' : mainCategory === 'APPAREIL' ? 'Défibrillateur' : 'Lot A'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-barcode">Code-barres de la catégorie *</Label>
              <Input
                id="category-barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Ex: SAC-PSE1-2024"
              />
            </div>
          </div>

          {/* Sous-catégorie (pour SAC et AUTRE) */}
          {showSubCategory && (
            <div className="space-y-2">
              <Label htmlFor="sub-category">
                Sous-catégorie {mainCategory === 'AUTRE' ? '(LOT A, LOT B, LOT C)' : '(optionnel)'}
              </Label>
              {mainCategory === 'AUTRE' ? (
                <Select value={subCategory} onValueChange={setSubCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une sous-catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOT A">LOT A</SelectItem>
                    <SelectItem value="LOT B">LOT B</SelectItem>
                    <SelectItem value="LOT C">LOT C</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="sub-category"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="Ex: PSE1, PSE2..."
                />
              )}
            </div>
          )}

          {/* Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Articles contenus ({items.length})</Label>
            </div>

            {/* Formulaire d'ajout d'article */}
            <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
              <h4 className="font-medium text-sm">Ajouter un article</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-barcode">Code-barres *</Label>
                  <Input
                    id="item-barcode"
                    value={currentItem.barcode}
                    onChange={(e) => setCurrentItem({ ...currentItem, barcode: e.target.value })}
                    placeholder="Ex: 3401597847110"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-name">Nom *</Label>
                  <Input
                    id="item-name"
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                    placeholder="Ex: Compresses stériles"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-quantity">Quantité</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-expiry">Date de péremption</Label>
                  <Input
                    id="item-expiry"
                    type="date"
                    value={currentItem.expiryDate}
                    onChange={(e) => setCurrentItem({ ...currentItem, expiryDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="item-control">Date de contrôle</Label>
                  <Input
                    id="item-control"
                    type="date"
                    value={currentItem.controlDate}
                    onChange={(e) => setCurrentItem({ ...currentItem, controlDate: e.target.value })}
                  />
                </div>
              </div>

              <Button type="button" onClick={handleAddItem} className="w-full">
                <Plus className="size-4 mr-2" />
                Ajouter cet article
              </Button>
            </div>

            {/* Liste des articles ajoutés */}
            {items.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 font-medium text-sm">
                  Articles ajoutés
                </div>
                <div className="divide-y max-h-60 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 flex items-start justify-between hover:bg-slate-50">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-slate-600 space-y-1 mt-1">
                          <div>Code-barres: <code className="bg-slate-200 px-1 rounded">{item.barcode}</code></div>
                          <div>Quantité: {item.quantity}</div>
                          {item.expiryDate && <div>Péremption: {new Date(item.expiryDate).toLocaleDateString('fr-FR')}</div>}
                          {item.controlDate && <div>Contrôle: {new Date(item.controlDate).toLocaleDateString('fr-FR')}</div>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
            Annuler
          </Button>
          <Button type="button" onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            Créer la catégorie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
