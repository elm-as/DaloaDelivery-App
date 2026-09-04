import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, SlidersHorizontal, List, Map as MapIcon, X, Bike } from 'lucide-react-native';
import { colors, radii, spacing } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { supabase } from '@daloa/api';
import { DeliveryTopBar } from '../../src/components/DeliveryTopBar';
import { DeliveryPersonCard, DeliveryPersonData } from '../../src/components/DeliveryPersonCard';

const VEHICLE_FILTERS = ['Tous', 'Moto', 'Vélo', 'Voiture', 'Triporteur'];

export default function AnnuaireScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>(params.type || 'Tous');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [livreurs, setLivreurs] = useState<DeliveryPersonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Synchronise si un paramètre d'URL `type` arrive
  useEffect(() => {
    if (params.type && VEHICLE_FILTERS.includes(params.type)) {
      setSelectedType(params.type);
    }
  }, [params.type]);

  const fetchLivreurs = useCallback(async () => {
    try {
      let query = supabase.from('delivery_persons').select('*').order('rating', { ascending: false });

      const { data, error } = await query;
      if (!error && data) {
        setLivreurs(data);
      }
    } catch (err) {
      console.error('Erreur chargement annuaire:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLivreurs();
  }, [fetchLivreurs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLivreurs();
  };

  const handleTypeSelect = (type: string) => {
    Haptics.selection();
    setSelectedType(type);
  };

  // Filtrage combiné recherche texte + type véhicule
  const filteredLivreurs = livreurs.filter((l) => {
    const matchesSearch =
      !search.trim() ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.district?.toLowerCase().includes(search.toLowerCase()) ||
      (l.coverage_zones && l.coverage_zones.some((z) => z.toLowerCase().includes(search.toLowerCase())));

    const matchesVehicle =
      selectedType === 'Tous' ||
      l.vehicle_type?.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesVehicle;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* En-tête Annuaire avec flèche retour, logo et cloche */}
      <DeliveryTopBar
        title="Annuaire"
        showBack
        onBack={() => router.push('/(tabs)')}
      />

      {/* Barre de recherche et contrôles */}
      <View style={styles.headerControls}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Search size={16} color="#9CA3AF" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Chercher un livreur, quartier..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={6}>
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => Haptics.lightImpact()}
            accessibilityLabel="Filtres avancés"
          >
            <SlidersHorizontal size={16} color="#374151" />
          </TouchableOpacity>

          {/* Sélecteur Vue Liste / Carte */}
          <View style={styles.viewToggleGroup}>
            <TouchableOpacity
              onPress={() => {
                Haptics.selection();
                setViewMode('list');
              }}
              style={[
                styles.toggleBtn,
                viewMode === 'list' && styles.toggleBtnActive,
              ]}
              accessibilityLabel="Affichage liste"
            >
              <List
                size={16}
                color={viewMode === 'list' ? '#FF6B00' : '#6B7280'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Haptics.selection();
                setViewMode('map');
              }}
              style={[
                styles.toggleBtn,
                viewMode === 'map' && styles.toggleBtnActive,
              ]}
              accessibilityLabel="Affichage carte"
            >
              <MapIcon
                size={16}
                color={viewMode === 'map' ? '#FF6B00' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Puces horizontales de filtre véhicule */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {VEHICLE_FILTERS.map((type) => {
            const isSelected = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                activeOpacity={0.8}
                onPress={() => handleTypeSelect(type)}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Titre compteur */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>
          {filteredLivreurs.length} COURSIER{filteredLivreurs.length > 1 ? 'S' : ''} DISPONIBLE{filteredLivreurs.length > 1 ? 'S' : ''}
        </Text>
      </View>

      {/* Liste des coursiers */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B00']}
            tintColor="#FF6B00"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#FF6B00" />
            <Text style={styles.loadingText}>Chargement de l'annuaire...</Text>
          </View>
        ) : filteredLivreurs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Bike size={28} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Aucun coursier trouvé</Text>
            <Text style={styles.emptyDesc}>
              Essayez un autre mot-clé ou modifiez le filtre de transport.
            </Text>
          </View>
        ) : (
          filteredLivreurs.map((person) => (
            <DeliveryPersonCard
              key={person.id}
              person={person}
              mode="full"
            />
          ))
        )}

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerControls: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2.5],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: radii.xl,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    paddingVertical: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.xl,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: radii.xl,
    padding: 3,
  },
  toggleBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  chipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#FF6B00',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  counterRow: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[1.5],
  },
  counterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  listContent: {
    paddingTop: spacing[1],
    paddingBottom: 24,
  },
  loadingBox: {
    padding: spacing[8],
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii['2xl'],
    padding: spacing[8],
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
