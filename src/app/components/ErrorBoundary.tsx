import { Link, useRouteError } from 'react-router';

function getEnvironmentInfo() {
  return {
    url: window.location.href,
    path: window.location.pathname,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor,
    language: navigator.language,
    online: navigator.onLine ? 'Oui' : 'Non',
    cookies: navigator.cookieEnabled ? 'Oui' : 'Non',
    timestamp: new Date().toISOString(),
  };
}

function formatErrorDetail(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack ?? 'Pas de stack disponible.'}`;
  }

  return String(error);
}

export function ErrorBoundary() {
  const error = useRouteError();
  const environment = getEnvironmentInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-semibold text-red-600 mb-4">Oups, une erreur est survenue</h1>
        <p className="text-sm text-gray-600 mb-6">
          L'application n'a pas pu afficher cette page. Vous pouvez revenir à l'accueil ou réessayer.
        </p>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 mb-6 text-sm text-red-800">
          <h2 className="text-base font-semibold mb-2">Message d'erreur</h2>
          <pre className="whitespace-pre-wrap break-words">{formatErrorDetail(error)}</pre>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 mb-6 text-sm text-slate-800">
          <h2 className="text-base font-semibold mb-3">Informations développeur</h2>
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <span className="font-semibold">URL:</span>
              <div>{environment.url}</div>
            </div>
            <div>
              <span className="font-semibold">Chemin:</span>
              <div>{environment.path}</div>
            </div>
            <div>
              <span className="font-semibold">Navigateur:</span>
              <div>{environment.userAgent}</div>
            </div>
            <div>
              <span className="font-semibold">Plateforme:</span>
              <div>{environment.platform}</div>
            </div>
            <div>
              <span className="font-semibold">Fournisseur:</span>
              <div>{environment.vendor || 'Inconnu'}</div>
            </div>
            <div>
              <span className="font-semibold">Langue:</span>
              <div>{environment.language}</div>
            </div>
            <div>
              <span className="font-semibold">En ligne:</span>
              <div>{environment.online}</div>
            </div>
            <div>
              <span className="font-semibold">Cookies activés:</span>
              <div>{environment.cookies}</div>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold">Horodatage:</span>
              <div>{environment.timestamp}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Retour à l'accueil
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Recharger la page
          </button>
        </div>
      </div>
    </div>
  );
}
