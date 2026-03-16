import { useState, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { StockTable } from '@/app/components/StockTable';
import { AddProductDialog } from '@/app/components/AddProductDialog';
import { AdminPanel } from '@/app/components/AdminPanel';
import { StatsCards } from '@/app/components/StatsCards';
import { BugReportButton } from '@/app/components/BugReportButton';
import { CategoryScanner } from '@/app/components/CategoryScanner';
import { Product, User } from '@/app/App';
import { pharmacyProductsApi } from '@/app/services/api';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onAddLog: (action: string, user: string, details: string) => void;
  adminNotifications?: { bugReports: number; passwordResets: number };
}

export function Dashboard({ currentUser, onLogout, onAddLog, adminNotifications }: DashboardProps) {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
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
            isOut: false,
            bagBarcode: '',
          }))
        );
      } catch (error) {
        console.error('Erreur lors du chargement des produits :', error);
        toast.error('Impossible de charger les produits');
      }
    };

    loadProducts();
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    const id = Date.now().toString();
    const newProduct: Product = {
      ...product,
      id,
      isOut: false
    };

    try {
      await pharmacyProductsApi.create({
        id,
        barcode: newProduct.barcode,
        name: newProduct.name,
        category: newProduct.category,
        lotNumber: newProduct.lot,
        expiryDate: newProduct.expiryDate,
        controlDate: newProduct.controlDate,
        quantity: newProduct.quantity,
      });

      saveProducts([...products, newProduct]);
      onAddLog('ADD_PRODUCT', currentUser.username, `Ajout du produit: ${product.name}`);
    } catch (error) {
      console.error('Erreur lors de la création du produit :', error);
      toast.error('Impossible d\'ajouter le produit');
    }
  };

  const handleUpdateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const mergedProduct = { ...product, ...updatedProduct };

    try {
      await pharmacyProductsApi.update(id, {
        barcode: mergedProduct.barcode,
        name: mergedProduct.name,
        category: mergedProduct.category,
        lotNumber: mergedProduct.lot,
        expiryDate: mergedProduct.expiryDate,
        controlDate: mergedProduct.controlDate,
        quantity: mergedProduct.quantity,
      });

      const updatedProducts = products.map(p => (p.id === id ? mergedProduct : p));
      saveProducts(updatedProducts);
      onAddLog('UPDATE_PRODUCT', currentUser.username, `Modification du produit: ${product.name}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit :', error);
      toast.error('Impossible de mettre à jour le produit');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    try {
      await pharmacyProductsApi.delete(id);
      const updatedProducts = products.filter(p => p.id !== id);
      saveProducts(updatedProducts);
      onAddLog('DELETE_PRODUCT', currentUser.username, `Suppression du produit: ${product.name}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du produit :', error);
      toast.error('Impossible de supprimer le produit');
    }
  };

  const handleToggleOut = async (id: string, isOut: boolean, location?: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const updatedProduct = {
      ...product,
      isOut,
      outLocation: isOut ? location : undefined,
      outDate: isOut ? new Date().toISOString() : undefined,
    };

    try {
      await pharmacyProductsApi.update(id, {
        barcode: updatedProduct.barcode,
        name: updatedProduct.name,
        category: updatedProduct.category,
        lotNumber: updatedProduct.lot,
        expiryDate: updatedProduct.expiryDate,
        controlDate: updatedProduct.controlDate,
        quantity: updatedProduct.quantity,
      });

      const updatedProducts = products.map(p => (p.id === id ? updatedProduct : p));
      saveProducts(updatedProducts);

      if (isOut) {
        onAddLog('LOT_OUT', currentUser.username, `Sortie du ${product.name} vers ${location}`);
      } else {
        onAddLog('LOT_IN', currentUser.username, `Retour du ${product.name} de ${product.outLocation}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'état du produit :', error);
      toast.error('Impossible de mettre à jour le statut du produit');
    }
  };

  const handleToggleCategoryOut = async (category: string, isOut: boolean, location?: string) => {
    const categoryProducts = products.filter(p => p.category === category);
    const updatedProducts = products.map(p =>
      p.category === category
        ? {
            ...p,
            isOut,
            outLocation: isOut ? location : undefined,
            outDate: isOut ? new Date().toISOString() : undefined,
          }
        : p
    );

    try {
      await Promise.all(
        categoryProducts.map(prod =>
          pharmacyProductsApi.update(prod.id, {
            barcode: prod.barcode,
            name: prod.name,
            category: prod.category,
            lotNumber: prod.lot,
            expiryDate: prod.expiryDate,
            controlDate: prod.controlDate,
            quantity: prod.quantity,
          })
        )
      );

      saveProducts(updatedProducts);

      if (isOut) {
        onAddLog('CATEGORY_OUT', currentUser.username, `Sortie de toute la catégorie ${category} (${categoryProducts.length} produits) vers ${location}`);
      } else {
        onAddLog('CATEGORY_IN', currentUser.username, `Retour de toute la catégorie ${category} (${categoryProducts.length} produits)`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des produits de catégorie :', error);
      toast.error('Impossible de mettre à jour les produits de la catégorie');
    }
  };

  const handleUpdateProductsControlDate = async (productIds: string[], newControlDate: string) => {
    const updatedProducts = products.map(p =>
      productIds.includes(p.id)
        ? { ...p, controlDate: newControlDate }
        : p
    );

    try {
      await Promise.all(
        updatedProducts
          .filter(p => productIds.includes(p.id))
          .map(p =>
            pharmacyProductsApi.update(p.id, {
              barcode: p.barcode,
              name: p.name,
              category: p.category,
              lotNumber: p.lot,
              expiryDate: p.expiryDate,
              controlDate: p.controlDate,
              quantity: p.quantity,
            })
          )
      );

      saveProducts(updatedProducts);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des dates de contrôle :', error);
      toast.error('Impossible de mettre à jour les dates de contrôle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <Header 
        currentUser={currentUser}
        onAdminClick={() => setIsAdminOpen(true)} 
        onLogout={onLogout}
        onScanClick={() => setIsScannerOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        <div className="space-y-6">
          <StatsCards products={products} />
          
          <StockTable 
            products={products}
            currentUser={currentUser}
            onAddProduct={() => setIsAddProductOpen(true)}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onToggleOut={handleToggleOut}
            onToggleCategoryOut={handleToggleCategoryOut}
            onUpdateProductsControlDate={handleUpdateProductsControlDate}
            onAddLog={onAddLog}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          Fait avec ❤️ par Mathieu.M
        </div>
      </footer>

      {/* Bug Report Button */}
      <BugReportButton currentUser={currentUser} currentPage="Dashboard" />

      {currentUser.role === 'admin' && (
        <AdminPanel 
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          currentUser={currentUser}
          onAddLog={onAddLog}
        />
      )}

      <AddProductDialog
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <CategoryScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}