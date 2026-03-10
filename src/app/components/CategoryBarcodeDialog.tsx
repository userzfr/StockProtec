import { useState, useRef } from 'react';
import Barcode from 'react-barcode';
import { Printer, QrCode, Package, CheckSquare, XSquare, AlertTriangle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { CustomCategory } from '@/app/App';
import { toast } from 'sonner';

interface CategoryBarcodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CustomCategory;
  onUpdateChecklist?: (categoryId: string, checkedItems: string[]) => void;
}

export function CategoryBarcodeDialog({ isOpen, onClose, category, onUpdateChecklist }: CategoryBarcodeDialogProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Impression - ${category.categoryName}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              .print-container {
                max-width: 100%;
              }
              .barcode-section {
                text-align: center;
                padding: 20px;
                border: 2px solid #000;
                margin-bottom: 20px;
              }
              .info-section {
                margin-top: 20px;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 10px;
              }
              h2 {
                font-size: 18px;
                margin-bottom: 10px;
              }
              .info-row {
                margin: 5px 0;
                font-size: 14px;
              }
              svg {
                max-width: 100%;
                height: auto;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleToggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
    
    if (onUpdateChecklist) {
      onUpdateChecklist(category.id, Array.from(newChecked));
    }
  };

  const allChecked = category.items.every(item => checkedItems.has(item.id));
  const someChecked = category.items.some(item => checkedItems.has(item.id)) && !allChecked;
  const noneChecked = !category.items.some(item => checkedItems.has(item.id));

  const getCategoryIcon = () => {
    switch (category.mainCategory) {
      case 'SAC':
        return <Package className="size-5" />;
      case 'KIT':
        return <Package className="size-5" />;
      case 'APPAREIL':
        return <Package className="size-5" />;
      case 'AUTRE':
        return <Package className="size-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getCategoryIcon()}
            {category.categoryName}
          </DialogTitle>
          <DialogDescription>
            Code-barres et contenu du {category.mainCategory.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section à imprimer */}
          <div ref={printRef} className="print-container">
            <div className="barcode-section border-2 border-slate-200 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-center mb-4">{category.categoryName}</h1>
              
              <div className="flex justify-center mb-4">
                <Barcode 
                  value={category.barcode}
                  format="CODE128"
                  width={2}
                  height={100}
                  displayValue={true}
                  fontSize={16}
                />
              </div>

              <div className="info-section space-y-2 text-center">
                <div className="info-row">
                  <span className="font-semibold">Type:</span> {category.mainCategory}
                </div>
                {category.subCategory && (
                  <div className="info-row">
                    <span className="font-semibold">Sous-catégorie:</span> {category.subCategory}
                  </div>
                )}
                <div className="info-row">
                  <span className="font-semibold">Nombre d'articles:</span> {category.items.length}
                </div>
              </div>
            </div>
          </div>

          {/* Bouton d'impression */}
          <Button onClick={handlePrint} className="w-full bg-blue-600 hover:bg-blue-700">
            <Printer className="size-4 mr-2" />
            Imprimer le code-barres
          </Button>

          {/* Checklist des articles */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold">Contrôle du contenu</h3>
              <div className="flex items-center gap-2">
                {allChecked && (
                  <Badge className="bg-green-500">
                    <CheckSquare className="size-3 mr-1" />
                    Complet
                  </Badge>
                )}
                {someChecked && (
                  <Badge className="bg-yellow-500">
                    <AlertTriangle className="size-3 mr-1" />
                    Partiel
                  </Badge>
                )}
                {noneChecked && (
                  <Badge variant="destructive">
                    <XSquare className="size-3 mr-1" />
                    Non vérifié
                  </Badge>
                )}
                <span className="text-sm text-slate-600">
                  {checkedItems.size}/{category.items.length}
                </span>
              </div>
            </div>

            <div className="divide-y">
              {category.items.map((item) => {
                const isChecked = checkedItems.has(item.id);
                const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                const needsControl = item.controlDate && new Date(item.controlDate) < new Date();

                return (
                  <div
                    key={item.id}
                    className={`p-4 flex items-start gap-4 transition-colors ${
                      isChecked ? 'bg-green-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleToggleItem(item.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-slate-600 space-y-1 mt-1">
                            <div>
                              Code-barres: <code className="bg-slate-200 px-1 rounded">{item.barcode}</code>
                            </div>
                            <div>Quantité: {item.quantity}</div>
                            {item.expiryDate && (
                              <div className={isExpired ? 'text-red-600 font-medium' : ''}>
                                Péremption: {new Date(item.expiryDate).toLocaleDateString('fr-FR')}
                                {isExpired && ' ⚠️ PÉRIMÉ'}
                              </div>
                            )}
                            {item.controlDate && (
                              <div className={needsControl ? 'text-orange-600 font-medium' : ''}>
                                Contrôle: {new Date(item.controlDate).toLocaleDateString('fr-FR')}
                                {needsControl && ' ⚠️ À CONTRÔLER'}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">Périmé</Badge>
                          )}
                          {needsControl && (
                            <Badge className="bg-orange-500 text-xs">À contrôler</Badge>
                          )}
                        </div>
                      </div>

                      {/* Mini barcode pour chaque item */}
                      <div className="mt-2 flex justify-start">
                        <div className="bg-white p-1 border rounded">
                          <Barcode 
                            value={item.barcode}
                            format="CODE128"
                            width={1}
                            height={30}
                            displayValue={false}
                            fontSize={10}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Résumé de contrôle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Résumé du contrôle</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Articles vérifiés</div>
                <div className="text-xl font-bold text-green-600">{checkedItems.size}</div>
              </div>
              <div>
                <div className="text-slate-600">Articles manquants</div>
                <div className="text-xl font-bold text-red-600">
                  {category.items.length - checkedItems.size}
                </div>
              </div>
              <div>
                <div className="text-slate-600">Total attendu</div>
                <div className="text-xl font-bold text-blue-600">{category.items.length}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}