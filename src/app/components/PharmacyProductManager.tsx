import { useState } from 'react';
import { PharmacyProduct } from '@/app/App';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Edit, Trash2, Barcode, AlertTriangle, Package } from 'lucide-react';
import { EditPharmacyProductDialog } from './EditPharmacyProductDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { SimpleBarcodeDialog } from './SimpleBarcodeDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PharmacyProductManagerProps {
  products: PharmacyProduct[];
  onUpdateProduct: (product: PharmacyProduct) => void;
  onDeleteProduct: (productId: string) => void;
}

export function PharmacyProductManager({ products, onUpdateProduct, onDeleteProduct }: PharmacyProductManagerProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PharmacyProduct | null>(null);

  const handleEdit = (product: PharmacyProduct) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleDelete = (product: PharmacyProduct) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleShowBarcode = (product: PharmacyProduct) => {
    setSelectedProduct(product);
    setBarcodeDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      onDeleteProduct(selectedProduct.id);
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    if (expiry < now) return 'expired';
    if (expiry <= threeMonthsFromNow) return 'expiring-soon';
    return 'ok';
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun produit trouvé</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => {
        const expiryStatus = getExpiryStatus(product.expiryDate);
        const isLowStock = product.minStock && product.quantity <= product.minStock;

        return (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-500">Lot : {product.lot}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-start">
                      {expiryStatus === 'expired' && (
                        <Badge className="bg-red-600">Périmé</Badge>
                      )}
                      {expiryStatus === 'expiring-soon' && (
                        <Badge className="bg-yellow-500">Expire bientôt</Badge>
                      )}
                      {isLowStock && (
                        <Badge className="bg-orange-500">Stock bas</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Catégorie</p>
                      <p className="font-medium">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quantité</p>
                      <p className="font-medium">{product.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Péremption</p>
                      <p className="font-medium">
                        {format(new Date(product.expiryDate), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                    {product.location && (
                      <div>
                        <p className="text-gray-500">Emplacement</p>
                        <p className="font-medium">{product.location}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleShowBarcode(product)}>
                    <Barcode className="w-4 h-4 md:mr-0 mr-1" />
                    <span className="md:hidden">Code-barres</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {selectedProduct && (
        <>
          <EditPharmacyProductDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            product={selectedProduct}
            onUpdateProduct={onUpdateProduct}
          />
          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Supprimer le produit"
            description={`Êtes-vous sûr de vouloir supprimer "${selectedProduct.name}" ? Cette action est irréversible.`}
            onConfirm={confirmDelete}
          />
          <SimpleBarcodeDialog
            open={barcodeDialogOpen}
            onOpenChange={setBarcodeDialogOpen}
            barcode={selectedProduct.barcode}
            title={selectedProduct.name}
          />
        </>
      )}
    </div>
  );
}