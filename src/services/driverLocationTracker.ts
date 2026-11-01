import * as Location from 'expo-location';
import { deliveryTrackingService } from '@daloa/api';
import { Coordinates } from '@daloa/types';

/**
 * Intervalle de diffusion broadcast temps réel vers le client (15 secondes)
 */
const BROADCAST_INTERVAL_MS = 15_000;

/**
 * Intervalle de sauvegarde persistante en base de données (60 secondes)
 * Permet de ne pas saturer la base de données PostgreSQL tout en gardant
 * un historique récent en cas de reconnexion de l'acheteur.
 */
const DB_SAVE_INTERVAL_MS = 60_000;

class DriverLocationTracker {
  private activeAssignmentId: string | null = null;
  private trackingTimer: ReturnType<typeof setInterval> | null = null;
  private lastDbSaveMs = 0;
  private lastKnownCoords: Coordinates | null = null;

  /**
   * Vérifie si le traqueur est actuellement en cours d'exécution
   */
  public isTracking(): boolean {
    return this.activeAssignmentId !== null && this.trackingTimer !== null;
  }

  /**
   * Démarre la boucle de diffusion GPS toutes les 15 secondes pour une course active.
   * Retourne la fonction d'arrêt à appeler au démontage ou à la fin de course.
   */
  public startTracking(assignmentId: string): () => void {
    if (!assignmentId) return () => {};

    // Si déjà actif sur la même course, ne pas réinitialiser
    if (this.activeAssignmentId === assignmentId && this.trackingTimer) {
      return () => this.stopTracking();
    }

    this.stopTracking();
    this.activeAssignmentId = assignmentId;
    this.lastDbSaveMs = 0;

    // Premier envoi immédiat
    this.emitLocationTick(assignmentId).catch((err) => {
      console.warn('[DriverLocationTracker] Échec du premier tick GPS:', err?.message);
    });

    // Boucle de 15 secondes
    this.trackingTimer = setInterval(() => {
      this.emitLocationTick(assignmentId).catch((err) => {
        console.warn('[DriverLocationTracker] Échec tick GPS périodique:', err?.message);
      });
    }, BROADCAST_INTERVAL_MS);

    return () => this.stopTracking();
  }

  /**
   * Stoppe immédiatement la diffusion GPS
   */
  public stopTracking(): void {
    if (this.trackingTimer) {
      clearInterval(this.trackingTimer);
      this.trackingTimer = null;
    }
    this.activeAssignmentId = null;
  }

  /**
   * Récupère la dernière coordonnée connue
   */
  public getLastKnownCoords(): Coordinates | null {
    return this.lastKnownCoords;
  }

  /**
   * Exécute une itération de capture et diffusion de la position
   */
  private async emitLocationTick(assignmentId: string): Promise<void> {
    if (this.activeAssignmentId !== assignmentId) return;

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude: lat, longitude: lng, heading, speed } = position.coords;
      const nowMs = Date.now();
      this.lastKnownCoords = { lat, lng };

      // 1. Broadcast temps réel (Option C - 15s)
      await deliveryTrackingService.broadcastDriverLocation({
        assignmentId,
        lat,
        lng,
        heading: typeof heading === 'number' && heading >= 0 ? heading : null,
        speed: typeof speed === 'number' && speed >= 0 ? speed : null,
        timestamp: nowMs,
      });

      // 2. Sauvegarde périodique en base (toutes les 60 secondes max)
      const elapsedSinceDbSave = nowMs - this.lastDbSaveMs;
      if (elapsedSinceDbSave >= DB_SAVE_INTERVAL_MS || this.lastDbSaveMs === 0) {
        this.lastDbSaveMs = nowMs;
        await deliveryTrackingService.saveDriverLocationSnapshot(assignmentId, lat, lng);
      }
    } catch (err: any) {
      // Les pertes temporaires de fix GPS ne doivent pas interrompre le service
      console.warn('[DriverLocationTracker] Avertissement GPS:', err?.message || err);
    }
  }
}

export const driverLocationTracker = new DriverLocationTracker();
