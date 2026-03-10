import { useState } from 'react';
import { OperationalEquipment } from '@/app/App';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Plus, Wrench, Edit, Trash2, Barcode, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { CreateEquipmentDialog } from './CreateEquipmentDialog';
import { EditEquipmentDialog } from './EditEquipmentDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { SimpleBarcodeDialog } from './SimpleBarcodeDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/app/contexts/AuthContext';

interface OperationalEquipmentManagerProps {
  equipment: OperationalEquipment[];
  onAddEquipment: (equipment: OperationalEquipment) => void;
  onUpdateEquipment: (equipment: OperationalEquipment) => void;
  onDeleteEquipment: (equipmentId: string) => void;
}

export function OperationalEquipmentManager({
  equipment,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
}: OperationalEquipmentManagerProps) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser.role === 'admin';
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<OperationalEquipment | null>(null);

  const handleEdit = (equip: OperationalEquipment) => {
    setSelectedEquipment(equip);
    setEditDialogOpen(true);
  };

  const handleDelete = (equip: OperationalEquipment) => {
    setSelectedEquipment(equip);
    setDeleteDialogOpen(true);
  };

  const handleShowBarcode = (equip: OperationalEquipment) => {
    setSelectedEquipment(equip);
    setBarcodeDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEquipment) {
      onDeleteEquipment(selectedEquipment.id);
      setDeleteDialogOpen(false);
      setSelectedEquipment(null);
    }
  };

  const getStatusIcon = (status?: 'ok' | 'defective' | 'missing') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'defective':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Wrench className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: 'ok' | 'defective' | 'missing') => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-500">Opérationnel</Badge>;
      case 'defective':
        return <Badge className="bg-orange-500">Défectueux</Badge>;
      case 'missing':
        return <Badge className="bg-red-500">Manquant</Badge>;
      default:
        return <Badge variant="outline">Non vérifié</Badge>;
    }
  };

  const getTypeLabel = (type: OperationalEquipment['type']) => {
    const labels = {
      DSA: 'DSA',
      ASPIRATEUR: 'Aspirateur de mucosité',
      OXYGENE: 'Bouteille d\'oxygène',
      ELECTRONIQUE: 'Matériel électronique',
      AUTRE: 'Autre',
    };
    return labels[type];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold">Matériel embarqué</h2>
          <p className="text-sm text-gray-500">
            Matériel opérationnel qui sort sur les dispositifs (DSA, aspirateurs, oxygène, etc.)
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter du matériel
          </Button>
        )}
      </div>

      {equipment.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Aucun matériel enregistré</p>
            {isAdmin && (
              <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter votre premier matériel
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((equip) => (
            <Card key={equip.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(equip.status)}
                    <CardTitle className="text-lg">{equip.name}</CardTitle>
                  </div>
                  {getStatusBadge(equip.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Type :</span>
                  <span className="font-medium">{getTypeLabel(equip.type)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Quantité :</span>
                  <span className="font-medium">{equip.quantity}</span>
                </div>
                {equip.lastControlDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Dernier contrôle :</span>
                    <span className="font-medium">
                      {format(new Date(equip.lastControlDate), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                )}
                {equip.controlDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Prochain contrôle :</span>
                    <span className="font-medium">
                      {format(new Date(equip.controlDate), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                )}
                {equip.notes && (
                  <div className="text-sm">
                    <p className="text-gray-500">Notes :</p>
                    <p className="text-gray-700 italic">{equip.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleShowBarcode(equip)}
                  >
                    <Barcode className="w-4 h-4 mr-1" />
                    Code-barres
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(equip)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(equip)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateEquipmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateEquipment={onAddEquipment}
      />

      {selectedEquipment && (
        <>
          <EditEquipmentDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            equipment={selectedEquipment}
            onUpdateEquipment={onUpdateEquipment}
          />
          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Supprimer le matériel"
            description={`Êtes-vous sûr de vouloir supprimer "${selectedEquipment.name}" ? Cette action est irréversible.`}
            onConfirm={confirmDelete}
          />
          <SimpleBarcodeDialog
            open={barcodeDialogOpen}
            onOpenChange={setBarcodeDialogOpen}
            barcode={selectedEquipment.barcode}
            title={selectedEquipment.name}
          />
        </>
      )}
    </div>
  );
}