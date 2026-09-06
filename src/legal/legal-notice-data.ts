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
      { label: 'Fondateur & Direction', value: 'OULOBO Elmas Tresor' },
      { label: 'Implantation', value: 'Daloa / Abidjan, Côte d’Ivoire' },
      { label: 'Emails officiels', value: 'support@daloamarket.com / contact@daloamarket.com' },
      { label: 'Téléphone / WhatsApp', value: '+225 07 88 00 08 31' },
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
      { label: 'Propriété intellectuelle', value: 'Tous droits réservés © 2026 ELMAS — Charte ElmasCore' },
    ],
  },
];
