import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Product } from '@/app/App';
import { toast } from 'sonner';
import { LogOut as LogOutIcon, LogIn } from 'lucide-react';

interface LotMovementDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, isOut: boolean, location?: string) => void;
}

export function LotMovementDialog({ product, isOpen, onClose, onConfirm }: LotMovementDialogProps) {
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.isOut) {
      // Sortie
      if (!location.trim()) {
        toast.error('Veuillez indiquer le poste de secours');
        return;
      }
      onConfirm(product.id, true, location);
      toast.success(`${product.name} sorti vers ${location}`);
    } else {
      // Retour
      onConfirm(product.id, false);
      toast.success(`${product.name} de retour de ${product.outLocation}`);
    }
    
    setLocation('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.isOut ? (
              <>
                <LogIn className="size-5 text-green-600" />
                Retour de LOT
              </>
            ) : (
              <>
                <LogOutIcon className="size-5 text-orange-600" />
                Sortie de LOT
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {product.isOut 
              ? `Confirmer le retour du LOT "${product.name}"`
              : `Sortir le LOT "${product.name}" vers un poste de secours`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-lg space-y-1">
              <p className="text-sm text-slate-600">Produit</p>
              <p className="font-medium">{product.name}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg space-y-1">
              <p className="text-sm text-slate-600">Lot</p>
              <p className="font-mono font-medium">{product.lot}</p>
            </div>

            {product.isOut ? (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg space-y-1">
                <p className="text-sm text-orange-700">Actuellement à</p>
                <p className="font-medium text-orange-900">{product.outLocation}</p>
                <p className="text-xs text-orange-600">
                  Sorti le {new Date(product.outDate!).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ) : (
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
              className={product.isOut ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {product.isOut ? (
                <>
                  <LogIn className="size-4 mr-2" />
                  Confirmer le retour
                </>
              ) : (
                <>
                  <LogOutIcon className="size-4 mr-2" />
                  Confirmer la sortie
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}