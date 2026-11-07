/**
 * Sécurité Couvre-feu Daloa (22h30 — 05h30).
 * Suspend l'attribution et l'acceptation des courses nocturnes pour protéger
 * l'intégrité physique des coursiers et la marchandise.
 */
export const isCurfewActive = (): boolean => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const timeInMinutes = hours * 60 + minutes;
  const startCurfew = 22 * 60 + 30; // 22h30
  const endCurfew = 5 * 60 + 30;    // 05h30

  return timeInMinutes >= startCurfew || timeInMinutes < endCurfew;
};
