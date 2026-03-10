import { useState } from 'react';
import { Scan, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { CategoryBarcodeDialog } from '@/app/components/CategoryBarcodeDialog';
import { CustomCategory } from '@/app/App';
import { toast } from 'sonner';

interface CategoryScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryScanner({ isOpen, onClose }: CategoryScannerProps) {
  const [barcode, setBarcode] = useState('');
  const [foundCategory, setFoundCategory] = useState<CustomCategory | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const handleScan = () => {
    if (!barcode.trim()) {
      toast.error('Veuillez entrer un code-barres');
      return;
    }

    const categories: CustomCategory[] = JSON.parse(localStorage.getItem('customCategories') || '[]');
    const category = categories.find(c => c.barcode === barcode.trim());

    if (category) {
      setFoundCategory(category);
      setIsCategoryDialogOpen(true);
      toast.success(`${category.mainCategory} trouvé(e) : ${category.categoryName}`);
    } else {
      toast.error('Aucune catégorie trouvée avec ce code-barres');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="size-5 text-blue-600" />
              Scanner un sac/kit/appareil
            </DialogTitle>
            <DialogDescription>
              Entrez ou scannez le code-barres d'une catégorie pour voir son contenu
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Code-barres..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
                className="flex-1"
              />
              <Button onClick={handleScan} className="bg-blue-600 hover:bg-blue-700">
                <Search className="size-4 mr-2" />
                Rechercher
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Astuce</p>
              <p>
                Utilisez un lecteur de code-barres pour scanner directement le code-barres
                imprimé sur votre sac, kit ou appareil.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {foundCategory && (
        <CategoryBarcodeDialog
          isOpen={isCategoryDialogOpen}
          onClose={() => {
            setIsCategoryDialogOpen(false);
            setFoundCategory(null);
            setBarcode('');
          }}
          category={foundCategory}
        />
      )}
    </>
  );
}
