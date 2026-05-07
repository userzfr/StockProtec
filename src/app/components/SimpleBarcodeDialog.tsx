import { useRef } from 'react';
import Barcode from 'react-barcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { QrCode, Printer } from 'lucide-react';

interface SimpleBarcodeDialogProps {
  barcode: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimpleBarcodeDialog({ barcode, title, open, onOpenChange }: SimpleBarcodeDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const doc = printWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    doc.close();

    const svg = printContent.querySelector('svg');
    const barcodeSvg = svg ? svg.cloneNode(true) : null;

    const head = doc.head;
    const body = doc.body;

    const titleEl = doc.createElement('title');
    titleEl.textContent = `Impression - ${title}`;
    head.appendChild(titleEl);

    const styleEl = doc.createElement('style');
    styleEl.textContent = `
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
        }
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
        }
        svg {
          max-width: 100%;
          height: auto;
        }
      }
    `;
    head.appendChild(styleEl);

    const section = doc.createElement('div');
    section.className = 'barcode-section';

    const heading = doc.createElement('h1');
    heading.textContent = title;
    section.appendChild(heading);

    if (barcodeSvg) {
      section.appendChild(barcodeSvg);
    }

    body.appendChild(section);

    const scriptEl = doc.createElement('script');
    scriptEl.textContent = `
      window.onload = function() {
        window.print();
        window.close();
      };
    `;
    body.appendChild(scriptEl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5 text-blue-600" />
            Code-barres
          </DialogTitle>
          <DialogDescription>
            Visualisez et imprimez le code-barres pour {title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div ref={printRef} className="barcode-section flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-lg border-2 border-blue-200">
            <h1 className="text-xl font-bold mb-4 text-center">{title}</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <Barcode 
                value={barcode}
                format="CODE128"
                width={2}
                height={80}
                displayValue={true}
                fontSize={16}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="size-4 mr-2" />
              Imprimer
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}