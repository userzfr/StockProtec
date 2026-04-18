import { useState, useEffect } from 'react';
import { Bag, OperationalEquipment, User } from '@/app/App';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { BagManager } from './BagManager';
import { OperationalEquipmentManager } from './OperationalEquipmentManager';
import { Package, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/AuthContext';
import { bagsApi, operationalEquipmentApi, logsApi } from '@/app/services/api';

export function OperationalMaterialPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [bags, setBags] = useState<Bag[]>([]);
  const [equipment, setEquipment] = useState<OperationalEquipment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bagsData, equipmentData] = await Promise.all([
        bagsApi.getAll(),
        operationalEquipmentApi.getAll(),
      ]);

      setBags(bagsData);
      setEquipment(equipmentData);
    } catch (error) {
      console.error('Erreur lors du chargement des données opérationnelles :', error);
      toast.error('Impossible de charger les données opérationnelles');
    }
  };

  const handleAddBag = async (bag: Bag) => {
    try {
      await bagsApi.create(bag);
      setBags(prev => [...prev, bag]);
      addLog('CREATE_BAG', `Création du sac "${bag.name}"`);
    } catch (error) {
      console.error('Erreur lors de la création du sac :', error);
      toast.error('Impossible de créer le sac');
    }
  };

  const handleUpdateBag = async (updatedBag: Bag) => {
    try {
      await bagsApi.update(updatedBag.id, updatedBag);
      setBags(prev => prev.map(b => (b.id === updatedBag.id ? updatedBag : b)));
      addLog('UPDATE_BAG', `Modification du sac "${updatedBag.name}"`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du sac :', error);
      toast.error('Impossible de mettre à jour le sac');
    }
  };

  const handleDeleteBag = async (bagId: string) => {
    const bag = bags.find(b => b.id === bagId);
    try {
      await bagsApi.delete(bagId);
      setBags(prev => prev.filter(b => b.id !== bagId));
      if (bag) {
        addLog('DELETE_BAG', `Suppression du sac "${bag.name}"`);
      }
      toast.success('Sac supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du sac :', error);
      toast.error('Impossible de supprimer le sac');
    }
  };

  const handleViewBag = (qrCode: string) => {
    navigate(`/bag/${qrCode}`);
  };

  const handleAddEquipment = async (equip: OperationalEquipment) => {
    try {
      const response = await operationalEquipmentApi.create(equip);
      const createdEquip = response || equip;
      setEquipment(prev => [...prev, createdEquip]);
      addLog('CREATE_EQUIPMENT', `Ajout du matériel "${equip.name}"`);
      toast.success(`Matériel "${equip.name}" ajouté avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du matériel :', error);
      toast.error('Impossible d\'ajouter le matériel. Vérifiez la console pour plus de détails.');
    }
  };

  const handleUpdateEquipment = async (updatedEquip: OperationalEquipment) => {
    try {
      const response = await operationalEquipmentApi.update(updatedEquip.id, updatedEquip);
      const finalEquip = response || updatedEquip;
      setEquipment(prev => prev.map(e => (e.id === updatedEquip.id ? finalEquip : e)));
      addLog('UPDATE_EQUIPMENT', `Modification du matériel "${updatedEquip.name}"`);
      toast.success(`Matériel "${updatedEquip.name}" mis à jour avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du matériel :', error);
      toast.error('Impossible de mettre à jour le matériel. Vérifiez la console pour plus de détails.');
    }
  };

  const handleDeleteEquipment = async (equipId: string) => {
    const equip = equipment.find(e => e.id === equipId);
    try {
      await operationalEquipmentApi.delete(equipId);
      setEquipment(prev => prev.filter(e => e.id !== equipId));
      if (equip) {
        addLog('DELETE_EQUIPMENT', `Suppression du matériel "${equip.name}"`);
      }
      toast.success('Matériel supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du matériel :', error);
      toast.error('Impossible de supprimer le matériel');
    }
  };

  const addLog = async (action: string, details: string) => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      user: currentUser.username,
      details,
    };

    try {
      await logsApi.create(newLog);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du log :', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Matériel opérationnel</h1>
        <p className="text-gray-500">
          Gérez les sacs de secours et le matériel embarqué sur les dispositifs
        </p>
      </div>

      <Tabs defaultValue="bags" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
          <TabsTrigger value="bags" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Sacs de secours
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Matériel embarqué
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bags" className="mt-6">
          <BagManager
            bags={bags}
            onAddBag={handleAddBag}
            onUpdateBag={handleUpdateBag}
            onDeleteBag={handleDeleteBag}
            onViewBag={handleViewBag}
          />
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <OperationalEquipmentManager
            equipment={equipment}
            onAddEquipment={handleAddEquipment}
            onUpdateEquipment={handleUpdateEquipment}
            onDeleteEquipment={handleDeleteEquipment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}