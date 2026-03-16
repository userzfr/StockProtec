import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LoginPage } from '@/app/components/LoginPage';
import { Toaster } from '@/app/components/ui/sonner';
import { toast } from 'sonner';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { usersApi, bagsApi, operationalEquipmentApi, pharmacyProductsApi, logsApi } from '@/app/services/api';

// Nouvelles catégories principales
export type MainCategory = 'SAC' | 'KIT' | 'APPAREIL' | 'AUTRE';
export type SubCategory = 'LOT A' | 'LOT B' | 'LOT C' | string;

// Nouvelle structure pour les sacs hiérarchiques
export interface BagPocket {
  id: string;
  name: string;
  color?: string;
  items: BagPocketItem[];
  order: number;
}

export interface BagPocketItem {
  id: string;
  name: string;
  expectedQuantity: number;
  productId?: string; // Lien avec produit pharmacie
  checkType: 'button' | 'quantity'; // Type de contrôle
  barcode?: string;
  notes?: string;
}

export interface Bag {
  id: string;
  name: string;
  qrCode: string; // QR code unique
  pockets: BagPocket[];
  createdAt: string;
  lastControlDate?: string;
  status?: 'ok' | 'warning' | 'critical';
  deploymentStatus?: 'present' | 'deployed'; // Nouveau : statut de déploiement
  deploymentLocation?: string; // Nom du poste de secours
  deploymentDate?: string; // Date de déploiement
}

export interface OperationalEquipment {
  id: string;
  name: string;
  barcode: string;
  type: 'DSA' | 'ASPIRATEUR' | 'OXYGENE' | 'ELECTRONIQUE' | 'AUTRE';
  quantity: number;
  lastControlDate?: string;
  controlDate?: string;
  status?: 'ok' | 'defective' | 'missing';
  notes?: string;
}

export interface ControlHistory {
  id: string;
  bagId: string;
  bagName: string;
  timestamp: string;
  user: string;
  controlType: 'quick' | 'departure' | 'return';
  results: ControlResult[];
  signature?: string;
  notes?: string;
  deploymentLocation?: string; // Nom du poste de secours (pour departure)
}

export interface ControlResult {
  itemId: string;
  itemName: string;
  pocketName: string;
  expectedQuantity: number;
  actualQuantity?: number;
  status?: 'present' | 'missing' | 'damaged';
  notes?: string;
}

export interface PharmacyProduct {
  id: string;
  barcode: string;
  name: string;
  category: string;
  lot: string;
  expiryDate: string;
  quantity: number;
  minStock?: number;
  location?: string;
  supplier?: string;
  createdAt: string;
}

export interface BagItem {
  id: string;
  barcode: string;
  name: string;
  quantity: number;
  expiryDate?: string;
  controlDate?: string;
  checked?: boolean; // Pour le système de checklist
}

export interface CustomCategory {
  id: string;
  mainCategory: MainCategory;
  categoryName: string;
  subCategory?: SubCategory;
  barcode: string; // Code-barres unique de la catégorie/sac
  items: BagItem[];
  createdAt: string;
  customFields?: Record<string, any>; // Champs personnalisés
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  lot: string;
  expiryDate: string;
  controlDate: string;
  quantity: number;
  category: string;
  mainCategory?: MainCategory;
  isOut?: boolean;
  outLocation?: string;
  outDate?: string;
  bagBarcode?: string; // Code-barres du sac pour les LOTs
  customCategoryId?: string; // Référence à une catégorie personnalisée
  isIndividualStock?: boolean; // Pour les articles individuels en stockage
}

export interface User {
  id: string;
  username: string;
  email?: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
  passwordResetRequested?: boolean;
  passwordResetDate?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface InspectionReport {
  id: string;
  timestamp: string;
  inspector: string;
  category: string;
  products: {
    id: string;
    name: string;
    status: 'ok' | 'defective' | 'missing';
    notes?: string;
  }[];
  signature: string;
  conclusion: string;
}

export interface BugReport {
  id: string;
  timestamp: string;
  user: string;
  page: string;
  description: string;
  userAgent: string;
  status: 'new' | 'in-progress' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize default users if not exists
        const existingUsers = await usersApi.getAll();
        if (existingUsers.length === 0) {
          const defaultUsers = [
            {
              id: '1',
              nom: 'admin',
              password: 'admin123',
              role: 'admin',
            },
            {
              id: '2',
              nom: 'user',
              password: 'user123',
              role: 'user',
            }
          ];
          for (const user of defaultUsers) {
            await usersApi.create(user);
          }
        }

