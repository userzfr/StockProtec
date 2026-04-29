import { useRef } from 'react';
import Barcode from 'react-barcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Product } from '@/app/App';
import { Package, QrCode, Printer } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

interface BagBarcodeDialogProps {
  bagBarcode: string;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export function BagBarcodeDialog({ bagBarcode, products, isOpen, onClose }: BagBarcodeDialogProps) {
  const bagProducts = products.filter(p => p.bagBarcode === bagBarcode);
  const printRef = useRef<HTMLDivElement>(null);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Impression - Sac ${bagBarcode}</title>
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
              .barcode-section {
                text-align: center;
                padding: 20px;
                border: 2px solid #000;
                margin-bottom: 20px;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 10px;
              }
              svg {
                max-width: 100%;
                height: auto;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
                font-size: 12px;
              }
              th {
                background-color: #f3f4f6;
                font-weight: bold;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5 text-blue-600" />
            Contenu du sac - Code-barres: {bagBarcode}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          <div ref={printRef}>
            {/* Bag Info with Barcode */}
            <div className="barcode-section flex flex-col items-center justify-between bg-gradient-to-r from-blue-50 to-slate-50 p-6 rounded-lg border-2 border-blue-200">
              <h1 className="text-xl font-bold mb-4">Sac {bagBarcode}</h1>
              
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <Barcode 
                  value={bagBarcode}
                  format="CODE128"
                  width={2}
                  height={80}
                  displayValue={true}
                  fontSize={16}
                />
              </div>

              <Badge variant="default" className="bg-blue-600 text-lg px-4 py-2">
                {bagProducts.length} produit{bagProducts.length > 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Products Table */}
            <div className="border rounded-lg overflow-hidden mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Code-barres</TableHead>
                    <TableHead>Nom du produit</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Péremption</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bagProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        Aucun produit dans ce sac
                      </TableCell>
                    </TableRow>
                  ) : (
                    bagProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">{product.lot}</TableCell>
                        <TableCell className="font-semibold text-blue-600">{product.quantity}</TableCell>
                        <TableCell className="text-sm">{formatDate(product.expiryDate)}</TableCell>
                        <TableCell>
                          {product.isOut ? (
                            <Badge variant="warning">En sortie</Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-600">Disponible</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="size-4 mr-2" />
            Imprimer
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}