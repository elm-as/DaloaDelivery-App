export interface DriverPrivacySection {
  id: string;
  number: string;
  title: string;
  summary: string;
  paragraphs: string[];
  bullets?: string[];
}

export const DRIVER_PRIVACY_LAST_UPDATE = '2 juillet 2026';

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
      'Votre numéro de versement Mobile Money et votre opérateur (Wave, Orange, MTN, Moov) sont conservés uniquement pour exécuter le paiement automatique de vos gains de livraison.',
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
];