        // Initialize example bags if not exists
        const existingBags = await bagsApi.getAll();
        if (existingBags.length === 0) {
          const exampleBags: Bag[] = [
            {
              id: '1',
              name: 'Sac de Premiers Secours PSE1',
              qrCode: 'BAG-PSE1-001',
              deploymentStatus: 'present',
          createdAt: new Date().toISOString(),
          pockets: [
            {
              id: 'p1',
              name: 'Poche principale',
              color: '#3b82f6',
              order: 1,
              items: [
                {
                  id: 'i1',
                  name: 'Pansements compressifs',
                  expectedQuantity: 10,
                  checkType: 'quantity',
                },
                {
                  id: 'i2',
                  name: 'Compresses stériles',
                  expectedQuantity: 20,
                  checkType: 'quantity',
                },
                {
                  id: 'i3',
                  name: 'Bandes de crêpe',
                  expectedQuantity: 5,
                  checkType: 'quantity',
                },
                {
                  id: 'i4',
                  name: 'Couverture de survie',
                  expectedQuantity: 2,
                  checkType: 'button',
                },
              ],
            },
            {
              id: 'p2',
              name: 'Poche extérieure',
              color: '#ef4444',
              order: 2,
              items: [
                {
                  id: 'i5',
                  name: 'Paire de gants (L)',
                  expectedQuantity: 10,
                  checkType: 'quantity',
                },
                {
                  id: 'i6',
                  name: 'Masque de protection',
                  expectedQuantity: 5,
                  checkType: 'quantity',
                },
                {
                  id: 'i7',
                  name: 'Ciseaux',
                  expectedQuantity: 1,
                  checkType: 'button',
                },
              ],
            },
          ],
        },
        {
          id: '2',
          name: 'Sac Intervention Urbaine',
          qrCode: 'BAG-URB-001',
          deploymentStatus: 'deployed',
          deploymentLocation: 'Stade Geoffroy-Guichard',
          deploymentDate: new Date(Date.now() - 3600000 * 2).toISOString(),
          createdAt: new Date().toISOString(),
          status: 'warning',
          lastControlDate: new Date(Date.now() - 3600000 * 2).toISOString(),
          pockets: [
            {
              id: 'p3',
              name: 'Matériel d\'immobilisation',
              color: '#10b981',
              order: 1,
              items: [
                {
                  id: 'i8',
                  name: 'Collier cervical adulte',
                  expectedQuantity: 1,
                  checkType: 'button',
                },
                {
                  id: 'i9',
                  name: 'Attelles modulables',
                  expectedQuantity: 2,
                  checkType: 'quantity',
                },
              ],
            },
            {
              id: 'p4',
              name: 'Pharmacie d\'urgence',
              color: '#f59e0b',
              order: 2,
              items: [
                {
                  id: 'i10',
                  name: 'Solution hydroalcoolique',
                  expectedQuantity: 2,
                  checkType: 'quantity',
                },
                {
                  id: 'i11',
                  name: 'Pansements adhésifs',
                  expectedQuantity: 15,
                  checkType: 'quantity',
                },
              ],
            },
          ],
        },
        {
          id: '3',
          name: 'Sac Matériel de Réanimation',
          qrCode: 'BAG-REA-001',
          deploymentStatus: 'present',
          createdAt: new Date().toISOString(),
          status: 'ok',
          lastControlDate: new Date(Date.now() - 86400000).toISOString(),
          pockets: [
            {
              id: 'p5',
              name: 'Voies aériennes',
              color: '#8b5cf6',
              order: 1,
              items: [
                {
                  id: 'i12',
                  name: 'Canules de Guedel (set)',
                  expectedQuantity: 1,
                  checkType: 'button',
                },
                {
                  id: 'i13',
                  name: 'Masque à oxygène',
                  expectedQuantity: 3,
                  checkType: 'quantity',
                },
                {
                  id: 'i14',
                  name: 'Insufflateur manuel BAVU',
                  expectedQuantity: 1,
                  checkType: 'button',
                },
              ],
            },
          ],
        },
      ];
          for (const bag of exampleBags) {
            await bagsApi.create(bag);
          }
        }

