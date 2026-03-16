/**
 * Génère un code unique (QR code ou code-barres)
 * Vérifie qu'il n'existe pas déjà dans la base de données
 */

export function generateUniqueCode(type: 'qr' | 'barcode', existingCodes: string[]): string {
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    if (type === 'qr') {
      // Génère un QR code alphanumérique de 12 caractères
      code = generateAlphanumericCode(12);
    } else {
      // Génère un code-barres numérique de 13 chiffres (EAN-13 format)
      code = generateNumericCode(13);
    }
    
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Impossible de générer un code unique après plusieurs tentatives');
    }
  } while (existingCodes.includes(code));

  return code;
}

function generateAlphanumericCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateNumericCode(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/**
 * Récupère tous les codes existants dans la base de données
 */
import { bagsApi, pharmacyProductsApi, operationalEquipmentApi } from '../services/api';

export async function getAllExistingCodes(): Promise<string[]> {
  const codes: string[] = [];

  try {
    // Récupère les QR codes des sacs via API
    const bags = await bagsApi.getAll();
    bags.forEach((bag: any) => {
      if (bag.qrCode) codes.push(bag.qrCode);
    });

    // Récupère les codes-barres des produits de la pharmacie via API
    const pharmacyProducts = await pharmacyProductsApi.getAll();
    pharmacyProducts.forEach((product: any) => {
      if (product.barcode) codes.push(product.barcode);
    });

    // Récupère les codes-barres du matériel opérationnel via API
    const operationalEquipment = await operationalEquipmentApi.getAll();
    operationalEquipment.forEach((equipment: any) => {
      if (equipment.barcode) codes.push(equipment.barcode);
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des codes existants:', error);
  }

  return codes;
}

/**
 * Génère un nouvel QR code unique
 */
export async function generateUniqueQRCode(): Promise<string> {
  const existingCodes = await getAllExistingCodes();
  return generateUniqueCode('qr', existingCodes);
}

/**
 * Génère un nouveau code-barres unique
 */
export async function generateUniqueBarcode(): Promise<string> {
  const existingCodes = await getAllExistingCodes();
  return generateUniqueCode('barcode', existingCodes);
}
