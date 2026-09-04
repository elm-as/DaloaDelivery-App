import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ChevronRight, User, MapPin } from 'lucide-react-native';
import { colors, radii, spacing, AppText } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { supabase } from '@daloa/api';
import { DeliveryTopBar } from '../../src/components/DeliveryTopBar';
import { HomeTransportCategories } from '../../src/components/HomeTransportCategories';
import { DeliveryPersonCard, DeliveryPersonData } from '../../src/components/DeliveryPersonCard';
import { useDriverAuth } from '../../src/context/DriverAuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useDriverAuth();
  const [onlineLivreurs, setOnlineLivreurs] = useState<DeliveryPersonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOnlineLivreurs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_persons')
        .select('*')
        .order('rating', { ascending: false })
        .limit(6);

      if (!error && data) {
        setOnlineLivreurs(data);
      }
    } catch (err) {
      console.error('Erreur chargement livreurs en ligne:', err);
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
            colors={['#FF6B00']}
            tintColor="#FF6B00"
          />
        }
      >
        {/* Hero Section Gradient Orange Incurvé */}
        <LinearGradient
          colors={['#FFA726', '#FF9800', '#E65100']}
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
              <User size={20} color="#FFFFFF" />
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
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSearchPress}
            style={styles.floatingSearch}
          >
            <View style={styles.searchIconWrap}>
              <Search size={18} color="#FF6B00" strokeWidth={2.4} />
            </View>
            <Text style={styles.searchPlaceholder}>
              Rechercher un livreur, un quartier à Daloa...
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4 Moyens de transport */}
        <HomeTransportCategories onSelectCategory={handleCategorySelect} />

        {/* Section Livreurs en ligne */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>LIVREURS EN LIGNE</Text>
            <View style={styles.onlinePulseDot} />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/annuaire')}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>
              Voir tout ({onlineLivreurs.length}+)
            </Text>
            <ChevronRight size={14} color="#FF6B00" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Liste des livreurs en ligne */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#FF6B00" />
            <Text style={styles.loadingText}>Recherche des coursiers disponibles...</Text>
          </View>
        ) : onlineLivreurs.length === 0 ? (
          <View style={styles.emptyBox}>
            <MapPin size={24} color="#9CA3AF" />
            <Text style={styles.emptyText}>Aucun livreur actuellement en ligne à Daloa.</Text>
          </View>
        ) : (
          onlineLivreurs.slice(0, 4).map((livreur) => (
            <DeliveryPersonCard
              key={livreur.id}
              person={livreur}
              mode="compact"
            />
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroGradient: {
    paddingTop: spacing[4],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[9],
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
    backgroundColor: '#10B981',
  },
  expressText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
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
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
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
    backgroundColor: '#FFFFFF',
    borderRadius: radii['2xl'],
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 10,
  },
  searchIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#9CA3AF',
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
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.6,
  },
  onlinePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B00',
  },
  loadingBox: {
    padding: spacing[6],
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii['2xl'],
    padding: spacing[6],
    marginHorizontal: spacing[4],
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
});
