import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, Header, radii, AppText, AppPressable } from '@daloa/ui';
import { ChevronDown, CheckCircle2, ShieldCheck, FileText } from 'lucide-react-native';
import { DRIVER_TERMS_ARTICLES, DRIVER_TERMS_LAST_UPDATE } from '../../src/legal/terms-data';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DriverTermsScreen() {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['acceptance', 'course-lifecycle', 'tariffs-payouts']));

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds(new Set(DRIVER_TERMS_ARTICLES.map((a) => a.id)));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Conditions & Charte Livreur" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerCard}>
          <View style={styles.bannerIcon}>
            <ShieldCheck size={24} color={colors.primary.DEFAULT} />
          </View>
          <View style={styles.bannerContent}>
            <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
              Charte Officielle du Coursier Partenaire
            </AppText>
            <AppText variant="caption" color={colors.text.muted}>
              Dernière mise à jour : {DRIVER_TERMS_LAST_UPDATE} • Daloa, Côte d'Ivoire
            </AppText>
          </View>
        </View>

        <View style={styles.actionBar}>
          <AppText variant="caption" color={colors.text.muted}>
            {DRIVER_TERMS_ARTICLES.length} articles contractuels
          </AppText>
          <AppPressable onPress={expandAll} haptic="light">
            <AppText variant="caption" color={colors.primary.DEFAULT} style={styles.expandText}>
              Tout afficher
            </AppText>
          </AppPressable>
        </View>

        <View style={styles.card}>
          {DRIVER_TERMS_ARTICLES.map((article, idx) => {
            const isExpanded = expandedIds.has(article.id);
            const isLast = idx === DRIVER_TERMS_ARTICLES.length - 1;

            return (
              <View key={article.id} style={[styles.articleWrap, !isLast && styles.articleDivider]}>
                <AppPressable
                  onPress={() => toggleExpand(article.id)}
                  style={styles.articleHeader}
                  haptic="light"
                  accessibilityLabel={`Article ${article.number} ${article.title}`}
                >
                  <View style={styles.numberBadge}>
                    <AppText variant="bodyStrong" color={colors.primary.DEFAULT}>
                      {article.number}
                    </AppText>
                  </View>
                  <View style={styles.articleHeaderText}>
                    <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                      {article.title}
                    </AppText>
                    <AppText variant="caption" color={colors.text.muted} numberOfLines={isExpanded ? undefined : 1}>
                      {article.summary}
                    </AppText>
                  </View>
                  <View style={[styles.chevronWrap, isExpanded && styles.chevronRotated]}>
                    <ChevronDown size={18} color="#9CA3AF" />
                  </View>
                </AppPressable>

                {isExpanded && (
                  <View style={styles.articleBody}>
                    {article.paragraphs.map((p, pIdx) => (
                      <AppText key={pIdx} variant="caption" color={colors.text.DEFAULT} style={styles.paragraph}>
                        {p}
                      </AppText>
                    ))}

                    {article.bullets && article.bullets.length > 0 && (
                      <View style={styles.bulletsWrap}>
                        {article.bullets.map((b, bIdx) => (
                          <View key={bIdx} style={styles.bulletRow}>
                            <CheckCircle2 size={14} color={colors.primary.DEFAULT} style={styles.bulletIcon} />
                            <AppText variant="caption" color={colors.text.DEFAULT} style={styles.bulletText}>
                              {b}
                            </AppText>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
    paddingHorizontal: spacing[1],
  },
  expandText: {
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  articleWrap: {
    paddingVertical: spacing[2],
  },
  articleDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 127, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  articleHeaderText: {
    flex: 1,
  },
  chevronWrap: {
    marginLeft: spacing[2],
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  articleBody: {
    paddingLeft: spacing[8],
    paddingRight: spacing[2],
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  paragraph: {
    lineHeight: 19,
    color: '#374151',
  },
  bulletsWrap: {
    marginTop: spacing[2],
    gap: 6,
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
    lineHeight: 18,
    color: '#4B5563',
  },
});
