import { useState } from 'react';
import { Bag } from '@/app/App';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Plus, Package, QrCode, Edit, Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { CreateBagDialog } from './CreateBagDialog';
import { BagQRCodeDialog } from './BagQRCodeDialog';
import { EditBagDialog } from './EditBagDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/app/contexts/AuthContext';

interface BagManagerProps {
  bags: Bag[];
  onAddBag: (bag: Bag) => void;
  onUpdateBag: (bag: Bag) => void;
  onDeleteBag: (bagId: string) => void;
  onViewBag: (qrCode: string) => void;
}

export function BagManager({ bags, onAddBag, onUpdateBag, onDeleteBag, onViewBag }: BagManagerProps) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser.role === 'admin';
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBag, setSelectedBag] = useState<Bag | null>(null);

  const handleShowQR = (bag: Bag) => {
    setSelectedBag(bag);
    setQrDialogOpen(true);
  };

  const handleEdit = (bag: Bag) => {
    setSelectedBag(bag);
    setEditDialogOpen(true);
  };

  const handleDelete = (bag: Bag) => {
    setSelectedBag(bag);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBag) {
      onDeleteBag(selectedBag.id);
      setDeleteDialogOpen(false);
      setSelectedBag(null);
    }
  };

  const getStatusIcon = (status?: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-500">OK</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Attention</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Critique</Badge>;
      default:
        return <Badge variant="outline">Non contrôlé</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold">Sacs de secours</h2>
          <p className="text-sm text-gray-500">Gérez les sacs de secours et leur contenu</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Créer un sac
          </Button>
        )}
      </div>

      {bags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Aucun sac créé</p>
            {isAdmin && (
              <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Créer votre premier sac
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bags.map((bag) => (
            <Card key={bag.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewBag(bag.qrCode)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(bag.status)}
                    <CardTitle className="text-lg">{bag.name}</CardTitle>
                  </div>
                  {getStatusBadge(bag.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Poches :</span>
                  <span className="font-medium">{bag.pockets.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Articles :</span>
                  <span className="font-medium">
                    {bag.pockets.reduce((acc, pocket) => acc + pocket.items.length, 0)}
                  </span>
                </div>
                {bag.deploymentStatus === 'deployed' && bag.deploymentLocation && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Déployé à :</span>
                    <span className="font-medium text-blue-600">{bag.deploymentLocation}</span>
                  </div>
                )}
                {bag.lastControlDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Dernier contrôle :</span>
                    <span className="font-medium">
                      {format(new Date(bag.lastControlDate), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleShowQR(bag)}
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    QR Code
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(bag)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(bag)}
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

      <CreateBagDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateBag={onAddBag}
      />

      {selectedBag && (
        <>
          <BagQRCodeDialog
            open={qrDialogOpen}
            onOpenChange={setQrDialogOpen}
            bag={selectedBag}
          />
          <EditBagDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            bag={selectedBag}
            onUpdateBag={onUpdateBag}
          />
          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Supprimer le sac"
            description={`Êtes-vous sûr de vouloir supprimer le sac "${selectedBag.name}" ? Cette action est irréversible.`}
            onConfirm={confirmDelete}
          />
        </>
      )}
    </div>
  );
}