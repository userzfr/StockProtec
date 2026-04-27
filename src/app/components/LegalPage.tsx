import { Link } from 'react-router';

export function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Mentions légales</h1>

      <section className="space-y-4 text-sm text-slate-700 leading-7">
        <p>
          StockProtec est une application de gestion de stock développée pour l'antenne de Saint-Étienne de la Protection Civile de la Loire.
          Les mentions légales présentent les informations principales sur l'éditeur, l'hébergement et la protection des données.
        </p>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Éditeur</h2>
          <p>Protection Civile de la Loire - Antenne de Saint-Étienne</p>
          <p>Développé par Mathieu MERLE (Chef de projet et développeur principal)</p>
          <p>Contact : 11 Rue René Cassin 42100 SAINT-ÉTIENNE</p>
          <p>Email : userz_fr@outlook.fr</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Hébergement</h2>
          <p>Nom de l'hébergeur : IHC NETWORK</p>
          <p>Adresse : Yvetot</p>
          <p>Email : userz_fr@outlook.fr</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Données personnelles</h2>
          <p>
            Les seules données utilisateur collectées sont celles nécessaires à l'authentification et à la gestion des accès.
            Les mots de passe sont chiffrés côté serveur grâce à un mécanisme de hachage sécurisé, et ne sont jamais stockés en clair.
          </p>
          <p>
            Les données de stock et les logs sont conservées sur les serveurs de l'hébergeur selon les conditions contractuelles.
          </p>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données.
            Pour exercer ces droits, contactez l'antenne de Saint-Étienne de la Protection Civile de la Loire.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Sécurité</h2>
          <p>
            Les mots de passe sont hachés avec un sel unique et des itérations de dérivation pour empêcher leur récupération en cas d'accès non autorisé à la base de données.
          </p>
          <p>
            L'hébergeur met en place des mesures techniques et organisationnelles appropriées pour assurer la sécurité des données.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Cookies</h2>
          <p>
            Cette application utilise des cookies techniques nécessaires au fonctionnement de l'authentification et à la session utilisateur.
            Aucun cookie de suivi ou de marketing n'est utilisé.
          </p>
        </div>

        <div className="text-sm text-slate-500">
          <p>
            Retourner à la <Link to="/" className="text-blue-600 hover:underline">page d'accueil</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
