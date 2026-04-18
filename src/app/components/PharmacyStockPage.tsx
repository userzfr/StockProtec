import { useState, useEffect } from 'react';
import { PharmacyProduct, User } from '@/app/App';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Plus, Pill, Search, Package } from 'lucide-react';
import { PharmacyProductManager } from './PharmacyProductManager';
import { CreatePharmacyProductDialog } from './CreatePharmacyProductDialog';
import { PharmacyStatsCards } from './PharmacyStatsCards';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/AuthContext';
import { pharmacyProductsApi, logsApi } from '@/app/services/api';

export function PharmacyStockPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const fetchedProducts = await pharmacyProductsApi.getAll();
      setProducts(
        fetchedProducts.map((p: any) => ({
          id: p.id,
          barcode: p.barcode,
          name: p.name,
          lot: p.lotNumber || '',
          expiryDate: p.expiryDate || '',
          controlDate: p.controlDate || '',
          quantity: p.quantity,
          category: p.category,
          createdAt: p.date_creation,
        }))
      );
    } catch (error) {
      console.error('Erreur lors du chargement des produits :', error);
      toast.error('Impossible de charger les produits');
    }
  };

  const handleAddProduct = async (product: PharmacyProduct) => {
    try {
      await pharmacyProductsApi.create({
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        category: product.category,
        lotNumber: product.lot,
        expiryDate: product.expiryDate,
        controlDate: product.controlDate,
        quantity: product.quantity,
      });

      setProducts(prev => [...prev, product]);
      await logsApi.create({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'CREATE_PHARMACY_PRODUCT',
        user: currentUser.username,
        details: `Ajout du produit "${product.name}"`,
      });
      toast.success(`Produit "${product.name}" ajouté avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit :', error);
      toast.error('Impossible d\'ajouter le produit');
    }
  };

  const handleUpdateProduct = async (updatedProduct: PharmacyProduct) => {
    try {
      await pharmacyProductsApi.update(updatedProduct.id, {
        barcode: updatedProduct.barcode,
        name: updatedProduct.name,
        category: updatedProduct.category,
        lotNumber: updatedProduct.lot,
        expiryDate: updatedProduct.expiryDate,
        controlDate: updatedProduct.controlDate,
        quantity: updatedProduct.quantity,
      });

      setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
      await logsApi.create({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'UPDATE_PHARMACY_PRODUCT',
        user: currentUser.username,
        details: `Modification du produit "${updatedProduct.name}"`,
      });
      toast.success(`Produit "${updatedProduct.name}" mis à jour`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit :', error);
      toast.error('Impossible de mettre à jour le produit');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      await pharmacyProductsApi.delete(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      await logsApi.create({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'DELETE_PHARMACY_PRODUCT',
        user: currentUser.username,
        details: `Suppression du produit "${product.name}"`,
      });
      toast.success('Produit supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du produit :', error);
      toast.error('Impossible de supprimer le produit');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lot.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock pharmacie</h1>
        <p className="text-gray-500">
          Gérez le stock de consommables médicaux pour réapprovisionner les sacs
        </p>
      </div>

      {/* Statistiques */}
      <PharmacyStatsCards products={products} />

      {/* Recherche et actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-red-600 hover:bg-red-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Liste des produits */}
      <PharmacyProductManager
        products={filteredProducts}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Dialog de création */}
      <CreatePharmacyProductDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateProduct={handleAddProduct}
      />
    </div>
  );
}