export interface DriverPrivacySection {
  id: string;
  number: string;
  title: string;
  summary: string;
  paragraphs: string[];
  bullets?: string[];
}

export const DRIVER_PRIVACY_LAST_UPDATE = '16 septembre 2026';

export const DRIVER_PRIVACY_SECTIONS: DriverPrivacySection[] = [
  {
    id: 'intro',
    number: '1',
    title: 'Engagement de Confidentialité Coursier',
    summary: 'Protection rigoureuse des données des livreurs partenaires.',
    paragraphs: [
      'DaloaDelivery attache la plus haute importance à la protection de la vie privée et des données de ses coursiers indépendants partenaires.',
      'La présente politique détaille les modalités de collecte, d’utilisation et de sécurisation de vos données dans le cadre de votre activité.',
    ],
  },
  {
    id: 'gps',
    number: '2',
    title: 'Données de Géolocalisation GPS en direct',
    summary: 'Partage actif strictement limité à la durée des courses.',
    paragraphs: [
      'La géolocalisation en temps réel de votre appareil est collectée uniquement lorsque vous êtes en statut « Disponible » ou en cours d’exécution d’une livraison.',
      'Le flux de localisation est partagé avec le vendeur et le client destinataire pour leur permettre de suivre l’approche de leur commande.',
      'Dès qu’une course est finalisée par code OTP, le partage public de votre position s’interrompt immédiatement.',
    ],
  },
  {
    id: 'documents',
    number: '3',
    title: 'Pièces d’Identité & Documents KYC',
    summary: 'Stockage chiffré des pièces justificatives.',
    paragraphs: [
      'Les copies de votre Carte Nationale d’Identité (CNI), de votre permis de conduire et de vos photos de profil sont stockées dans un compartiment sécurisé et chiffré.',
      'Ces documents ne sont jamais rendus publics : ils sont réservés exclusivement à l’équipe de conformité et de modération pour la certification de votre profil.',
    ],
  },
  {
    id: 'payouts',
    number: '4',
    title: 'Coordonnées de Versement Mobile Money',
    summary: 'Sécurisation des transferts financiers.',
    paragraphs: [
      'Votre numéro de versement Mobile Money et votre opérateur (Wave, Orange, MTN, Moov) sont conservés uniquement pour exécuter le versement de vos gains de livraison. Ce versement est déclenché après validation de la course par code OTP ; un délai de traitement peut s’écouler avant sa réception effective, celle-ci dépendant également des délais propres à votre opérateur.',
      'DaloaDelivery ne vous demandera JAMAIS votre code PIN secret Mobile Money.',
    ],
  },
  {
    id: 'rights',
    number: '5',
    title: 'Vos Droits & Suppression de Profil',
    summary: 'Accès, modification et effacement de vos informations.',
    paragraphs: [
      'Vous pouvez à tout moment modifier vos zones de couverture, votre véhicule ou vos informations de profil depuis l’application.',
      'Vous avez le droit d’exiger la suppression complète de votre compte livreur en contactant notre assistance dédiée à support@daloamarket.com.',
    ],
  },
  {
    id: 'subprocessors',
    number: '6',
    title: 'Hébergement & Sous-traitants',
    summary: 'Qui héberge vos données et pour quel usage.',
    paragraphs: [
      'Nos sous-traitants sont : Supabase (base de données, authentification, stockage chiffré de vos pièces d’identité), Money Fusion (versement de vos gains Mobile Money), Mapbox (cartes et calcul d’itinéraires), Expo — avec Apple et Google pour l’acheminement — (notifications de nouvelles courses), Netlify et Render (hébergement des services).',
      'Certains de ces prestataires hébergent des données en dehors de la Côte d’Ivoire, notamment en Europe. Les transferts sont encadrés par les engagements contractuels de ces prestataires.',
      'Aucun traceur publicitaire, aucun pixel de suivi et aucun outil de profilage commercial n’est utilisé dans l’application.',
    ],
  },
  {
    id: 'retention',
    number: '7',
    title: 'Durée de Conservation',
    summary: 'Combien de temps vos données sont gardées.',
    paragraphs: [
      'Les données de votre compte livreur sont conservées tant que celui-ci reste actif. La suppression prend effet immédiatement : nom, téléphone, photo et pièces d’identité sont effacés ou rendus anonymes sans délai, et votre accès est révoqué définitivement.',
      'Les traces de courses et de versements sont conservées jusqu’à 10 ans, conformément aux obligations comptables et fiscales ivoiriennes. Cette conservation s’impose à nous et survit à la suppression de votre compte.',
      'Les pièces d’identité transmises lors de votre inscription sont conservées pendant la durée de votre activité sur la plateforme, puis supprimées, sauf litige en cours ou obligation légale contraire.',
      'Les points GPS enregistrés au cours d’une course sont rattachés à la course concernée et suivent sa durée de conservation. Le partage en direct de votre position, lui, cesse dès la validation du code OTP.',
      'À la suppression d’un compte, nous gardons une empreinte cryptographique irréversible (SHA-256) de son adresse e-mail et de son identifiant de connexion — jamais l’adresse elle-même. Elle sert uniquement à reconnaître la réinscription d’une personne dont le compte avait été banni ou signalé, et elle est effacée automatiquement au bout de 3 ans.',
    ],
  },
];
