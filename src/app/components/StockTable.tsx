import { useState } from 'react';
import { Plus, Search, Filter, Pencil, Trash2, AlertCircle, Clock, LogOut as LogOutIcon, LogIn, QrCode, PackageSearch, ClipboardCheck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Product, User } from '@/app/App';
import { EditProductDialog } from '@/app/components/EditProductDialog';
import { DeleteConfirmDialog } from '@/app/components/DeleteConfirmDialog';
import { LotMovementDialog } from '@/app/components/LotMovementDialog';
import { BarcodeDialog } from '@/app/components/BarcodeDialog';
import { CategoryMovementDialog } from '@/app/components/CategoryMovementDialog';
import { BagBarcodeDialog } from '@/app/components/BagBarcodeDialog';
import { InspectionDialog } from '@/app/components/InspectionDialog';
import { toast } from 'sonner';

interface StockTableProps {
  products: Product[];
  currentUser: User;
  onAddProduct: () => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onToggleOut: (id: string, isOut: boolean, location?: string) => void;
  onToggleCategoryOut: (category: string, isOut: boolean, location?: string) => void;
  onUpdateProductsControlDate: (productIds: string[], newControlDate: string) => void;
  onAddLog: (action: string, user: string, details: string) => void;
}

export function StockTable({ products, currentUser, onAddProduct, onUpdateProduct, onDeleteProduct, onToggleOut, onToggleCategoryOut, onUpdateProductsControlDate, onAddLog }: StockTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [movingCategory, setMovingCategory] = useState<string | null>(null);
  const [bagBarcodeSearch, setBagBarcodeSearch] = useState<string | null>(null);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Enhanced search: includes barcode and bag barcode
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchLower) ||
                         product.barcode.toLowerCase().includes(searchLower) ||
                         product.lot.toLowerCase().includes(searchLower) ||
                         (product.bagBarcode && product.bagBarcode.toLowerCase().includes(searchLower));
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Check if search term is a bag barcode
  const checkBagBarcode = (term: string) => {
    const trimmedTerm = term.trim().toUpperCase();
    const bagProduct = products.find(p => p.bagBarcode?.toUpperCase() === trimmedTerm);
    if (bagProduct) {
      setBagBarcodeSearch(bagProduct.bagBarcode!);
      toast.success(`Code-barres de sac détecté: ${bagProduct.bagBarcode}`);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Expiré', variant: 'destructive' as const, showIcon: true };
    } else if (diffDays <= 30) {
      return { label: 'Urgent', variant: 'destructive' as const, showIcon: true };
    } else if (diffDays <= 90) {
      return { label: 'Bientôt', variant: 'warning' as const, showIcon: true };
    }
    return { label: 'OK', variant: 'secondary' as const, showIcon: false };
  };

  const getControlStatus = (controlDate: string) => {
    const control = new Date(controlDate);
    const today = new Date();
    const diffTime = control.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Dépassé', variant: 'destructive' as const, showIcon: true };
    } else if (diffDays <= 7) {
      return { label: 'Urgent', variant: 'destructive' as const, showIcon: true };
    } else if (diffDays <= 30) {
      return { label: 'Proche', variant: 'warning' as const, showIcon: true };
    }
    return { label: 'OK', variant: 'secondary' as const, showIcon: false };
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { label: 'Rupture', variant: 'destructive' as const };
    } else if (quantity < 30) {
      return { label: 'Très faible', variant: 'destructive' as const };
    } else if (quantity < 50) {
      return { label: 'Faible', variant: 'warning' as const };
    }
    return { label: 'Normal', variant: 'default' as const };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isLot = (category: string) => {
    return category.startsWith('LOT');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDelete = (id: string) => {
    setDeletingProductId(id);
  };

  const confirmDelete = () => {
    if (deletingProductId) {
      onDeleteProduct(deletingProductId);
      toast.success('Produit supprimé avec succès');
      setDeletingProductId(null);
    }
  };

  const handleMovement = (product: Product) => {
    setMovingProduct(product);
  };

  const handleShowBarcode = (product: Product) => {
    setBarcodeProduct(product);
  };

  const handleCategoryMovement = (category: string) => {
    setMovingCategory(category);
  };

  const handleBagBarcodeSearch = (barcode: string) => {
    setBagBarcodeSearch(barcode);
  };

  const handleInspectionOpen = () => {
    setIsInspectionOpen(true);
  };

  const handleInspectionClose = () => {
    setIsInspectionOpen(false);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-2xl font-bold text-slate-800">Inventaire des Stocks</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Rechercher ou scanner..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    checkBagBarcode(e.target.value);
                  }}
                  className="pl-10 bg-white"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white">
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.filter(c => c !== 'all').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={onAddProduct} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Plus className="size-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleInspectionOpen} 
              variant="outline"
              className="bg-white hover:bg-green-50 hover:text-green-700 border-green-200"
            >
              <ClipboardCheck className="size-4 mr-2" />
              Contrôle du Matériel
            </Button>

            {categoryFilter !== 'all' && isLot(categoryFilter) && (
              <Button 
                onClick={() => handleCategoryMovement(categoryFilter)} 
                variant="outline"
                className="bg-white hover:bg-orange-50 hover:text-orange-700 border-orange-200"
              >
                <PackageSearch className="size-4 mr-2" />
                {products.filter(p => p.category === categoryFilter).every(p => p.isOut) 
                  ? `Retour de ${categoryFilter}` 
                  : `Sortie de ${categoryFilter}`}
              </Button>
            )}

            {['LOT A', 'LOT B', 'LOT C'].map(lotCategory => {
              const lotProducts = products.filter(p => p.category === lotCategory);
              if (lotProducts.length === 0 || categoryFilter === 'all') return null;
              
              const bagBarcode = lotProducts[0]?.bagBarcode;
              if (!bagBarcode) return null;

              return (
                <Button 
                  key={lotCategory}
                  onClick={() => handleBagBarcodeSearch(bagBarcode)}
                  variant="outline"
                  className="bg-white hover:bg-blue-50 hover:text-blue-700 border-blue-200"
                >
                  <QrCode className="size-4 mr-2" />
                  Scanner {lotCategory}
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Code-barres</TableHead>
                <TableHead className="font-semibold text-slate-700">Nom du produit</TableHead>
                <TableHead className="font-semibold text-slate-700">Catégorie</TableHead>
                <TableHead className="font-semibold text-slate-700">Lot</TableHead>
                <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                <TableHead className="font-semibold text-slate-700">Péremption</TableHead>
                <TableHead className="font-semibold text-slate-700">Contrôle</TableHead>
                <TableHead className="font-semibold text-slate-700">Quantité</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                    Aucun produit trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const expiryStatus = getExpiryStatus(product.expiryDate);
                  const controlStatus = getControlStatus(product.controlDate);
                  const stockStatus = getStockStatus(product.quantity);
                  
                  return (
                    <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowBarcode(product)}
                            className="p-1 h-auto hover:bg-blue-50"
                          >
                            <QrCode className="size-4 text-blue-600" />
                          </Button>
                          <span>{product.barcode}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-600">{product.lot}</TableCell>
                      <TableCell>
                        {product.isOut ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="warning" className="w-fit">
                              <LogOutIcon className="size-3 mr-1" />
                              En sortie
                            </Badge>
                            <span className="text-xs text-slate-600">{product.outLocation}</span>
                          </div>
                        ) : (
                          <Badge variant="default" className="bg-green-600">
                            <LogIn className="size-3 mr-1" />
                            Disponible
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{formatDate(product.expiryDate)}</span>
                          <Badge variant={expiryStatus.variant} className="w-fit text-xs">
                            {expiryStatus.showIcon && <AlertCircle className="size-3 mr-1" />}
                            {expiryStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{formatDate(product.controlDate)}</span>
                          <Badge variant={controlStatus.variant} className="w-fit text-xs">
                            {controlStatus.showIcon && <Clock className="size-3 mr-1" />}
                            {controlStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-lg">{product.quantity}</span>
                          <Badge variant={stockStatus.variant} className="w-fit text-xs">
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLot(product.category) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMovement(product)}
                              className={product.isOut ? "hover:bg-green-50 hover:text-green-700" : "hover:bg-orange-50 hover:text-orange-700"}
                            >
                              {product.isOut ? (
                                <LogIn className="size-4" />
                              ) : (
                                <LogOutIcon className="size-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdateProduct={onUpdateProduct}
        />
      )}

      {movingProduct && (
        <LotMovementDialog
          product={movingProduct}
          isOpen={!!movingProduct}
          onClose={() => setMovingProduct(null)}
          onConfirm={onToggleOut}
        />
      )}

      {barcodeProduct && (
        <BarcodeDialog
          product={barcodeProduct}
          isOpen={!!barcodeProduct}
          onClose={() => setBarcodeProduct(null)}
        />
      )}

      {movingCategory && (
        <CategoryMovementDialog
          category={movingCategory}
          products={products}
          isOpen={!!movingCategory}
          onClose={() => setMovingCategory(null)}
          onConfirm={onToggleCategoryOut}
        />
      )}

      {bagBarcodeSearch && (
        <BagBarcodeDialog
          bagBarcode={bagBarcodeSearch}
          products={products}
          isOpen={!!bagBarcodeSearch}
          onClose={() => setBagBarcodeSearch(null)}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        onConfirm={confirmDelete}
      />

      <InspectionDialog
        isOpen={isInspectionOpen}
        onClose={handleInspectionClose}
        products={products}
        currentUser={currentUser}
        onAddLog={onAddLog}
        onUpdateProducts={onUpdateProductsControlDate}
      />
    </Card>
  );
}