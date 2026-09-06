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
import { annuaireStyles as styles } from '../../src/components/annuaire/annuaireStyles';

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
      let query = supabase.from('delivery_persons_directory').select('*').order('rating', { ascending: false });

      const { data, error } = await query;
      if (!error && data) {
        const validDrivers = data.filter(
          (d: any) => Boolean(d.name?.trim() && d.phone?.trim())
        );
        setLivreurs(validDrivers);
      }
    } catch (err) {
      console.warn('Erreur chargement annuaire:', err);
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
