import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ChevronRight, User, MapPin } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { supabase } from '@daloa/api';
import { DeliveryTopBar } from '../../src/components/DeliveryTopBar';
import { HomeTransportCategories } from '../../src/components/HomeTransportCategories';
import { DeliveryPersonCard, DeliveryPersonData } from '../../src/components/DeliveryPersonCard';
import { HomeRecruitCard } from '../../src/components/home/HomeRecruitCard';
import { homeStyles as styles } from '../../src/components/home/homeStyles';
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

  // Un livreur (ou un admin) connecté n'a pas d'accueil public : il est renvoyé vers sa console
  if (isAuthenticated && driverProfile) {
    return <Redirect href="/(tabs)/livreur" />;
  }
  if (isAuthenticated && isAdmin) {
    return <Redirect href={'/admin' as any} />;
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

        {/* Bloc de conversion coursier */}
        <HomeRecruitCard />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
