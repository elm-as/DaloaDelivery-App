export interface DriverLegalNoticeItem {
  label: string;
  value: string;
}

export interface DriverLegalNoticeGroup {
  id: string;
  title: string;
  items: DriverLegalNoticeItem[];
}

export const DRIVER_LEGAL_NOTICE_DATA: DriverLegalNoticeGroup[] = [
  {
    id: 'editor',
    title: 'Éditeur du Service DaloaDelivery',
    items: [
      { label: 'Plateforme', value: 'DaloaDelivery (delivery.daloamarket.com)' },
      { label: 'Directeur de la publication', value: 'OULOBO Elmas Tresor' },
      { label: 'Forme juridique', value: 'Entreprise individuelle, non immatriculée au RCCM à ce jour' },
      { label: 'Adresse de l’éditeur', value: 'RueO21,68, Yopougon, Abidjan, Côte d’Ivoire' },
      { label: 'Zone d’activité', value: 'Daloa et sa région, Côte d’Ivoire' },
      { label: 'Emails officiels', value: 'support@daloamarket.com / contact@daloamarket.com' },
      { label: 'WhatsApp (pas d’appels)', value: '+225 01 73 80 15 59' },
    ],
  },
  {
    id: 'hosting',
    title: 'Hébergement & Partenaires Techniques',
    items: [
      { label: 'Application & Web', value: 'Netlify, Inc. / Expo EAS Application Platform' },
      { label: 'Base de données', value: 'Supabase Inc. (PostgreSQL Cloud chiffré)' },
      { label: 'Passerelle Paiements', value: 'Money Fusion (Paiement Sécurisé Mobile Money)' },
      { label: 'Réseaux supportés', value: 'Wave CI, Orange Money CI, MTN MoMo CI, Moov Money CI' },
    ],
  },
  {
    id: 'legal',
    title: 'Cadre Juridique & Propriété',
    items: [
      { label: 'Droit applicable', value: 'Droit de la République de Côte d’Ivoire' },
      { label: 'Juridiction compétente', value: 'Tribunaux compétents de la ville de Daloa' },
      { label: 'Propriété intellectuelle', value: 'Tous droits réservés © 2026 ELMAS, Charte ElmasCore' },
    ],
  },
];
