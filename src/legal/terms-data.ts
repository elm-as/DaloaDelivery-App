export interface DriverLegalArticle {
  id: string;
  number: string;
  title: string;
  summary: string;
  paragraphs: string[];
  bullets?: string[];
}

export const DRIVER_TERMS_LAST_UPDATE = '2 juillet 2026';

export const DRIVER_TERMS_ARTICLES: DriverLegalArticle[] = [
  {
    id: 'acceptance',
    number: '1',
    title: 'Acceptation de la Charte et des Conditions',
    summary: 'Engagement contractuel liant le livreur indépendant et la plateforme.',
    paragraphs: [
      'En accédant à l’application DaloaDelivery et en activant son profil coursier, l’Utilisateur reconnaît avoir pris connaissance et accepté sans réserve les présentes Conditions Générales d’Utilisation et la Charte Qualité Coursier.',
      'DaloaDelivery est une plateforme technologique mettant en relation des clients, commerçants et des coursiers indépendants opérant à Daloa (Côte d’Ivoire).',
      'Le coursier exerce son activité en toute indépendance et sous son entière responsabilité juridique et assurantielle.',
    ],
  },
  {
    id: 'requirements',
    number: '2',
    title: 'Conditions d’accès & Vérification d’identité (KYC)',
    summary: 'Prérequis obligatoires pour devenir coursier partenaire.',
    paragraphs: [
      'Tout coursier candidat doit remplir les conditions suivantes avant activation de son compte :',
    ],
    bullets: [
      'Être âgé d’au moins 18 ans révolus et juridiquement capable',
      'Fournir une pièce d’identité nationale (CNI ou Passeport en cours de validité)',
      'Posséder un permis de conduire valide adapté au véhicule utilisé (Moto ou Voiture)',
      'Disposer d’un véhicule conforme aux règles de sécurité du code de la route ivoirien',
      'Disposer d’un smartphone compatible GPS avec connexion internet stable et numéro Mobile Money actif',
    ],
  },
  {
    id: 'course-lifecycle',
    number: '3',
    title: 'Déroulement d’une course & Double OTP Obligatoire',
    summary: 'Protocole de ramassage, transport et remise sécurisée au destinataire.',
    paragraphs: [
      'Dès acceptation d’une course, le coursier s’engage à rejoindre le lieu de ramassage sous 15 minutes et à prendre en charge le colis avec soin.',
      'Règle d’or absolue : le coursier ne doit JAMAIS remettre le colis sans avoir saisi et validé dans l’application le code secret OTP communiqué en main propre par le destinataire.',
      'Une photo de preuve de livraison physique est également requise lors de la remise pour clôturer définitivement la course.',
    ],
  },
  {
    id: 'integrity',
    number: '4',
    title: 'Intégrité des Marchandises & Interdictions',
    summary: 'Protection absolue des colis et respect strict de la déontologie.',
    paragraphs: [
      'Il est strictement interdit d’ouvrir, d’altérer, de fouiller ou de détériorer les colis confiés.',
      'Tout transport d’articles prohibés par la loi ivoirienne (stupéfiants, armes, produits illégaux) entraîne la radiation immédiate et le signalement aux autorités compétentes.',
      'Toute tentative de détournement de colis ou de collusion entraîne la suspension immédiate du compte et le gel des fonds séquestres.',
    ],
  },
  {
    id: 'tariffs-payouts',
    number: '5',
    title: 'Tarification Officielle & Reversement des Gains',
    summary: 'Grille tarifaire par géolocalisation et reversement net à 90%.',
    paragraphs: [
      'La tarification officielle est calculée automatiquement par l’algorithme kilométrique :',
      'Forfait de base : 500 FCFA pour les premiers 1,5 km, puis 85 FCFA par kilomètre additionnel.',
      'Part revenant au coursier : 90% du montant total facturé pour la course (10% de frais techniques de plateforme).',
      'Le paiement est garanti et versé directement par Mobile Money (Wave, Orange, MTN, Moov) sur le numéro configuré par le livreur.',
    ],
  },
  {
    id: 'geofence',
    number: '6',
    title: 'Validation de Proximité GPS (Geofencing 100m)',
    summary: 'Contrôle algorithmique de la présence physique sur le lieu de livraison.',
    paragraphs: [
      'Pour valider la remise finale d’une course, l’application contrôle que les coordonnées GPS du coursier se situent à moins de 100 mètres du point de livraison spécifié par l’acheteur.',
      'Ce dispositif protège le coursier et le client contre les validations frauduleuses à distance.',
    ],
  },
  {
    id: 'reputation',
    number: '7',
    title: 'Évaluation, Qualité & Suspension',
    summary: 'Notation réciproque et maintien des standards d’excellence.',
    paragraphs: [
      'Après chaque course, les clients et vendeurs peuvent attribuer une note (sur 5 étoiles) et laisser une appréciation sur la ponctualité et la courtoisie du coursier.',
      'DaloaDelivery se réserve le droit de suspendre temporairement ou définitivement tout profil cumulant des annulations abusives ou une note moyenne inférieure à 3,5/5.',
    ],
  },
  {
    id: 'disputes',
    number: '8',
    title: 'Assistance Litiges & Juridiction Compétente',
    summary: 'Support dédié aux livreurs et règlement des contestations.',
    paragraphs: [
      'En cas d’incident en cours de route (accident, client injoignable, panne), le coursier doit immédiatement contacter le support via le bouton WhatsApp d’urgence.',
      'Mise en garde formelle : DaloaDelivery décline toute responsabilité pour les livraisons ou arrangements financiers convenus en dehors de l’application. Aucune assistance ni médiation ne sera fournie pour les courses non enregistrées sur la plateforme.',
      'Les présentes conditions sont soumises aux lois de la République de Côte d’Ivoire. Tout différend relève des tribunaux compétents de Daloa.',
    ],
  },
];
