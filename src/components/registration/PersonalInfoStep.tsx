import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { User, Phone, Camera, Wallet } from 'lucide-react-native';
import { colors, radii, spacing, Input } from '@daloa/ui';

const PAYOUT_NETWORKS = [
  { id: 'wave', label: 'Wave', color: '#1BA8E0' },
  { id: 'mtn', label: 'MTN MoMo', color: '#FFCC00' },
  { id: 'orange', label: 'Orange Money', color: '#FF7900' },
  { id: 'moov', label: 'Moov Money', color: '#005CA9' },
];

interface Props {
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  photoUri: string | null;
  onPickPhoto: () => void;
  payoutNetwork: string;
  setPayoutNetwork: (val: string) => void;
  payoutNumber: string;
  setPayoutNumber: (val: string) => void;
}

export const PersonalInfoStep: React.FC<Props> = ({
  fullName,
  setFullName,
  phone,
  setPhone,
  photoUri,
  onPickPhoto,
  payoutNetwork,
  setPayoutNetwork,
  payoutNumber,
  setPayoutNumber,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Informations personnelles & Gains</Text>
      <Text style={styles.stepSubtitle}>
        Vos coordonnées et votre compte Mobile Money pour recevoir vos paiements de courses.
      </Text>

      {/* Zone Photo de profil */}
      <View style={styles.photoContainer}>
        <TouchableOpacity
          onPress={onPickPhoto}
          style={styles.avatarWrapper}
          activeOpacity={0.8}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={36} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Camera size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPickPhoto} activeOpacity={0.7}>
          <Text style={styles.changePhotoText}>
            {photoUri ? 'Modifier la photo' : 'Ajouter une photo de profil *'}
          </Text>
        </TouchableOpacity>
      </View>

      <Input
        label="Nom & Prénoms *"
        placeholder="Ex: Koffi Emmanuel"
        value={fullName}
        onChangeText={setFullName}
        leftIcon={<User size={16} color={colors.text.subtle} />}
      />

      <Input
        label="Numéro de téléphone (+225) *"
        placeholder="Ex: 07 01 02 03 04"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        leftIcon={<Phone size={16} color={colors.text.subtle} />}
      />

      {/* Réseau de paiement pour les reversements */}
      <View style={styles.payoutSection}>
        <View style={styles.payoutHeader}>
          <Wallet size={16} color="#FF6B00" />
          <Text style={styles.payoutTitle}>Moyen de retrait des gains *</Text>
        </View>

        <View style={styles.networksRow}>
          {PAYOUT_NETWORKS.map((net) => {
            const isSelected = payoutNetwork === net.id;
            return (
              <TouchableOpacity
                key={net.id}
                onPress={() => setPayoutNetwork(net.id)}
                style={[
                  styles.networkPill,
                  isSelected && styles.networkPillActive,
                ]}
                activeOpacity={0.8}
              >
                <View style={[styles.networkDot, { backgroundColor: net.color }]} />
                <Text
                  style={[
                    styles.networkPillText,
                    isSelected && styles.networkPillTextActive,
                  ]}
                >
                  {net.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Numéro Mobile Money pour vos retraits *"
          placeholder="Ex: 07 01 02 03 04 (Wave, MTN...)"
          value={payoutNumber}
          onChangeText={setPayoutNumber}
          keyboardType="phone-pad"
          leftIcon={<Wallet size={16} color={colors.text.subtle} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing[3] },
  stepTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  stepSubtitle: { fontSize: 12, color: '#6B7280', marginTop: -4, marginBottom: 8 },
  photoContainer: {
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: 8,
  },
  avatarWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FF6B00',
    overflow: 'visible',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B00',
  },
  payoutSection: {
    marginTop: spacing[2],
    backgroundColor: '#F9FAFB',
    padding: spacing[3],
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  payoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payoutTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
  },
  networksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  networkPillActive: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FF6B00',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  networkPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  networkPillTextActive: {
    color: '#E65100',
    fontWeight: '800',
  },
});
