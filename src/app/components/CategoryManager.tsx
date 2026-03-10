import { useState, useEffect } from 'react';
import { Plus, Package, Box, Cpu, FolderOpen, QrCode, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { CreateCategoryDialog } from '@/app/components/CreateCategoryDialog';
import { CategoryBarcodeDialog } from '@/app/components/CategoryBarcodeDialog';
import { CustomCategory } from '@/app/App';
import { toast } from 'sonner';

interface CategoryManagerProps {
  onAddLog: (action: string, user: string, details: string) => void;
  currentUser: { username: string };
}

export function CategoryManager({ onAddLog, currentUser }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CustomCategory | null>(null);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const savedCategories: CustomCategory[] = JSON.parse(localStorage.getItem('customCategories') || '[]');
    setCategories(savedCategories);
  };

  const handleCreateCategory = (categoryData: Omit<CustomCategory, 'id' | 'createdAt'>) => {
    const newCategory: CustomCategory = {
      ...categoryData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
    
    onAddLog(
      'CREATE_CATEGORY',
      currentUser.username,
      `Création de ${categoryData.mainCategory}: ${categoryData.categoryName}`
    );
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${category.categoryName}" ?`)) {
      const updatedCategories = categories.filter(c => c.id !== id);
      setCategories(updatedCategories);
      localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
      
      onAddLog(
        'DELETE_CATEGORY',
        currentUser.username,
        `Suppression de ${category.mainCategory}: ${category.categoryName}`
      );
      toast.success('Catégorie supprimée');
    }
  };

  const handleViewBarcode = (category: CustomCategory) => {
    setSelectedCategory(category);
    setIsBarcodeDialogOpen(true);
  };

  const getCategoryIcon = (mainCategory: CustomCategory['mainCategory']) => {
    switch (mainCategory) {
      case 'SAC':
        return <Package className="size-4" />;
      case 'KIT':
        return <Box className="size-4" />;
      case 'APPAREIL':
        return <Cpu className="size-4" />;
      case 'AUTRE':
        return <FolderOpen className="size-4" />;
    }
  };

  const getCategoryBadgeColor = (mainCategory: CustomCategory['mainCategory']) => {
    switch (mainCategory) {
      case 'SAC':
        return 'bg-blue-500';
      case 'KIT':
        return 'bg-green-500';
      case 'APPAREIL':
        return 'bg-purple-500';
      case 'AUTRE':
        return 'bg-orange-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Catégories personnalisées</h3>
          <p className="text-sm text-slate-600">Gérez vos sacs, kits, appareils et autres catégories</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="size-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Package className="size-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 mb-4">Aucune catégorie personnalisée</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
            <Plus className="size-4 mr-2" />
            Créer votre première catégorie
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Sous-catégorie</TableHead>
                <TableHead>Code-barres</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Badge className={getCategoryBadgeColor(category.mainCategory)}>
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(category.mainCategory)}
                        {category.mainCategory}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{category.categoryName}</span>
                  </TableCell>
                  <TableCell>
                    {category.subCategory ? (
                      <Badge variant="outline">{category.subCategory}</Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      {category.barcode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {category.items.length} article{category.items.length > 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewBarcode(category)}
                      className="text-blue-600"
                    >
                      <QrCode className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateCategoryDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateCategory={handleCreateCategory}
      />

      {selectedCategory && (
        <CategoryBarcodeDialog
          isOpen={isBarcodeDialogOpen}
          onClose={() => {
            setIsBarcodeDialogOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
        />
      )}
    </div>
  );
}
