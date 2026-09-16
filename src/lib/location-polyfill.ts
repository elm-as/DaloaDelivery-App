import { Platform } from 'react-native';
import * as Location from 'expo-location';

/**
 * Polyfill pour expo-location sur plateforme Web :
 * Dans expo-location v19, LocationEventEmitter.web utilise EventEmitter (expo-modules-core)
 * qui ne possède pas la méthode legacy removeSubscription(), causant un crash fatal React
 * (TypeError: removeSubscription is not a function) lors du cleanup de watchPositionAsync.
 */
export function applyExpoLocationWebPolyfill(): void {
  if (Platform.OS !== 'web') return;

  const eventEmitter = (Location as any).EventEmitter;
  if (eventEmitter && typeof eventEmitter.removeSubscription !== 'function') {
    eventEmitter.removeSubscription = (subscription: any) => {
      try {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        }
      } catch {
        // Ignorer silencieusement si la souscription est déjà révoquée
      }
    };
  }
}

// Application immédiate à l'import
applyExpoLocationWebPolyfill();
