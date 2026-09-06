import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, Header, radii, AppText } from '@daloa/ui';
import { Shield, CheckCircle2 } from 'lucide-react-native';
import { DRIVER_PRIVACY_SECTIONS, DRIVER_PRIVACY_LAST_UPDATE } from '../../src/legal/privacy-data';

export default function DriverPrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Confidentialité des Données" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerCard}>
          <View style={styles.bannerIcon}>
            <Shield size={24} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.bannerContent}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Protection des Données Livreurs
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Dernière mise à jour : {DRIVER_PRIVACY_LAST_UPDATE} • Daloa, Côte d'Ivoire
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          {DRIVER_PRIVACY_SECTIONS.map((section, idx) => {
            const isLast = idx === DRIVER_PRIVACY_SECTIONS.length - 1;

            return (
              <View key={section.id} style={[styles.sectionWrap, !isLast && styles.sectionDivider]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.numberBadge}>
                    <AppText variant="bodyStrong" color={colors.primary.DEFAULT}>
                      {section.number}
                    </AppText>
                  </View>
                  <View style={styles.headerTextWrap}>
                    <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                      {section.title}
                    </AppText>
                    <AppText variant="caption" color={colors.text.muted}>
                      {section.summary}
                    </AppText>
                  </View>
                </View>

                <View style={styles.sectionBody}>
                  {section.paragraphs.map((p, pIdx) => (
                    <AppText key={pIdx} variant="caption" color={colors.text.DEFAULT} style={styles.paragraph}>
                      {p}
                    </AppText>
                  ))}

                  {section.bullets && section.bullets.length > 0 && (
                    <View style={styles.bulletsWrap}>
                      {section.bullets.map((b, bIdx) => (
                        <View key={bIdx} style={styles.bulletRow}>
                          <CheckCircle2 size={13} color={colors.primary.DEFAULT} style={styles.bulletIcon} />
                          <AppText variant="caption" color={colors.text.DEFAULT} style={styles.bulletText}>
                            {b}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing[4],
    backgroundColor: '#F8F9FA',
    paddingBottom: spacing[8],
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: spacing[3],
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 127, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  bannerContent: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionWrap: {
    paddingVertical: spacing[3],
  },
  sectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 127, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  headerTextWrap: {
    flex: 1,
  },
  sectionBody: {
    paddingLeft: spacing[8],
    gap: spacing[2],
  },
  paragraph: {
    lineHeight: 18,
    color: '#374151',
  },
  bulletsWrap: {
    marginTop: spacing[1],
    gap: spacing[1],
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletIcon: {
    marginTop: 2,
    marginRight: spacing[2],
  },
  bulletText: {
    flex: 1,
    lineHeight: 17,
    color: '#4B5563',
  },
});
