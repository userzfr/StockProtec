import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Product, User, InspectionReport } from '@/app/App';
import { toast } from 'sonner';
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, PenTool } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import { inspectionReportsApi } from '@/app/services/api';

interface InspectionDialogProps {
  products: Product[];
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onAddLog: (action: string, user: string, details: string) => void;
  onUpdateProducts?: (productIds: string[], newControlDate: string) => void;
}

export function InspectionDialog({ products, currentUser, isOpen, onClose, onAddLog, onUpdateProducts }: InspectionDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [inspectionData, setInspectionData] = useState<Record<string, { status: 'ok' | 'defective' | 'missing', notes: string }>>({});
  const [signature, setSignature] = useState('');
  const [conclusion, setConclusion] = useState('');

  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoryProducts = selectedCategory ? products.filter(p => p.category === selectedCategory) : [];

  const handleStatusChange = (productId: string, status: 'ok' | 'defective' | 'missing') => {
    setInspectionData(prev => ({
      ...prev,
      [productId]: { ...prev[productId], status }
    }));
  };

  const handleNotesChange = (productId: string, notes: string) => {
    setInspectionData(prev => ({
      ...prev,
      [productId]: { ...prev[productId], notes }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }

    if (!signature.trim()) {
      toast.error('Veuillez signer le procès-verbal');
      return;
    }

    // Check if all products have been inspected
    const uninspectedProducts = categoryProducts.filter(p => !inspectionData[p.id]?.status);
    if (uninspectedProducts.length > 0) {
      toast.error(`${uninspectedProducts.length} produit(s) non inspecté(s)`);
      return;
    }

    const report: InspectionReport = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      inspector: currentUser.username,
      category: selectedCategory,
      products: categoryProducts.map(p => ({
        id: p.id,
        name: p.name,
        status: inspectionData[p.id].status,
        notes: inspectionData[p.id].notes
      })),
      signature,
      conclusion
    };

    // Save report to the backend
    try {
      await inspectionReportsApi.create(report);

      // Add log
      const okCount = Object.values(inspectionData).filter(d => d.status === 'ok').length;
      const defectiveCount = Object.values(inspectionData).filter(d => d.status === 'defective').length;
      const missingCount = Object.values(inspectionData).filter(d => d.status === 'missing').length;
      
      onAddLog(
        'INSPECTION', 
        currentUser.username, 
        `Contrôle de ${selectedCategory} - OK: ${okCount}, Défectueux: ${defectiveCount}, Manquant: ${missingCount}`
      );

      toast.success('Procès-verbal de contrôle enregistré');

      // Reset form
      setSelectedCategory('');
      setInspectionData({});
      setSignature('');
      setConclusion('');
      onClose();

      // Update products control date
      if (onUpdateProducts) {
        const productIds = categoryProducts.map(p => p.id);
        // Set next control date to 3 months from now
        const nextControlDate = new Date();
        nextControlDate.setMonth(nextControlDate.getMonth() + 3);
        onUpdateProducts(productIds, nextControlDate.toISOString());
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du rapport d\'inspection :', error);
      toast.error('Impossible d\'enregistrer le rapport d\'inspection');
    }

    // Update products control date
    if (onUpdateProducts) {
      const productIds = categoryProducts.map(p => p.id);
      // Set next control date to 3 months from now
      const nextControlDate = new Date();
      nextControlDate.setMonth(nextControlDate.getMonth() + 3);
      onUpdateProducts(productIds, nextControlDate.toISOString());
    }
  };

  const getStatusBadge = (status: 'ok' | 'defective' | 'missing' | undefined) => {
    if (!status) {
      return <Badge variant="secondary">Non vérifié</Badge>;
    }
    
    switch (status) {
      case 'ok':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="size-3 mr-1" />OK</Badge>;
      case 'defective':
        return <Badge variant="destructive"><XCircle className="size-3 mr-1" />Défectueux</Badge>;
      case 'missing':
        return <Badge variant="warning"><AlertCircle className="size-3 mr-1" />Manquant</Badge>;
    }
  };

  const stats = {
    total: categoryProducts.length,
    ok: Object.values(inspectionData).filter(d => d.status === 'ok').length,
    defective: Object.values(inspectionData).filter(d => d.status === 'defective').length,
    missing: Object.values(inspectionData).filter(d => d.status === 'missing').length,
    uninspected: categoryProducts.filter(p => !inspectionData[p.id]?.status).length
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ClipboardCheck className="size-6 text-blue-600" />
            Procès-Verbal de Contrôle du Matériel
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto space-y-4">
          {/* Header Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Inspecteur</p>
                  <p className="font-semibold text-blue-900">{currentUser.username}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="font-semibold text-blue-900">
                    {new Date().toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Protection Civile</p>
                  <p className="font-semibold text-blue-900">Loire - Saint-Étienne</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie à contrôler *</Label>
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              setInspectionData({});
            }}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category} ({products.filter(p => p.category === category).length} produits)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <>
              {/* Progress Stats */}
              <div className="grid grid-cols-5 gap-3">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-slate-600">Total</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.ok}</p>
                    <p className="text-xs text-slate-600">OK</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.defective}</p>
                    <p className="text-xs text-slate-600">Défectueux</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">{stats.missing}</p>
                    <p className="text-xs text-slate-600">Manquant</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-slate-600">{stats.uninspected}</p>
                    <p className="text-xs text-slate-600">Non vérifié</p>
                  </CardContent>
                </Card>
              </div>

              {/* Products Inspection List */}
              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-slate-50">
                {categoryProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{product.name}</p>
                            {getStatusBadge(inspectionData[product.id]?.status)}
                          </div>
                          <p className="text-sm text-slate-600">Code: {product.barcode} | Lot: {product.lot} | Qté: {product.quantity}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={inspectionData[product.id]?.status === 'ok' ? 'default' : 'outline'}
                            onClick={() => handleStatusChange(product.id, 'ok')}
                            className={inspectionData[product.id]?.status === 'ok' ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            <CheckCircle2 className="size-4 mr-1" />
                            OK
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={inspectionData[product.id]?.status === 'defective' ? 'destructive' : 'outline'}
                            onClick={() => handleStatusChange(product.id, 'defective')}
                          >
                            <XCircle className="size-4 mr-1" />
                            Défectueux
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={inspectionData[product.id]?.status === 'missing' ? 'default' : 'outline'}
                            onClick={() => handleStatusChange(product.id, 'missing')}
                            className={inspectionData[product.id]?.status === 'missing' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                          >
                            <AlertCircle className="size-4 mr-1" />
                            Manquant
                          </Button>
                        </div>
                      </div>
                      
                      {inspectionData[product.id]?.status && inspectionData[product.id].status !== 'ok' && (
                        <div className="mt-3">
                          <Textarea
                            placeholder="Notes et observations..."
                            value={inspectionData[product.id]?.notes || ''}
                            onChange={(e) => handleNotesChange(product.id, e.target.value)}
                            className="text-sm"
                            rows={2}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Conclusion */}
              <div className="space-y-2">
                <Label htmlFor="conclusion">Conclusion générale</Label>
                <Textarea
                  id="conclusion"
                  placeholder="Observations générales sur l'état du matériel contrôlé..."
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Signature */}
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-900">
                      <PenTool className="size-5" />
                      <Label htmlFor="signature" className="text-base font-semibold">
                        Signature du contrôleur *
                      </Label>
                    </div>
                    <Input
                      id="signature"
                      placeholder="Entrez votre nom complet pour valider le procès-verbal"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="bg-white border-amber-300"
                      required
                    />
                    <p className="text-xs text-amber-800">
                      En signant ce document, j'atteste avoir vérifié l'état et la présence du matériel 
                      de la catégorie {selectedCategory} et certifie l'exactitude des informations reportées.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedCategory || stats.uninspected > 0 || !signature.trim()}
            >
              <ClipboardCheck className="size-4 mr-2" />
              Valider le Procès-Verbal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}