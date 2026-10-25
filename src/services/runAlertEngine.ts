import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';
import { Haptics, SecureStorageAdapter, formatFCFA } from '@daloa/utils';
import { supabase } from '@daloa/api';

const PREFS_STORAGE_KEY = 'daloa_driver_run_alert_prefs';

export interface DriverAlertPreferences {
  soundEnabled: boolean;
  speechEnabled: boolean;
  vibrationEnabled: boolean;
}

const DEFAULT_PREFERENCES: DriverAlertPreferences = {
  soundEnabled: true,
  speechEnabled: true,
  vibrationEnabled: true,
};

class RunAlertEngine {
  private currentPreferences: DriverAlertPreferences = DEFAULT_PREFERENCES;
  private isLoaded = false;
  private activeAlertAssignmentId: string | null = null;
  private realtimeChannel: any = null;

  /**
   * Initialise les canaux de notification Android haute priorité (AndroidImportance.MAX)
   */
  public async initNotificationChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      await Notifications.setNotificationChannelAsync('run_alerts_v2', {
        name: 'Alertes Nouvelles Courses (Urgent)',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500],
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    } catch (err: any) {
      console.warn('[RunAlertEngine] Initialisation canal Android échouée:', err?.message);
    }
  }

  /**
   * Charge les préférences d'alerte sauvegardées par le livreur
   */
  public async loadPreferences(): Promise<DriverAlertPreferences> {
    if (this.isLoaded) return this.currentPreferences;

    try {
      const stored = await SecureStorageAdapter.getItem(PREFS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentPreferences = {
          soundEnabled: parsed.soundEnabled ?? true,
          speechEnabled: parsed.speechEnabled ?? true,
          vibrationEnabled: parsed.vibrationEnabled ?? true,
        };
      }
    } catch (err) {
      this.currentPreferences = DEFAULT_PREFERENCES;
    }

    this.isLoaded = true;
    return this.currentPreferences;
  }

  /**
   * Sauvegarde les nouvelles préférences de notification du livreur
   */
  public async updatePreferences(
    partial: Partial<DriverAlertPreferences>
  ): Promise<DriverAlertPreferences> {
    const updated = { ...this.currentPreferences, ...partial };
    this.currentPreferences = updated;
    try {
      await SecureStorageAdapter.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err: any) {
      console.warn('[RunAlertEngine] Erreur sauvegarde préférences alertes:', err?.message);
    }
    return updated;
  }

  /**
   * Déclenche une alerte sonore et vocale pour une nouvelle course disponible (F09).
   * L'alerte est immédiatement interrompue si la course est prise par un autre livreur.
   */
  public async notifyNewRun(run: {
    assignmentId: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    deliveryPrice: number;
    driverNetGain?: number;
  }): Promise<void> {
    await this.loadPreferences();
    this.stopCurrentAlert();

    this.activeAlertAssignmentId = run.assignmentId;

    // 1. Vibration haptique
    if (this.currentPreferences.vibrationEnabled) {
      try {
        Haptics.heavyImpact();
      } catch {}
    }

    // 2. Écoute de l'attribution de la course pour interruption immédiate
    this.watchAssignmentClaim(run.assignmentId);

    // 3. Synthèse vocale contextuelle (Speech TTS)
    if (this.currentPreferences.speechEnabled) {
      const netGain = run.driverNetGain ?? Math.round(run.deliveryPrice * 0.9);
      const text = `Nouvelle course disponible. ${run.pickupLocation || 'Boutique'} vers ${
        run.dropoffLocation || 'Client'
      }. Gain net : ${formatFCFA(netGain)}.`;

      try {
        Speech.stop();
        Speech.speak(text, {
          language: 'fr-FR',
          pitch: 1.0,
          rate: 1.05,
          onDone: () => {
            this.activeAlertAssignmentId = null;
          },
          onStopped: () => {
            this.activeAlertAssignmentId = null;
          },
          onError: () => {
            this.activeAlertAssignmentId = null;
          },
        });
      } catch (err: any) {
        console.warn('[RunAlertEngine] Erreur synthèse vocale Speech:', err?.message);
      }
    }
  }

  /**
   * Arrête immédiatement l'alerte en cours
   */
  public stopCurrentAlert(assignmentId?: string): void {
    if (assignmentId && this.activeAlertAssignmentId && this.activeAlertAssignmentId !== assignmentId) {
      return;
    }

    try {
      Speech.stop();
    } catch {}

    this.cleanupRealtimeListener();
    this.activeAlertAssignmentId = null;
  }

  /**
   * Écoute en temps réel si la course est réclamée par un autre livreur ou annulée
   */
  private watchAssignmentClaim(assignmentId: string): void {
    this.cleanupRealtimeListener();

    this.realtimeChannel = supabase
      .channel(`run_claim_watch:${assignmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_assignments',
          filter: `id=eq.${assignmentId}`,
        },
        (payload: any) => {
          const newStatus = payload?.new?.status;
          const assignedDriverId = payload?.new?.delivery_person_id;

          // Si la course n'est plus 'awaiting_pickup' ou a été prise, couper l'alerte tout de suite !
          if (newStatus !== 'awaiting_pickup' || assignedDriverId) {
            this.stopCurrentAlert(assignmentId);
          }
        }
      )
      .subscribe();
  }

  private cleanupRealtimeListener(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }
}

export const runAlertEngine = new RunAlertEngine();
