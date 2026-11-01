import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Volume2,
  Mic,
  Vibrate,
  Play,
  Square,
  Sparkles,
  Info,
} from 'lucide-react-native';
import {
  colors,
  spacing,
  radii,
  AppText,
  AppPressable,
  typography,
  showAlert,
} from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import {
  runAlertEngine,
  DriverAlertPreferences,
} from '../../src/services/runAlertEngine';

export default function DriverAlertSettingsScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<DriverAlertPreferences>({
    soundEnabled: true,
    speechEnabled: true,
    vibrationEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  useEffect(() => {
    runAlertEngine.loadPreferences().then((loaded) => {
      setPrefs(loaded);
      setIsLoading(false);
    });
  }, []);

  const handleToggle = async (key: keyof DriverAlertPreferences, value: boolean) => {
    Haptics.lightImpact();
    const updated = await runAlertEngine.updatePreferences({ [key]: value });
    setPrefs(updated);
  };

  const handleTestAlert = async () => {
    if (isPlayingTest) {
      runAlertEngine.stopCurrentAlert('preview-test-assignment');
      setIsPlayingTest(false);
      return;
    }

    setIsPlayingTest(true);
    await runAlertEngine.notifyNewRun({
      assignmentId: 'preview-test-assignment',
      pickupLocation: 'Commerce (Daloa)',
      dropoffLocation: 'Tazibouo',
      deliveryPrice: 1500,
      driverNetGain: 1350,
    });

    // Arrêt visuel après 8 secondes si pas arrêté manuellement
    setTimeout(() => {
      setIsPlayingTest(false);
    }, 8000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <AppPressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.text.DEFAULT} />
        </AppPressable>
        <AppText variant="h2" color={colors.text.DEFAULT} style={styles.headerTitle}>
          Alertes de course (F09)
        </AppText>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info card */}
        <View style={styles.infoBanner}>
          <Info size={18} color={colors.primary.DEFAULT} style={styles.infoIcon} />
          <AppText variant="body" color={colors.text.DEFAULT} style={styles.infoText}>
            Configurez les alertes lorsque de nouvelles livraisons sont disponibles. L'alerte
            s'arrête automatiquement dès qu'un autre livreur prend la course.
          </AppText>
        </View>

        {/* Groupe des options */}
        <AppText variant="label" color={colors.text.muted} style={styles.sectionLabel}>
          NOTIFICATIONS & SON
        </AppText>

        <View style={styles.cardGroup}>
          {/* Sonnerie */}
          <View style={[styles.settingRow, styles.borderBottom]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.status.infoLight }]}>
              <Volume2 size={20} color={colors.status.info} />
            </View>
            <View style={styles.settingTextGroup}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Sonnerie d'alerte
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Canal haute priorité Android (AndroidImportance.MAX)
              </AppText>
            </View>
            <Switch
              value={prefs.soundEnabled}
              onValueChange={(val) => handleToggle('soundEnabled', val)}
              trackColor={{ false: colors.bg.subtle, true: colors.primary.DEFAULT }}
            />
          </View>

          {/* Synthèse vocale */}
          <View style={[styles.settingRow, styles.borderBottom]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.status.successLight }]}>
              <Mic size={20} color={colors.status.successDark} />
            </View>
            <View style={styles.settingTextGroup}>
              <View style={styles.badgeRow}>
                <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                  Annonce vocale (TTS)
                </AppText>
                <View style={styles.newBadge}>
                  <Sparkles size={10} color={colors.primary.DEFAULT} />
                  <AppText variant="caption" color={colors.primary.DEFAULT}>
                    V2
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" color={colors.text.muted}>
                Énonce le quartier et le montant net à haute voix
              </AppText>
            </View>
            <Switch
              value={prefs.speechEnabled}
              onValueChange={(val) => handleToggle('speechEnabled', val)}
              trackColor={{ false: colors.bg.subtle, true: colors.primary.DEFAULT }}
            />
          </View>

          {/* Vibration */}
          <View style={styles.settingRow}>
            <View style={[styles.iconWrap, { backgroundColor: colors.bg.subtle }]}>
              <Vibrate size={20} color={colors.text.DEFAULT} />
            </View>
            <View style={styles.settingTextGroup}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                Vibration continue
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Recommandé à moto ou dans le trafic urbain
              </AppText>
            </View>
            <Switch
              value={prefs.vibrationEnabled}
              onValueChange={(val) => handleToggle('vibrationEnabled', val)}
              trackColor={{ false: colors.bg.subtle, true: colors.primary.DEFAULT }}
            />
          </View>
        </View>

        {/* Bouton de test */}
        <AppPressable
          haptic="medium"
          onPress={handleTestAlert}
          style={[styles.testButton, isPlayingTest && styles.testButtonActive]}
        >
          {isPlayingTest ? (
            <Square size={18} color={colors.text.inverse} />
          ) : (
            <Play size={18} color={colors.text.inverse} />
          )}
          <AppText variant="bodyStrong" color={colors.text.inverse}>
            {isPlayingTest ? 'Arrêter le test sonore' : 'Tester l’alerte sonore et vocale'}
          </AppText>
        </AppPressable>

        <AppText variant="caption" color={colors.text.subtle} style={styles.footerNote}>
          En cas de conduite, le téléphone diffuse l'alerte même écran verrouillé grâce au canal
          haute priorité.
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.DEFAULT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.families.bold,
  },
  headerRightSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: spacing[4],
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
    borderRadius: radii.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  infoIcon: {
    marginRight: spacing[3],
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  sectionLabel: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  cardGroup: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  settingTextGroup: {
    flex: 1,
    marginRight: spacing[2],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radii.xl,
    paddingVertical: spacing[4],
    marginBottom: spacing[3],
  },
  testButtonActive: {
    backgroundColor: colors.status.error,
  },
  footerNote: {
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
});
