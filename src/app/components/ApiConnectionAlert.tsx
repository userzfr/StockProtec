import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw, Server } from 'lucide-react';

interface ApiConnectionAlertProps {
  onRetry: () => void;
  isChecking: boolean;
}

export function ApiConnectionAlert({ onRetry, isChecking }: ApiConnectionAlertProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 text-lg">
            Serveur API non disponible
          </AlertTitle>
          <AlertDescription className="text-red-700 space-y-4 mt-2">
            <p>
              Le serveur backend de StockProtec n'est pas démarré. Pour utiliser l'application,
              vous devez démarrer le serveur API.
            </p>

            <div className="bg-white rounded-lg p-4 border border-red-200">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <Server className="w-4 h-4" />
                Comment démarrer le serveur :
              </p>
              <div className="space-y-2 text-sm font-mono bg-gray-900 text-green-400 p-3 rounded">
                <p># Option 1 : Tout démarrer ensemble</p>
                <p className="text-white">npm run dev:all</p>
                <p className="mt-2"># Option 2 : Serveur uniquement</p>
                <p className="text-white">npm run server</p>
              </div>
            </div>

            <Button
              onClick={onRetry}
              disabled={isChecking}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer la connexion
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
