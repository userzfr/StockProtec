import { useRef } from 'react';
import Barcode from 'react-barcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Product } from '@/app/App';
import { QrCode, Printer } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface BarcodeDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeDialog({ product, isOpen, onClose }: BarcodeDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Impression - ${product?.name || 'Produit'}</title>
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
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 20px;
              }
              .info-item {
                border: 1px solid #ddd;
                padding: 10px;
                border-radius: 5px;
              }
              .info-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
              }
              .info-value {
                font-size: 14px;
                font-weight: bold;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 10px;
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
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Si le produit n'existe pas, ne rien afficher
  if (!product) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" aria-describedby="barcode-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5 text-blue-600" />
            Code-barres et Informations
          </DialogTitle>
        </DialogHeader>
        <p id="barcode-description" className="sr-only">
          Affichage du code-barres et des informations du produit
        </p>

        <div className="space-y-4">
          {/* Section à imprimer */}
          <div ref={printRef} className="print-container">
            <div className="barcode-section flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-lg border-2 border-blue-200">
              <h1 className="text-xl font-bold mb-4 text-center">{product.name}</h1>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <Barcode 
                  value={product.barcode}
                  format="CODE128"
                  width={2}
                  height={80}
                  displayValue={true}
                  fontSize={16}
                />
              </div>
            </div>

            {/* Product Information */}
            <div className="info-section space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="info-item bg-slate-50 p-3 rounded-lg">
                  <p className="info-label text-xs text-slate-600 mb-1">Nom du produit</p>
                  <p className="info-value font-medium text-sm">{product.name}</p>
                </div>

                <div className="info-item bg-slate-50 p-3 rounded-lg">
                  <p className="info-label text-xs text-slate-600 mb-1">Catégorie</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {product.category}
                  </Badge>
                </div>

                <div className="info-item bg-slate-50 p-3 rounded-lg">
                  <p className="info-label text-xs text-slate-600 mb-1">Numéro de lot</p>
                  <p className="info-value font-mono font-medium text-sm">{product.lot}</p>
                </div>

                <div className="info-item bg-slate-50 p-3 rounded-lg">
                  <p className="info-label text-xs text-slate-600 mb-1">Quantité</p>
                  <p className="info-value font-bold text-lg text-blue-600">{product.quantity}</p>
                </div>

                <div className="info-item bg-slate-50 p-3 rounded-lg">
                  <p className="info-label text-xs text-slate-600 mb-1">Date de péremption</p>
                  <p className="info-value font-medium text-sm">{formatDate(product.expiryDate)}</p>
                </div>

                <div className="info-item bg-slate-50 p-3 rounded-lg">
                  <p className="info-label text-xs text-slate-600 mb-1">Date de contrôle</p>
                  <p className="info-value font-medium text-sm">{formatDate(product.controlDate)}</p>
                </div>
              </div>

              {product.isOut && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <p className="text-xs text-orange-700 mb-1">Statut</p>
                  <p className="font-medium text-orange-900">En sortie à {product.outLocation}</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Sorti le {formatDate(product.outDate!)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="size-4 mr-2" />
              Imprimer
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}