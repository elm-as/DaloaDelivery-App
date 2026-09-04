import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Star, ChevronRight, Bike, Car, Truck } from 'lucide-react-native';
import { colors, radii, spacing, AppText } from '@daloa/ui';
import { Haptics } from '@daloa/utils';

export interface DeliveryPersonData {
  id: string;
  name: string;
  phone?: string;
  photo_url?: string | null;
  vehicle_type?: string;
  rating?: number;
  total_reviews?: number;
  is_available?: boolean;
  is_verified?: boolean;
  verification_status?: string;
  coverage_zones?: string[];
  district?: string;
}

interface DeliveryPersonCardProps {
  person: DeliveryPersonData;
  mode?: 'full' | 'compact';
}

export const DeliveryPersonCard: React.FC<DeliveryPersonCardProps> = ({
  person,
  mode = 'full',
}) => {
  const router = useRouter();

  const isOnline = person.is_available ?? false;
  const isVerified = person.is_verified || person.verification_status === 'approved';
  const ratingVal = (person.rating ?? 0).toFixed(1);
  const totalRev = person.total_reviews ?? 0;
  const vehicle = person.vehicle_type || 'Moto';

  const cleanPhone = person.phone ? person.phone.replace(/[^0-9]/g, '') : '';

  const handleWhatsApp = () => {
    Haptics.selection();
    if (!cleanPhone) return;
    const phoneWithCountry = cleanPhone.startsWith('225') ? cleanPhone : `225${cleanPhone}`;
    const text = encodeURIComponent(`Bonjour ${person.name}, j'ai besoin d'une livraison via DaloaDelivery.`);
    Linking.openURL(`https://wa.me/${phoneWithCountry}?text=${text}`);
  };

  const handleOpenDetail = () => {
    Haptics.lightImpact();
    router.push(`/directory/${person.id}` as any);
  };

  const renderVehicleIcon = () => {
    const v = vehicle.toLowerCase();
    if (v.includes('vélo') || v.includes('velo')) {
      return <Bike size={12} color="#4B5563" strokeWidth={2.2} />;
    }
    if (v.includes('voiture') || v.includes('car')) {
      return <Car size={12} color="#4B5563" strokeWidth={2.2} />;
    }
    if (v.includes('triporteur')) {
      return <Truck size={12} color="#4B5563" strokeWidth={2.2} />;
    }
    return <Bike size={12} color="#4B5563" strokeWidth={2.2} />;
  };

  const firstZone = person.district || (person.coverage_zones && person.coverage_zones[0]);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handleOpenDetail}
      style={styles.card}
    >
      {/* Avatar avec pastille statut */}
      <View style={styles.avatarContainer}>
        {person.photo_url ? (
          <Image source={{ uri: person.photo_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>
              {person.name ? person.name.charAt(0).toUpperCase() : 'L'}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isOnline ? '#10B981' : '#9CA3AF' },
          ]}
        />
      </View>

      {/* Informations coursier */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {person.name || 'Coursier Daloa'}
          </Text>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedCheck}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.ratingBox}>
            <Star size={11} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{ratingVal}</Text>
            {mode === 'full' && (
              <Text style={styles.reviewCount}>({totalRev})</Text>
            )}
          </View>

          <Text style={styles.bullet}>·</Text>

          <View style={styles.vehicleBox}>
            {renderVehicleIcon()}
            <Text style={styles.vehicleText}>{vehicle}</Text>
          </View>

          {firstZone && (
            <>
              <Text style={styles.bullet}>·</Text>
              <Text style={styles.zoneText} numberOfLines={1}>
                {firstZone}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Actions à droite */}
      {mode === 'full' ? (
        <View style={styles.actionButtons}>
          {cleanPhone ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleWhatsApp}
              style={styles.whatsappBtn}
              accessibilityLabel="Contacter sur WhatsApp"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="#10B981">
                <Path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </Svg>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenDetail}
            style={styles.chevronBtn}
            accessibilityLabel="Voir le profil"
          >
            <ChevronRight size={18} color="#4B5563" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.compactVoirBtn}>
          <Text style={styles.compactVoirText}>Voir</Text>
          <ChevronRight size={14} color="#374151" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii['2xl'],
    padding: spacing[3],
    marginHorizontal: spacing[4],
    marginBottom: spacing[2.5],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
    width: 46,
    height: 46,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3F4F6',
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E65100',
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 3,
    gap: 4,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
    fontVariant: ['tabular-nums'],
  },
  reviewCount: {
    fontSize: 11,
    color: '#9CA3AF',
    fontVariant: ['tabular-nums'],
  },
  bullet: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  vehicleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  zoneText: {
    fontSize: 11,
    color: '#6B7280',
    maxWidth: 80,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whatsappBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactVoirBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: '#F3F4F6',
  },
  compactVoirText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
});
