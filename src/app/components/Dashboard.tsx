import { useState } from 'react';
import { Header } from '@/app/components/Header';
import { StockTable } from '@/app/components/StockTable';
import { AddProductDialog } from '@/app/components/AddProductDialog';
import { AdminPanel } from '@/app/components/AdminPanel';
import { StatsCards } from '@/app/components/StatsCards';
import { BugReportButton } from '@/app/components/BugReportButton';
import { CategoryScanner } from '@/app/components/CategoryScanner';
import { Product, User } from '@/app/App';

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
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      return JSON.parse(savedProducts);
    }
    return [
      {
        id: '1',
        barcode: '3401597847110',
        name: 'Compresses stériles 10x10',
        lot: 'LOT A',
        expiryDate: '2026-12-31',
        controlDate: '2026-02-15',
        quantity: 150,
        category: 'LOT A',
        isOut: false,
        bagBarcode: 'LOTA2024'
      },
      {
        id: '2',
        barcode: '3401345678901',
        name: 'Pansements adhésifs',
        lot: 'LOT A-001',
        expiryDate: '2025-06-30',
        controlDate: '2025-03-01',
        quantity: 250,
        category: 'LOT A',
        isOut: false,
        bagBarcode: 'LOTA2024'
      },
      {
        id: '3',
        barcode: '3401234567890',
        name: 'Défibrillateur portable',
        lot: 'ELEC-2024-001',
        expiryDate: '2024-03-15',
        controlDate: '2024-02-10',
        quantity: 5,
        category: 'EQUIPEMENT ELECTRONIQUE',
        isOut: false
      },
      {
        id: '4',
        barcode: '3401987654321',
        name: 'Kit de secours complet',
        lot: 'LOT B-002',
        expiryDate: '2027-01-20',
        controlDate: '2026-06-01',
        quantity: 12,
        category: 'LOT B',
        isOut: true,
        outLocation: 'Poste Carnot',
        outDate: '2026-01-15',
        bagBarcode: 'LOTB2024'
      },
      {
        id: '5',
        barcode: '3401567890123',
        name: 'Radio portable VHF',
        lot: 'ELEC-2024-002',
        expiryDate: '2025-09-10',
        controlDate: '2025-04-15',
        quantity: 8,
        category: 'EQUIPEMENT ELECTRONIQUE',
        isOut: false
      },
      {
        id: '6',
        barcode: '3401678901234',
        name: 'Matériel premiers secours',
        lot: 'LOT A-003',
        expiryDate: '2028-12-31',
        controlDate: '2027-06-30',
        quantity: 20,
        category: 'LOT A',
        isOut: false
      },
      {
        id: '7',
        barcode: '3401789012345',
        name: 'Oxygène médical portable',
        lot: 'LOT B-004',
        expiryDate: '2024-02-28',
        controlDate: '2024-02-05',
        quantity: 6,
        category: 'LOT B',
        isOut: true,
        outLocation: 'Poste République',
        outDate: '2026-01-20',
        bagBarcode: 'LOTB2024'
      },
      {
        id: '8',
        barcode: '3401890123456',
        name: 'Lampe torche LED rechargeable',
        lot: 'ELEC-2024-003',
        expiryDate: '2026-08-15',
        controlDate: '2026-04-01',
        quantity: 15,
        category: 'EQUIPEMENT ELECTRONIQUE',
        isOut: false
      }
    ];
  });

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      isOut: false
    };
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
    onAddLog('ADD_PRODUCT', currentUser.username, `Ajout du produit: ${product.name}`);
  };

  const handleUpdateProduct = (id: string, updatedProduct: Partial<Product>) => {
    const product = products.find(p => p.id === id);
    const updatedProducts = products.map(p => p.id === id ? { ...p, ...updatedProduct } : p);
    saveProducts(updatedProducts);
    if (product) {
      onAddLog('UPDATE_PRODUCT', currentUser.username, `Modification du produit: ${product.name}`);
    }
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    const updatedProducts = products.filter(p => p.id !== id);
    saveProducts(updatedProducts);
    if (product) {
      onAddLog('DELETE_PRODUCT', currentUser.username, `Suppression du produit: ${product.name}`);
    }
  };

  const handleToggleOut = (id: string, isOut: boolean, location?: string) => {
    const product = products.find(p => p.id === id);
    const updatedProducts = products.map(p => 
      p.id === id 
        ? { 
            ...p, 
            isOut, 
            outLocation: isOut ? location : undefined,
            outDate: isOut ? new Date().toISOString() : undefined
          } 
        : p
    );
    saveProducts(updatedProducts);
    if (product) {
      if (isOut) {
        onAddLog('LOT_OUT', currentUser.username, `Sortie du ${product.name} vers ${location}`);
      } else {
        onAddLog('LOT_IN', currentUser.username, `Retour du ${product.name} de ${product.outLocation}`);
      }
    }
  };

  const handleToggleCategoryOut = (category: string, isOut: boolean, location?: string) => {
    const categoryProducts = products.filter(p => p.category === category);
    const updatedProducts = products.map(p => 
      p.category === category
        ? { 
            ...p, 
            isOut, 
            outLocation: isOut ? location : undefined,
            outDate: isOut ? new Date().toISOString() : undefined
          } 
        : p
    );
    saveProducts(updatedProducts);
    
    if (isOut) {
      onAddLog('CATEGORY_OUT', currentUser.username, `Sortie de toute la catégorie ${category} (${categoryProducts.length} produits) vers ${location}`);
    } else {
      onAddLog('CATEGORY_IN', currentUser.username, `Retour de toute la catégorie ${category} (${categoryProducts.length} produits)`);
    }
  };

  const handleUpdateProductsControlDate = (productIds: string[], newControlDate: string) => {
    const updatedProducts = products.map(p => 
      productIds.includes(p.id) 
        ? { ...p, controlDate: newControlDate } 
        : p
    );
    saveProducts(updatedProducts);
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