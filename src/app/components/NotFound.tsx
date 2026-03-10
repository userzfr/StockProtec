import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <AlertTriangle className="w-24 h-24 text-gray-300 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="text-xl text-gray-600">Page non trouvée</p>
          <p className="text-gray-500">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
          <Home className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
