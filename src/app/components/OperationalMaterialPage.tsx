import { useState, useEffect } from 'react';
import { Bag, OperationalEquipment, User } from '@/app/App';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { BagManager } from './BagManager';
import { OperationalEquipmentManager } from './OperationalEquipmentManager';
import { Package, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/AuthContext';

export function OperationalMaterialPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [bags, setBags] = useState<Bag[]>([]);
  const [equipment, setEquipment] = useState<OperationalEquipment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Charger les sacs
    const savedBags = localStorage.getItem('bags');
    if (savedBags) {
      setBags(JSON.parse(savedBags));
    }

    // Charger le matériel opérationnel
    const savedEquipment = localStorage.getItem('operationalEquipment');
    if (savedEquipment) {
      setEquipment(JSON.parse(savedEquipment));
    }
  };

  const handleAddBag = (bag: Bag) => {
    const updatedBags = [...bags, bag];
    setBags(updatedBags);
    localStorage.setItem('bags', JSON.stringify(updatedBags));
    addLog('CREATE_BAG', `Création du sac "${bag.name}"`);
  };

  const handleUpdateBag = (updatedBag: Bag) => {
    const updatedBags = bags.map(b => b.id === updatedBag.id ? updatedBag : b);
    setBags(updatedBags);
    localStorage.setItem('bags', JSON.stringify(updatedBags));
    addLog('UPDATE_BAG', `Modification du sac "${updatedBag.name}"`);
  };

  const handleDeleteBag = (bagId: string) => {
    const bag = bags.find(b => b.id === bagId);
    const updatedBags = bags.filter(b => b.id !== bagId);
    setBags(updatedBags);
    localStorage.setItem('bags', JSON.stringify(updatedBags));
    if (bag) {
      addLog('DELETE_BAG', `Suppression du sac "${bag.name}"`);
    }
    toast.success('Sac supprimé avec succès');
  };

  const handleViewBag = (qrCode: string) => {
    navigate(`/bag/${qrCode}`);
  };

  const handleAddEquipment = (equip: OperationalEquipment) => {
    const updatedEquipment = [...equipment, equip];
    setEquipment(updatedEquipment);
    localStorage.setItem('operationalEquipment', JSON.stringify(updatedEquipment));
    addLog('CREATE_EQUIPMENT', `Ajout du matériel "${equip.name}"`);
  };

  const handleUpdateEquipment = (updatedEquip: OperationalEquipment) => {
    const updatedEquipment = equipment.map(e => e.id === updatedEquip.id ? updatedEquip : e);
    setEquipment(updatedEquipment);
    localStorage.setItem('operationalEquipment', JSON.stringify(updatedEquipment));
    addLog('UPDATE_EQUIPMENT', `Modification du matériel "${updatedEquip.name}"`);
  };

  const handleDeleteEquipment = (equipId: string) => {
    const equip = equipment.find(e => e.id === equipId);
    const updatedEquipment = equipment.filter(e => e.id !== equipId);
    setEquipment(updatedEquipment);
    localStorage.setItem('operationalEquipment', JSON.stringify(updatedEquipment));
    if (equip) {
      addLog('DELETE_EQUIPMENT', `Suppression du matériel "${equip.name}"`);
    }
    toast.success('Matériel supprimé avec succès');
  };

  const addLog = (action: string, details: string) => {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      user: currentUser.username,
      details,
    };
    logs.unshift(newLog);
    if (logs.length > 100) logs.pop();
    localStorage.setItem('logs', JSON.stringify(logs));
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