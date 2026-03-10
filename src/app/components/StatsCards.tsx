import { Package, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Product } from '@/app/App';

interface StatsCardsProps {
  products: Product[];
}

export function StatsCards({ products }: StatsCardsProps) {
  const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
  
  const expiringSoon = products.filter(p => {
    const expiryDate = new Date(p.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  }).length;
  
  const controlNeeded = products.filter(p => {
    const controlDate = new Date(p.controlDate);
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    return controlDate <= oneMonthFromNow;
  }).length;
  
  const lowStock = products.filter(p => p.quantity < 50).length;

  const stats = [
    {
      title: 'Total Articles',
      value: totalProducts,
      subtitle: `${products.length} références`,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900'
    },
    {
      title: 'Stock Faible',
      value: lowStock,
      subtitle: 'Moins de 50 unités',
      icon: TrendingDown,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-900'
    },
    {
      title: 'Péremption Proche',
      value: expiringSoon,
      subtitle: 'Dans les 3 mois',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-900'
    },
    {
      title: 'Contrôle Requis',
      value: controlNeeded,
      subtitle: 'Dans le mois',
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${stat.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium opacity-90">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs opacity-75 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                    <Icon className="size-6" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
