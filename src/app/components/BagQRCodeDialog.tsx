import { Bag } from '@/app/App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface BagQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bag: Bag;
}

export function BagQRCodeDialog({ open, onOpenChange, bag }: BagQRCodeDialogProps) {
  const bagUrl = `${window.location.origin}/bag/${bag.qrCode}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bagUrl);
    toast.success('URL copiée dans le presse-papiers');
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg') as HTMLElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-code-${bag.name.replace(/\s+/g, '-')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast.success('QR Code téléchargé');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleOpenUrl = () => {
    window.open(bagUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>QR Code - {bag.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <QRCodeSVG
              id="qr-code-svg"
              value={bagUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Informations */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium">URL du sac :</p>
            <p className="text-xs text-gray-600 break-all font-mono bg-white p-2 rounded">
              {bagUrl}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Code QR : <span className="font-mono">{bag.qrCode}</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Instructions :</p>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Téléchargez le QR code</li>
              <li>Imprimez-le et fixez-le sur le sac</li>
              <li>Scannez-le avec un smartphone pour accéder au contenu</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={handleDownloadQR} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Télécharger le QR Code
            </Button>
            <Button onClick={handleCopyUrl} variant="outline" className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              Copier l'URL
            </Button>
            <Button onClick={handleOpenUrl} variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir la page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}