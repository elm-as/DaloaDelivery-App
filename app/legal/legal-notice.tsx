import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, Header, radii, AppText } from '@daloa/ui';
import { Building2 } from 'lucide-react-native';
import { DRIVER_LEGAL_NOTICE_DATA } from '../../src/legal/legal-notice-data';

export default function DriverLegalNoticeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mentions Légales" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerCard}>
          <View style={styles.bannerIcon}>
            <Building2 size={24} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.bannerContent}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Informations Officielles & Juridiques
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Éditeur de DaloaDelivery • Daloa / Abidjan, Côte d'Ivoire
            </AppText>
          </View>
        </View>

        <View style={styles.contentWrap}>
          {DRIVER_LEGAL_NOTICE_DATA.map((group) => (
            <View key={group.id} style={styles.groupCard}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT} style={styles.groupTitle}>
                {group.title}
              </AppText>
              <View style={styles.itemsWrap}>
                {group.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <AppText variant="caption" color={colors.text.muted} style={styles.itemLabel}>
                      {item.label}
                    </AppText>
                    <AppText variant="caption" color={colors.text.DEFAULT} style={styles.itemValue}>
                      {item.value}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          ))}
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
  contentWrap: {
    gap: spacing[3],
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  groupTitle: {
    marginBottom: spacing[2],
    fontSize: 14,
    fontWeight: '700',
  },
  itemsWrap: {
    gap: spacing[2],
  },
  itemRow: {
    paddingVertical: spacing[1],
  },
  itemLabel: {
    fontSize: 11,
    color: colors.text.muted,
  },
  itemValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 1,
  },
});
