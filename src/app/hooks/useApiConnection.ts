import { useState, useEffect } from 'react';
import { healthApi } from '../services/api';

export function useApiConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    setError(null);

    try {
      await healthApi.check();
      setIsConnected(true);
    } catch (err: any) {
      setIsConnected(false);
      setError(err.message || 'Impossible de se connecter à l\'API');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();

    // Vérifier la connexion toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected, isChecking, error, recheckConnection: checkConnection };
}
