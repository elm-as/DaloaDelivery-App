import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ChevronRight, User, MapPin } from 'lucide-react-native';
import { colors, radii, spacing, AppText, typography } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { supabase } from '@daloa/api';
import { DeliveryTopBar } from '../../src/components/DeliveryTopBar';
import { HomeTransportCategories } from '../../src/components/HomeTransportCategories';
import { DeliveryPersonCard, DeliveryPersonData } from '../../src/components/DeliveryPersonCard';
import { useDriverAuth } from '../../src/context/DriverAuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, driverProfile, isAdmin } = useDriverAuth();

  const [onlineLivreurs, setOnlineLivreurs] = useState<DeliveryPersonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOnlineLivreurs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_persons_directory')
        .select('*')
        .eq('is_available', true);

      if (!error && data) {
        const validDrivers = data.filter(
          (d: any) => Boolean(d.name?.trim() && d.phone?.trim())
        );
        // Mélange impartial pour donner une chance égale à chaque livreur
        const shuffled = [...validDrivers];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = shuffled[i];
          shuffled[i] = shuffled[j];
          shuffled[j] = temp;
        }
        shuffled.sort((a: any, b: any) => {
          const aVer = a.is_verified || a.verification_status === 'approved' ? 1 : 0;
          const bVer = b.is_verified || b.verification_status === 'approved' ? 1 : 0;
          if (bVer !== aVer) return bVer - aVer;
          if (a.rating > 0 || b.rating > 0) return b.rating - a.rating;
          return 0;
        });
        // Vue `delivery_persons_directory` : colonnes toutes nullables côté types.
        setOnlineLivreurs(shuffled as unknown as DeliveryPersonData[]);
      }
    } catch (err) {
      console.warn('Erreur chargement livreurs en ligne:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOnlineLivreurs();
  }, [fetchOnlineLivreurs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOnlineLivreurs();
  };

  const handleSearchPress = () => {
    Haptics.lightImpact();
    router.push('/(tabs)/annuaire');
  };

  const handleCategorySelect = (category: string) => {
    Haptics.selection();
    router.push({
      pathname: '/(tabs)/annuaire',
      params: { type: category },
    } as any);
  };

  const handleProfilePress = () => {
    Haptics.lightImpact();
    if (isAuthenticated) {
      router.push('/(tabs)/livreur');
    } else {
      router.push('/auth/login' as any);
    }
  };

  // Un livreur (ou un admin) connecte n'a pas d'accueil public : il est renvoye
  // vers sa console, qui tient lieu d'« Accueil » comme sur le web.
  // Place apres les hooks — un retour anticipe en tete de composant changeait le
  // nombre de hooks rendus des que la session se resolvait, et faisait planter React.
  if (isAuthenticated && isAdmin) {
    return <Redirect href={'/admin' as any} />;
  }
  if (isAuthenticated && driverProfile) {
    return <Redirect href="/(tabs)/livreur" />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar avec Logo, 3-points et Cloche */}
      <DeliveryTopBar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.DEFAULT]}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {/* Hero Section Gradient Orange Incurvé */}
        <LinearGradient
          colors={[colors.primary[400], colors.primary.DEFAULT, colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.heroGradient}
        >
          {/* Ligne haute : Badge Service Express & Bouton Profil */}
          <View style={styles.heroTopRow}>
            <View style={styles.expressBadge}>
              <View style={styles.expressDot} />
              <Text style={styles.expressText}>SERVICE EXPRESS DALOA</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleProfilePress}
              style={styles.profileBtn}
              accessibilityLabel="Espace compte"
            >
              <User size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>

          {/* Titre & Sous-titre */}
          <Text style={styles.heroTitle}>
            Que souhaitez-vous{'\n'}faire livrer ?
          </Text>
          <Text style={styles.heroSubtitle}>
            Trouvez un livreur disponible à Daloa en quelques secondes.
          </Text>
        </LinearGradient>

        {/* Barre de recherche flottante */}
        <View style={styles.searchWrapper}>
          <TouchableOpacity activeOpacity={0.9} onPress={handleSearchPress} style={styles.floatingSearch}>
            <View style={styles.searchIconWrap}>
              <Search size={18} color={colors.primary.DEFAULT} strokeWidth={2.4} />
            </View>
            <Text style={styles.searchPlaceholder}>Rechercher un livreur, un quartier à Daloa...</Text>
          </TouchableOpacity>
        </View>

        <HomeTransportCategories onSelectCategory={handleCategorySelect} />

        {/* Section Livreurs en ligne */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>LIVREURS EN LIGNE</Text>
            <View style={styles.onlinePulseDot} />
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/annuaire')} style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>Voir tout ({onlineLivreurs.length})</Text>
            <ChevronRight size={14} color={colors.primary.DEFAULT} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Liste des livreurs en ligne */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
            <Text style={styles.loadingText}>Recherche des coursiers disponibles...</Text>
          </View>
        ) : onlineLivreurs.length === 0 ? (
          <View style={styles.emptyBox}>
            <MapPin size={24} color={colors.text.subtle} />
            <Text style={styles.emptyText}>Aucun livreur actuellement en ligne à Daloa.</Text>
          </View>
        ) : (
          <>
            {onlineLivreurs.slice(0, 8).map((livreur) => (
              <DeliveryPersonCard
                key={livreur.id}
                person={livreur}
                mode="compact"
              />
            ))}
            {onlineLivreurs.length > 8 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/annuaire')}
                style={{
                  marginHorizontal: spacing[4],
                  marginTop: 8,
                  paddingVertical: 12,
                  backgroundColor: colors.bg.surface,
                  borderRadius: radii.xl,
                  borderWidth: 1,
                  borderColor: colors.primary[200],
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 6,
                }}
              >
                <Text style={{ color: colors.primary.DEFAULT, fontSize: 12, fontFamily: typography.families.bold }}>
                  Explorer tous les {onlineLivreurs.length} livreurs
                </Text>
                <ChevronRight size={14} color={colors.primary.DEFAULT} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Bloc de conversion coursier — miroir du bandeau de bas d'accueil du web.
            Absent du mobile jusqu'ici : rien n'invitait un motocycliste à
            rejoindre le réseau depuis l'écran public. */}
        <View style={styles.recruitCard}>
          <View style={styles.recruitBadge}>
            <Text style={styles.recruitBadgeText}>OPPORTUNITÉ</Text>
          </View>
          <Text style={styles.recruitTitle}>Vous êtes coursier à Daloa ?</Text>
          <Text style={styles.recruitBody}>
            Rejoignez le réseau DaloaDelivery, recevez des courses directement sur votre
            téléphone et touchez 90 % des frais de livraison.
          </Text>
          <View style={styles.recruitActions}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/devenir-livreur' as any)}
              style={styles.recruitPrimaryBtn}
            >
              <Text style={styles.recruitPrimaryText}>Devenir livreur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/auth/login' as any)}
              style={styles.recruitSecondaryBtn}
            >
              <Text style={styles.recruitSecondaryText}>Espace livreur</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  recruitCard: {
    marginHorizontal: spacing[4],
    marginTop: spacing[5],
    padding: spacing[4],
    borderRadius: radii['2xl'],
    backgroundColor: colors.bg.inverse,
    overflow: 'hidden',
  },
  recruitBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: colors.primary[700],
    marginBottom: spacing[2],
  },
  recruitBadgeText: {
    fontSize: 9.5,
    fontFamily: typography.families.black,
    letterSpacing: 1,
    color: colors.primary[200],
  },
  recruitTitle: {
    fontSize: 17,
    fontFamily: typography.families.black,
    color: colors.text.inverse,
    marginBottom: 4,
  },
  recruitBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.grey[300],
    marginBottom: spacing[3],
  },
  recruitActions: {
    flexDirection: 'row',
    gap: 10,
  },
  recruitPrimaryBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radii.xl,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
  },
  recruitPrimaryText: {
    fontSize: 12.5,
    fontFamily: typography.families.extrabold,
    color: colors.text.inverse,
  },
  recruitSecondaryBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radii.xl,
    backgroundColor: colors.grey[800],
    borderWidth: 1,
    borderColor: colors.grey[700],
    alignItems: 'center',
  },
  recruitSecondaryText: {
    fontSize: 12.5,
    fontFamily: typography.families.extrabold,
    color: colors.text.inverse,
  },
  container: {
    flex: 1,
    backgroundColor: colors.grey[50],
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroGradient: {
    paddingTop: spacing[4],
    paddingHorizontal: spacing[4],
    paddingBottom: 36,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: 'relative',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  expressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    gap: 6,
  },
  expressDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.status.success,
  },
  expressText: {
    fontSize: 10,
    fontFamily: typography.families.black,
    color: colors.text.inverse,
    letterSpacing: 0.6,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: typography.families.black,
    color: colors.text.inverse,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 12.5,
    fontFamily: typography.families.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    lineHeight: 18,
  },
  searchWrapper: {
    paddingHorizontal: spacing[4],
    marginTop: -22,
    zIndex: 20,
  },
  floatingSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.bg.subtle,
    gap: 10,
  },
  searchIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: 12.5,
    fontFamily: typography.families.medium,
    color: colors.text.subtle,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: typography.families.black,
    color: colors.text.DEFAULT,
    letterSpacing: 0.6,
  },
  onlinePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.status.success,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: typography.families.extrabold,
    color: colors.primary.DEFAULT,
  },
  loadingBox: { padding: spacing[6], alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 12, color: colors.text.muted, fontFamily: typography.families.medium },
  emptyBox: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    padding: spacing[6],
    marginHorizontal: spacing[4],
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderStyle: 'dashed',
  },
  emptyText: { fontSize: 12, color: colors.text.muted, fontFamily: typography.families.medium, textAlign: 'center' },
});
