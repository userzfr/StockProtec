import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Globe, Monitor, Smartphone, Tablet, Calendar, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface UserSession {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  browser: string;
  os: string;
  device_type: string;
  login_time: string;
  last_activity_time: string;
  logout_time?: string;
}

const SESSION_ACTIVE_THRESHOLD_MS = 11 * 60 * 1000;

interface UserLogsViewerProps {
  userId: string;
}

export function UserLogsViewer({ userId }: UserLogsViewerProps) {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/sessions`);
      if (!response.ok) {
        throw new Error('Impossible de charger les sessions');
      }
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions :', error);
      toast.error('Échec du chargement des sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="size-4" />;
      case 'tablet':
        return <Tablet className="size-4" />;
      default:
        return <Monitor className="size-4" />;
    }
  };

  const parseSessionDate = (dateString: string) => {
    if (!dateString) return null;
    const normalizedDate = dateString.trim().replace(' ', 'T');
    const parsed = new Date(normalizedDate);
    if (!isNaN(parsed.getTime())) return parsed;
    return new Date(dateString);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = parseSessionDate(dateString);
      if (!date) return dateString;
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getDuration = (loginTime: string, logoutTime?: string) => {
    try {
      const start = parseSessionDate(loginTime);
      const end = logoutTime ? parseSessionDate(logoutTime) : new Date();
      if (!start || !end) return '-';

      const diffSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
      if (diffSeconds < 60) return `${diffSeconds}s`;
      if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
      if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
      return `${Math.floor(diffSeconds / 86400)}j`;
    } catch (error) {
      return '-';
    }
  };

  const isSessionActive = (session: UserSession) => {
    if (session.logout_time) return false;
    const lastActivity = parseSessionDate(session.last_activity_time);
    if (!lastActivity) return false;
    return Date.now() - lastActivity.getTime() <= SESSION_ACTIVE_THRESHOLD_MS;
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Historique des sessions</CardTitle>
              <CardDescription>
                Affiche les {sessions.length} dernières connexions
              </CardDescription>
            </div>
            <button
              onClick={loadSessions}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucune session enregistrée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Appareil</TableHead>
                    <TableHead>Système d'exploitation</TableHead>
                    <TableHead>Navigateur</TableHead>
                    <TableHead>Adresse IP</TableHead>
                    <TableHead>Connexion</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.device_type)}
                          <span className="capitalize text-sm">
                            {session.device_type || 'Desktop'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{session.os}</TableCell>
                      <TableCell className="text-sm">{session.browser}</TableCell>
                      <TableCell className="text-sm font-mono">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {session.ip_address}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {formatDate(session.login_time)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getDuration(session.login_time, session.logout_time)}
                      </TableCell>
                      <TableCell>
                        {isSessionActive(session) ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <LogOut className="size-3" />
                            {session.logout_time ? 'Fermé' : 'Inactif'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sessions actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(isSessionActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dernière connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {sessions.length > 0
                ? formatDate(sessions[0].login_time)
                : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Appareils distincts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(sessions.map(s => s.device_type)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IPs utilisées */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Adresses IP utilisées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set(sessions.map(s => s.ip_address))).map((ip) => {
                const count = sessions.filter(s => s.ip_address === ip).length;
                const lastSession = sessions
                  .filter(s => s.ip_address === ip)
                  .sort((a, b) => new Date(b.login_time).getTime() - new Date(a.login_time).getTime())[0];
                
                return (
                  <div
                    key={ip}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="size-4 text-blue-600" />
                      <span className="font-mono text-sm">{ip}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {count} session{count > 1 ? 's' : ''} • Dernier accès: {formatDate(lastSession?.login_time || '')}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
