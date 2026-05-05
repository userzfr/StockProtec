import { Link } from 'react-router';

export function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Mentions légales et protection des données</h1>

      <section className="space-y-4 text-sm text-slate-700 leading-7">
        <p>
          StockProtec est une application de gestion de stock développée pour l'antenne de Saint-Étienne de la Protection Civile de la Loire.
          Elle vise à sécuriser la gestion des matériels et produits, tout en respectant les obligations légales et RGPD liées aux données personnelles.
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
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Finalité des données</h2>
          <p>
            Les données collectées sont utilisées uniquement pour l'authentification, la gestion des accès, la tenue des stocks et la traçabilité des actions.
            Les informations stockées ne servent pas à du marketing et ne sont pas revendues à des tiers.
          </p>
          <p>
            Les adresses IP sont conservées pour assurer la sécurité, tracer les connexions, détecter les tentatives d'accès non autorisées et garantir la responsabilité des actions.
            Cette conservation est strictement limitée à des fins de journalisation et de sécurité.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Données personnelles</h2>
          <p>
            Les seules données personnelles traitées sont celles nécessaires à l'accès au service : identifiants, adresse e-mail et historique des actions liées aux comptes.
            Les mots de passe sont chiffrés côté serveur avec un algorithme sécurisé et ne sont jamais stockés en clair.
          </p>
          <p>
            Les logs de connexion et d'activité sont conservés conformément aux obligations de sécurité et aux conditions contractuelles avec l'hébergeur.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Base légale</h2>
          <p>
            Le traitement des données repose sur l'exécution d'une mission d'intérêt public et la nécessité de garantir la sécurité des accès et des stocks.
            La conservation des adresses IP et des journaux de connexion s'inscrit dans la prévention des fraudes et la protection des systèmes d'information.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Sécurité</h2>
          <p>
            Des mesures techniques et organisationnelles appropriées sont mises en place pour protéger les données contre l'accès non autorisé, la perte ou le vol.
            Cela inclut le chiffrement des mots de passe, le contrôle des accès et la surveillance des connexions.
          </p>
          <p>
            L'hébergeur met en œuvre des sauvegardes et des protections conformes aux bonnes pratiques pour assurer la disponibilité et l'intégrité des données.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Durée de conservation</h2>
          <p>
            Les données sont conservées uniquement le temps nécessaire aux finalités décrites et dans le respect des obligations légales.
            Les logs de connexion peuvent être conservés pour une durée adaptée à la sécurité opérationnelle et à l'analyse des incidents.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Droits des personnes</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données.
            Pour exercer ces droits, veuillez contacter l'antenne de Saint-Étienne de la Protection Civile de la Loire.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Cookies</h2>
          <p>
            Cette application utilise uniquement des cookies techniques nécessaires à l'authentification et à la gestion de session.
            Aucun cookie de suivi ou de marketing n'est utilisé, et les données de session ne sont pas exploitées à des fins publicitaires.
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
