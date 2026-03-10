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

export function PharmacyStockPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Charger les produits de la pharmacie
    const savedProducts = localStorage.getItem('pharmacyProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  };

  const handleAddProduct = (product: PharmacyProduct) => {
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    localStorage.setItem('pharmacyProducts', JSON.stringify(updatedProducts));
    addLog('CREATE_PHARMACY_PRODUCT', `Ajout du produit "${product.name}"`);
    toast.success(`Produit "${product.name}" ajouté avec succès`);
  };

  const handleUpdateProduct = (updatedProduct: PharmacyProduct) => {
    const updatedProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updatedProducts);
    localStorage.setItem('pharmacyProducts', JSON.stringify(updatedProducts));
    addLog('UPDATE_PHARMACY_PRODUCT', `Modification du produit "${updatedProduct.name}"`);
    toast.success(`Produit "${updatedProduct.name}" mis à jour`);
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem('pharmacyProducts', JSON.stringify(updatedProducts));
    if (product) {
      addLog('DELETE_PHARMACY_PRODUCT', `Suppression du produit "${product.name}"`);
    }
    toast.success('Produit supprimé avec succès');
  };

  const addLog = (action: string, details: string) => {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    logs.unshift({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      user: currentUser.username,
      details,
    });
    if (logs.length > 100) logs.pop();
    localStorage.setItem('logs', JSON.stringify(logs));
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

      {/* Avertissement */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-900">
                Stock réservé aux consommables médicaux
              </p>
              <p className="text-sm text-yellow-800">
                Ce stock contient <strong>uniquement du consommable médical</strong> (compresses, pansements, sérum physiologique, etc.).
                Le matériel opérationnel non consommable (DSA, aspirateurs, brancards, etc.) doit être géré dans l'onglet "Matériel opérationnel".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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