import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Star,
  Bike,
  Car,
  Truck,
  MapPin,
  ShieldCheck,
  Calendar,
} from 'lucide-react-native';
import { colors, radii, spacing, ProBadge, RevealablePhone } from '@daloa/ui';
import { supabase, driverReviewsService, DriverReview } from '@daloa/api';
import { DeliveryTopBar } from '../../src/components/DeliveryTopBar';
import { directoryDetailStyles as styles } from '../../src/components/directory/directoryDetailStyles';

export default function DelivererDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [deliverer, setDeliverer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<DriverReview[]>([]);

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
        // Les avis livreurs vivent dans `delivery_person_reviews`, table
        // distincte de `reviews` (avis marketplace).
        try {
          const res = await driverReviewsService.getReviews(id, 1, 10);
          setReviews(res.reviews);
        } catch {
          setReviews([]);
        }
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
          <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
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
          colors={isOnline ? [colors.primary[400], colors.primary.DEFAULT, colors.primary[700]] : [colors.grey[600], colors.text.body, colors.grey[800]]}
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
                { backgroundColor: isOnline ? colors.status.success : colors.text.subtle },
              ]}
            />
          </View>

          {/* Nom & Badge vérifié */}
          <View style={styles.nameRow}>
            <Text style={styles.heroName}>{deliverer.name}</Text>
            {isVerified && (
              <ProBadge variant="deliverer" iconOnly size="sm" />
            )}
          </View>

          {/* Statut de disponibilité */}
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusPillDot,
                { backgroundColor: isOnline ? colors.status.success : colors.text.subtle },
              ]}
            />
            <Text style={styles.statusPillText}>
              {isOnline ? 'Disponible pour vos courses' : 'Actuellement indisponible'}
            </Text>
          </View>

          {/* Type de véhicule */}
          <View style={styles.vehiclePill}>
            <Bike size={14} color={colors.text.inverse} strokeWidth={2.2} />
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
                <Text style={styles.statValue}>
                  {deliverer.total_reviews && deliverer.total_reviews > 0 && deliverer.rating != null
                    ? Number(deliverer.rating).toFixed(1)
                    : '-'}
                </Text>
                <Star
                  size={14}
                  color={deliverer.total_reviews && deliverer.total_reviews > 0 ? colors.status.warning : colors.grey[300]}
                  fill={deliverer.total_reviews && deliverer.total_reviews > 0 ? colors.status.warning : 'transparent'}
                />
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

        {/* Contact : le numéro reste masqué tant qu'on ne le demande pas. */}
        <View style={styles.contactBlock}>
          <RevealablePhone
            phone={deliverer.phone}
            whatsappMessage={`Bonjour ${deliverer.name}, je vous contacte via DaloaDelivery pour une course.`}
          />
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
                <MapPin size={12} color={colors.primary[700]} />
                <Text style={styles.zoneChipText}>{zone}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* À propos — alimenté par le champ « Présentation » du profil livreur */}
        {deliverer.description ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>À propos</Text>
            <Text style={styles.infoBody}>{deliverer.description}</Text>
          </View>
        ) : null}

        {/* Tarifs annoncés par le livreur lui-même */}
        {deliverer.pricing_description ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Tarifs & informations</Text>
            <Text style={styles.infoBody}>{deliverer.pricing_description}</Text>
          </View>
        ) : null}

        {/* Certification : livreur vérifié en bleu ou profil standard */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isVerified ? '#EFF6FF' : colors.status.warningLight,
              borderColor: isVerified ? '#BFDBFE' : colors.status.warningBorder,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Text
              style={[
                styles.infoTitle,
                { color: isVerified ? '#1D4ED8' : colors.status.warningDark, marginBottom: 0 },
              ]}
            >
              {isVerified ? 'Livreur vérifié' : 'Profil standard'}
            </Text>
            {isVerified && <ProBadge variant="deliverer" iconOnly size="xs" />}
          </View>
          <Text
            style={[
              styles.infoBody,
              { color: isVerified ? '#1E40AF' : colors.status.warningDark },
            ]}
          >
            {isVerified
              ? 'Son identité a été contrôlée par DaloaDelivery : pièce d’identité et portrait vérifiés.'
              : 'En attente de certification officielle. Ce coursier n’a pas encore fait vérifier ses pièces d’identité.'}
          </Text>
        </View>

        {/* Avis reçus */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Avis {reviews.length > 0 ? `(${reviews.length})` : ''}
          </Text>
          {reviews.length === 0 ? (
            <Text style={styles.infoBody}>
              Aucun avis pour le moment. Les clients pourront noter ce coursier après leurs courses.
            </Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id} style={styles.reviewRow}>
                <View style={styles.reviewHead}>
                  <Text style={styles.reviewAuthor}>{r.reviewer_name || 'Client'}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={13}
                        color={n <= r.rating ? colors.status.warning : colors.border.strong}
                        fill={n <= r.rating ? colors.status.warning : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
                {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