        // Initialize example equipment if not exists
        const existingEquipment = await operationalEquipmentApi.getAll();
        if (existingEquipment.length === 0) {
          const exampleEquipment: OperationalEquipment[] = [
            {
              id: '1',
              name: 'Défibrillateur Automatique DSA',
              barcode: 'DSA-001',
              type: 'DSA',
              quantity: 2,
              status: 'ok',
              lastControlDate: new Date(Date.now() - 604800000).toISOString(),
            },
            {
              id: '2',
              name: 'Aspirateur de mucosités électrique',
              barcode: 'ASP-001',
              type: 'ASPIRATEUR',
              quantity: 1,
              status: 'ok',
              lastControlDate: new Date(Date.now() - 1209600000).toISOString(),
            },
            {
              id: '3',
              name: 'Bouteille O2 5L avec manodétendeur',
              barcode: 'O2-001',
              type: 'OXYGENE',
              quantity: 4,
              status: 'ok',
              lastControlDate: new Date(Date.now() - 259200000).toISOString(),
            },
          ];
          for (const equipment of exampleEquipment) {
            await operationalEquipmentApi.create(equipment);
          }
        }

        // Initialize example pharmacy products if not exists
        const existingPharmacyProducts = await pharmacyProductsApi.getAll();
        if (existingPharmacyProducts.length === 0) {
          const examplePharmacyProducts: PharmacyProduct[] = [
            {
              id: '1',
              barcode: 'PHARM-001',
              name: 'Paracétamol 500mg',
              category: 'Antalgiques',
          lot: 'LOT2024-A123',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          quantity: 150,
          minStock: 50,
          location: 'Armoire A - Étagère 1',
          supplier: 'Pharma Distribution',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          barcode: 'PHARM-002',
          name: 'Compresses stériles 10x10cm',
          category: 'Pansements',
          lot: 'LOT2024-B456',
          expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
          quantity: 200,
          minStock: 100,
          location: 'Armoire B - Étagère 2',
          supplier: 'Médical Supply',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          barcode: 'PHARM-003',
          name: 'Sérum physiologique 500ml',
          category: 'Solutions',
          lot: 'LOT2024-C789',
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          quantity: 35,
          minStock: 50,
          location: 'Armoire A - Étagère 3',
          supplier: 'Pharma Distribution',
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          barcode: 'PHARM-004',
          name: 'Bétadine solution 125ml',
          category: 'Antiseptiques',
          lot: 'LOT2024-D012',
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          quantity: 25,
          minStock: 30,
          location: 'Armoire B - Étagère 1',
          supplier: 'Médical Supply',
          createdAt: new Date().toISOString(),
        },
        {
          id: '5',
          barcode: 'PHARM-005',
          name: 'Gants d\'examen nitrile (boîte 100)',
          category: 'Protection individuelle',
          lot: 'LOT2024-E345',
          expiryDate: new Date(Date.now() + 1095 * 24 * 60 * 60 * 1000).toISOString(),
          quantity: 45,
          minStock: 20,
          location: 'Armoire C - Étagère 1',
          supplier: 'Pharma Distribution',
          createdAt: new Date().toISOString(),
        },
        {
          id: '6',
          barcode: 'PHARM-006',
          name: 'Pansement adhésif stérile 10x15cm',
          category: 'Pansements',
          lot: 'LOT2024-F678',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          quantity: 15,
          minStock: 40,
          location: 'Armoire B - Étagère 2',
          supplier: 'Médical Supply',
          createdAt: new Date().toISOString(),
        },
        {
          id: '7',
          barcode: 'PHARM-007',
          name: 'Solution hydroalcoolique 500ml',
          category: 'Antiseptiques',
          lot: 'LOT2024-G901',
          expiryDate: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000).toISOString(),
          quantity: 80,
          minStock: 50,
          location: 'Armoire A - Étagère 2',
          supplier: 'Pharma Distribution',
          createdAt: new Date().toISOString(),
        },
      ];
          for (const product of examplePharmacyProducts) {
            await pharmacyProductsApi.create(product);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des données:', error);
        toast.error('Erreur lors de l\'initialisation des données');
      }
    };

    initializeData();

    // Check if user is already logged in
    const savedAuth = localStorage.getItem('authState');
    if (savedAuth) {
      setAuthState(JSON.parse(savedAuth));
    }
  }, []);

  const handleLogin = async (user: User) => {
    const newAuthState = {
      isAuthenticated: true,
      user
    };
    setAuthState(newAuthState);
    localStorage.setItem('authState', JSON.stringify(newAuthState));
    
    // Add login log
    try {
      await logsApi.create({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'LOGIN',
        user: user.username,
        details: 'Connexion réussie',
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du log de connexion:', error);
    }
  };

  const handleLogout = async () => {
    if (authState.user) {
      try {
        await logsApi.create({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          action: 'LOGOUT',
          user: authState.user.username,
          details: 'Déconnexion',
        });
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du log de déconnexion:', error);
      }
    }
    localStorage.removeItem('authState');
    setAuthState({ isAuthenticated: false, user: null });
  };

  if (!authState.isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <AuthProvider user={authState.user!} onLogout={handleLogout}>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster />
    </>
  );
}