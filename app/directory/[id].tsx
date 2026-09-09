import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  Star,
  Phone,
  Bike,
  Car,
  Truck,
  MapPin,
  ShieldCheck,
  Calendar,
} from 'lucide-react-native';
import { colors, radii, spacing } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { supabase } from '@daloa/api';
import { DeliveryTopBar } from '../../src/components/DeliveryTopBar';
import { directoryDetailStyles as styles } from '../../src/components/directory/directoryDetailStyles';

export default function DelivererDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [deliverer, setDeliverer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!id) return;
      try {
        const { data } = await supabase
          .from('delivery_persons_directory')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        setDeliverer(data);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <DeliveryTopBar title="Profil Livreur" showBack onBack={() => router.back()} />
        <View style={styles.centerLoading}>
          <ActivityIndicator size="small" color="#FF6B00" />
        </View>
      </SafeAreaView>
    );
  }

  if (!deliverer) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <DeliveryTopBar title="Profil Livreur" showBack onBack={() => router.back()} />
        <View style={styles.centerLoading}>
          <Text style={styles.notFoundText}>Livreur introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOnline = deliverer.is_available ?? false;
  const isVerified = deliverer.is_verified || deliverer.verification_status === 'approved';
  const cleanPhone = deliverer.phone ? deliverer.phone.replace(/[^0-9]/g, '') : '';

  const handleWhatsApp = () => {
    Haptics.success();
    if (!cleanPhone) return;
    const phoneWithCountry = cleanPhone.startsWith('225') ? cleanPhone : `225${cleanPhone}`;
    const text = encodeURIComponent(`Bonjour ${deliverer.name}, je vous contacte via DaloaDelivery pour une course.`);
    Linking.openURL(`https://wa.me/${phoneWithCountry}?text=${text}`);
  };

  const handleCall = () => {
    Haptics.lightImpact();
    if (deliverer.phone) {
      Linking.openURL(`tel:${deliverer.phone}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DeliveryTopBar
        title="Profil Livreur"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Hero Courbé */}
        <LinearGradient
          colors={isOnline ? ['#FFA726', '#FF9800', '#E65100'] : ['#4B5563', '#374151', '#1F2937']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.heroGradient}
        >
          {/* Avatar avec bague blanche */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              {deliverer.photo_url && !deliverer.photo_url.startsWith('blob:') ? (
                <Image source={{ uri: deliverer.photo_url }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {deliverer.name ? deliverer.name.charAt(0).toUpperCase() : 'L'}
                  </Text>
                </View>
              )}
            </View>
            <View
              style={[
                styles.statusDotLarge,
                { backgroundColor: isOnline ? '#10B981' : '#9CA3AF' },
              ]}
            />
          </View>

          {/* Nom & Badge vérifié */}
          <View style={styles.nameRow}>
            <Text style={styles.heroName}>{deliverer.name}</Text>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedCheck}>✓</Text>
              </View>
            )}
          </View>

          {/* Statut de disponibilité */}
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusPillDot,
                { backgroundColor: isOnline ? '#10B981' : '#9CA3AF' },
              ]}
            />
            <Text style={styles.statusPillText}>
              {isOnline ? 'Disponible pour vos courses' : 'Actuellement indisponible'}
            </Text>
          </View>

          {/* Type de véhicule */}
          <View style={styles.vehiclePill}>
            <Bike size={14} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.vehiclePillText}>
              {deliverer.vehicle_type?.toUpperCase() || 'MOTO'}
            </Text>
          </View>
        </LinearGradient>

        {/* Bandeau de statistiques chevauchant */}
        <View style={styles.statsOverlap}>
          <View style={styles.statsCard}>
            <View style={styles.statCol}>
              <View style={styles.statRatingRow}>
                <Text style={styles.statValue}>{(deliverer.rating || 5.0).toFixed(1)}</Text>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
              </View>
              <Text style={styles.statLabel}>NOTE</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text style={styles.statValue}>{deliverer.total_reviews || 0}</Text>
              <Text style={styles.statLabel}>AVIS</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text style={styles.statValue}>{deliverer.total_deliveries || 0}</Text>
              <Text style={styles.statLabel}>COURSES</Text>
            </View>
          </View>
        </View>

        {/* Boutons d'action : WhatsApp & Appel direct */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleWhatsApp}
            style={styles.whatsappActionBtn}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF">
              <Path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </Svg>
            <Text style={styles.whatsappActionText}>Discuter sur WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleCall}
            style={styles.callActionBtn}
          >
            <Phone size={18} color="#374151" />
            <Text style={styles.callActionText}>Appeler</Text>
          </TouchableOpacity>
        </View>

        {/* Zones de couverture */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Zones de livraison à Daloa</Text>
          <View style={styles.zonesWrap}>
            {(deliverer.coverage_zones && deliverer.coverage_zones.length > 0
              ? deliverer.coverage_zones
              : ['Centre-ville', 'Tazibouo', 'Soleil', 'Abattoir', 'Kennedy']
            ).map((zone: string) => (
              <View key={zone} style={styles.zoneChip}>
                <MapPin size={12} color="#E65100" />
                <Text style={styles.zoneChipText}>{zone}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
