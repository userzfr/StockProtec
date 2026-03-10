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
export function getAllExistingCodes(): string[] {
  const codes: string[] = [];
  
  // Récupère les QR codes des sacs
  const bags = JSON.parse(localStorage.getItem('bags') || '[]');
  bags.forEach((bag: any) => {
    if (bag.qrCode) codes.push(bag.qrCode);
  });
  
  // Récupère les codes-barres des produits de la pharmacie
  const pharmacyProducts = JSON.parse(localStorage.getItem('pharmacyProducts') || '[]');
  pharmacyProducts.forEach((product: any) => {
    if (product.barcode) codes.push(product.barcode);
  });
  
  // Récupère les codes-barres du matériel opérationnel
  const operationalEquipment = JSON.parse(localStorage.getItem('operationalEquipment') || '[]');
  operationalEquipment.forEach((equipment: any) => {
    if (equipment.barcode) codes.push(equipment.barcode);
  });
  
  // Récupère les codes-barres des anciens produits (rétrocompatibilité)
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  products.forEach((product: any) => {
    if (product.barcode) codes.push(product.barcode);
  });
  
  return codes;
}

/**
 * Génère un nouvel QR code unique
 */
export function generateUniqueQRCode(): string {
  const existingCodes = getAllExistingCodes();
  return generateUniqueCode('qr', existingCodes);
}

/**
 * Génère un nouveau code-barres unique
 */
export function generateUniqueBarcode(): string {
  const existingCodes = getAllExistingCodes();
  return generateUniqueCode('barcode', existingCodes);
}
