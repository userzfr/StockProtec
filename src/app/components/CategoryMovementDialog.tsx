import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Product } from '@/app/App';
import { toast } from 'sonner';
import { LogOut as LogOutIcon, LogIn, Package } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface CategoryMovementDialogProps {
  category: string;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (category: string, isOut: boolean, location?: string) => void;
}

export function CategoryMovementDialog({ category, products, isOpen, onClose, onConfirm }: CategoryMovementDialogProps) {
  const [location, setLocation] = useState('');
  
  const categoryProducts = products.filter(p => p.category === category);
  const allOut = categoryProducts.length > 0 && categoryProducts.every(p => p.isOut);
  const someOut = categoryProducts.some(p => p.isOut);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allOut) {
      // Sortie
      if (!location.trim()) {
        toast.error('Veuillez indiquer le poste de secours');
        return;
      }
      onConfirm(category, true, location);
      toast.success(`Catégorie ${category} sortie vers ${location} (${categoryProducts.length} produits)`);
    } else {
      // Retour
      onConfirm(category, false);
      toast.success(`Catégorie ${category} de retour (${categoryProducts.length} produits)`);
    }
    
    setLocation('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {allOut ? (
              <>
                <LogIn className="size-5 text-green-600" />
                Retour de catégorie {category}
              </>
            ) : (
              <>
                <LogOutIcon className="size-5 text-orange-600" />
                Sortie de catégorie {category}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {allOut 
              ? `Confirmer le retour de tous les produits de la catégorie ${category}`
              : someOut
                ? `Attention : Certains produits sont déjà en sortie. Cette action sortira tous les produits restants.`
                : `Sortir tous les produits de la catégorie ${category} vers un poste de secours`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-blue-900">Catégorie: {category}</p>
                <Badge variant="default" className="bg-blue-600">
                  {categoryProducts.length} produits
                </Badge>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 mt-3">
                {categoryProducts.map(product => (
                  <div key={product.id} className="bg-white p-2 rounded flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="size-4 text-slate-400" />
                      <span className="font-medium">{product.name}</span>
                    </div>
                    {product.isOut && (
                      <Badge variant="warning" className="text-xs">
                        En sortie
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {!allOut && (
              <div className="space-y-2">
                <Label htmlFor="location">Poste de secours destination *</Label>
                <Input
                  id="location"
                  placeholder="Ex: Poste Carnot, Poste République..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              className={allOut ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {allOut ? (
                <>
                  <LogIn className="size-4 mr-2" />
                  Confirmer le retour ({categoryProducts.length} produits)
                </>
              ) : (
                <>
                  <LogOutIcon className="size-4 mr-2" />
                  Confirmer la sortie ({categoryProducts.length} produits)
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}