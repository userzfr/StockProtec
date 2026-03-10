import { PharmacyProduct } from '@/app/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Package, AlertTriangle, TrendingDown, Archive } from 'lucide-react';

interface PharmacyStatsCardsProps {
  products: PharmacyProduct[];
}

export function PharmacyStatsCards({ products }: PharmacyStatsCardsProps) {
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  
  const expiringSoon = products.filter(p => {
    const expiryDate = new Date(p.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow && expiryDate >= new Date();
  }).length;

  const expired = products.filter(p => new Date(p.expiryDate) < new Date()).length;

  const lowStock = products.filter(p => p.minStock && p.quantity <= p.minStock).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total produits</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-gray-500 mt-1">
            {totalQuantity} unités au total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock bas</CardTitle>
          <TrendingDown className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowStock}</div>
          <p className="text-xs text-gray-500 mt-1">
            produits à réapprovisionner
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expire bientôt</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expiringSoon}</div>
          <p className="text-xs text-gray-500 mt-1">
            dans les 3 prochains mois
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Périmés</CardTitle>
          <Archive className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{expired}</div>
          <p className="text-xs text-gray-500 mt-1">
            produits à retirer
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
