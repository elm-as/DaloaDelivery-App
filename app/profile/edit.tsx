import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, MapPin, Check } from 'lucide-react-native';
import {
  colors,
  radii,
  spacing,
  AppText,
  AppPressable,
  Button,
  useAccent,
  showAlert,
} from '@daloa/ui';
import { VEHICLE_TYPES, normalizeVehicleId, vehicleLabel } from '@daloa/config';
import { deliveryPersonService } from '@daloa/api';
import { Haptics } from '@daloa/utils';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { ZonesSelectionModal } from '../../src/components/registration/ZonesSelectionModal';

/**
 * Modifier mon profil livreur — miroir de `DashboardProfil` du web.
 *
 * Cet écran n'existait pas : aucun écran mobile n'appelait `updateDeliveryPerson`.
 * Un coursier ne pouvait donc corriger ni son nom, ni son téléphone, ni surtout
 * ses zones de couverture depuis l'application — alors que c'est précisément ce
 * qu'on leur demande au téléphone (plusieurs profils déclarent plus de zones
 * qu'il n'en existe à Daloa).
 */
export default function EditDriverProfileScreen() {
  const router = useRouter();
  const accent = useAccent();
  const insets = useSafeAreaInsets();
  const { driverProfile, refreshDriverProfile } = useDriverAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [pricing, setPricing] = useState('');
  const [vehicleType, setVehicleType] = useState('moto');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [zones, setZones] = useState<string[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [zonesOpen, setZonesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Pré-remplissage depuis le profil courant
  useEffect(() => {
    if (!driverProfile) return;
    setName(driverProfile.name ?? '');
    setPhone(driverProfile.phone ?? '');
    setDescription((driverProfile as any).description ?? '');
    setPricing((driverProfile as any).pricing_description ?? '');
    setVehicleType(normalizeVehicleId((driverProfile.vehicle_type as string) || 'moto'));
    setVehicleDetails((driverProfile as any).vehicle_details ?? '');
    setZones(Array.isArray(driverProfile.coverage_zones) ? [...driverProfile.coverage_zones] : []);
    setPhotoUri((driverProfile as any).photo_url ?? null);
  }, [driverProfile]);

  const dirty = useMemo(() => {
    if (!driverProfile) return false;
    const initialZones = Array.isArray(driverProfile.coverage_zones) ? driverProfile.coverage_zones : [];
    return (
      name !== (driverProfile.name ?? '') ||
      phone !== (driverProfile.phone ?? '') ||
      description !== ((driverProfile as any).description ?? '') ||
      pricing !== ((driverProfile as any).pricing_description ?? '') ||
      vehicleType !== normalizeVehicleId((driverProfile.vehicle_type as string) || 'moto') ||
      vehicleDetails !== ((driverProfile as any).vehicle_details ?? '') ||
      zones.length !== initialZones.length ||
      zones.some((z) => !initialZones.includes(z))
    );
  }, [driverProfile, name, phone, description, pricing, vehicleType, vehicleDetails, zones]);

  const toggleZone = (zone: string) =>
    setZones((prev) => (prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]));

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showAlert('Accès refusé', 'Autorisez l’accès à vos photos pour changer votre portrait.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (res.canceled || !res.assets?.[0] || !driverProfile?.user_id) return;

    setUploadingPhoto(true);
    try {
      const url = await deliveryPersonService.uploadProfilePhoto(
        res.assets[0].uri,
        driverProfile.user_id as string,
      );
      await deliveryPersonService.updateDeliveryPerson(driverProfile.id, { photo_url: url } as any);
      setPhotoUri(url);
      await refreshDriverProfile();
      Haptics.success();
    } catch {
      showAlert('Échec', 'La photo n’a pas pu être envoyée. Réessayez.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const save = async () => {
    if (!driverProfile) return;
    if (name.trim().length < 2) {
      showAlert('Nom requis', 'Indiquez le nom sous lequel les commerçants vous reconnaissent.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      showAlert('Numéro invalide', 'Un numéro ivoirien à 10 chiffres est requis.');
      return;
    }
    if (zones.length === 0) {
      showAlert('Zones requises', 'Sélectionnez au moins un quartier que vous couvrez réellement.');
      return;
    }

    setSaving(true);
    try {
      await deliveryPersonService.updateDeliveryPerson(driverProfile.id, {
        name: name.trim(),
        phone: phone.trim(),
        description: description.trim() || null,
        pricing_description: pricing.trim() || null,
        // Même écriture que l'inscription et le site (« Moto ») : la règle du
        // permis de conduire et le site comparent ce libellé.
        vehicle_type: vehicleLabel(vehicleType),
        vehicle_details: vehicleDetails.trim() || null,
        coverage_zones: zones,
      } as any);
      await refreshDriverProfile();
      Haptics.success();
      router.back();
    } catch {
      showAlert('Échec', 'Les modifications n’ont pas pu être enregistrées. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  if (!driverProfile) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={accent.DEFAULT} />
      </View>
    );
  }

  const initials = (name || '?').trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <AppPressable onPress={() => router.back()} rippleBorderless style={styles.backBtn} accessibilityLabel="Retour">
          <ArrowLeft size={20} color={colors.text.DEFAULT} />
        </AppPressable>
        <AppText variant="subtitle" color={colors.text.DEFAULT}>Modifier mon profil</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Portrait */}
        <View style={styles.photoBlock}>
          <AppPressable onPress={pickPhoto} style={styles.photoWrap} accessibilityLabel="Changer ma photo">
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoEmpty, { backgroundColor: accent[50] }]}>
                <AppText variant="title" color={accent[700]}>{initials}</AppText>
              </View>
            )}
            <View style={[styles.photoBadge, { backgroundColor: accent.DEFAULT }]}>
              {uploadingPhoto
                ? <ActivityIndicator size="small" color={colors.text.inverse} />
                : <Camera size={14} color={colors.text.inverse} />}
            </View>
          </AppPressable>
          <AppText variant="caption" color={colors.text.muted}>
            Une photo nette rassure les commerçants
          </AppText>
        </View>

        {/* Identité */}
        <AppText variant="label" color={colors.text.muted} style={styles.sectionHeader}>IDENTITÉ</AppText>
        <View style={styles.card}>
          <Field label="Nom affiché">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex. Fongbe Amadou"
              placeholderTextColor={colors.text.subtle}
              style={styles.input}
            />
          </Field>
          <Field label="Téléphone">
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="07 00 00 00 00"
              placeholderTextColor={colors.text.subtle}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </Field>
          <Field label="Présentation" last>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Deux phrases sur vous et votre façon de travailler"
              placeholderTextColor={colors.text.subtle}
              multiline
              style={[styles.input, styles.inputMultiline]}
            />
          </Field>
        </View>

        {/* Véhicule */}
        <AppText variant="label" color={colors.text.muted} style={styles.sectionHeader}>VÉHICULE</AppText>
        <View style={styles.card}>
          <View style={styles.vehicleRow}>
            {VEHICLE_TYPES.map((v) => {
              const active = vehicleType === v.id;
              return (
                <AppPressable
                  key={v.id}
                  haptic="light"
                  onPress={() => setVehicleType(v.id)}
                  style={[
                    styles.vehicleChip,
                    { borderColor: active ? accent.DEFAULT : colors.border.DEFAULT },
                    active && { backgroundColor: accent[50] },
                  ]}
                  accessibilityLabel={v.label}
                >
                  <AppText
                    variant="caption"
                    color={active ? accent[700] : colors.text.body}
                  >
                    {v.label}
                  </AppText>
                </AppPressable>
              );
            })}
          </View>
          <Field label="Modèle ou marque" last>
            <TextInput
              value={vehicleDetails}
              onChangeText={setVehicleDetails}
              placeholder="Ex. Apsonic rouge"
              placeholderTextColor={colors.text.subtle}
              style={styles.input}
            />
          </Field>
        </View>

        {/* Zones */}
        <AppText variant="label" color={colors.text.muted} style={styles.sectionHeader}>
          ZONES QUE JE COUVRE RÉELLEMENT
        </AppText>
        <View style={styles.card}>
          <AppPressable haptic="light" onPress={() => setZonesOpen(true)} style={styles.zonesRow} accessibilityLabel="Choisir mes zones">
            <MapPin size={18} color={accent.DEFAULT} />
            <View style={styles.flex1}>
              <AppText variant="bodyStrong" color={colors.text.DEFAULT}>
                {zones.length === 0 ? 'Aucune zone' : `${zones.length} quartier${zones.length > 1 ? 's' : ''}`}
              </AppText>
              <AppText variant="caption" color={colors.text.muted} numberOfLines={2}>
                {zones.length === 0 ? 'Touchez pour sélectionner' : zones.slice(0, 6).join(', ') + (zones.length > 6 ? '…' : '')}
              </AppText>
            </View>
          </AppPressable>
          {zones.length > 20 && (
            <View style={[styles.notice, { backgroundColor: colors.status.warningLight, borderColor: colors.status.warningBorder }]}>
              <AppText variant="caption" color={colors.status.warningDark}>
                Vous avez coché {zones.length} quartiers. Ne gardez que ceux où vous circulez vraiment :
                une course trop loin vous coûte du carburant et fait attendre le client.
              </AppText>
            </View>
          )}
        </View>

        {/* Tarification */}
        <AppText variant="label" color={colors.text.muted} style={styles.sectionHeader}>TARIFICATION ANNONCÉE</AppText>
        <View style={styles.card}>
          <Field label="Ce que voient les commerçants" last>
            <TextInput
              value={pricing}
              onChangeText={setPricing}
              placeholder="Ex. 500 F en centre-ville, 1 000 F au-delà"
              placeholderTextColor={colors.text.subtle}
              multiline
              style={[styles.input, styles.inputMultiline]}
            />
          </Field>
        </View>

        <Button
          title={saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          onPress={save}
          disabled={saving || !dirty}
          loading={saving}
          leftIcon={!saving ? <Check size={18} color={colors.text.inverse} /> : undefined}
          style={styles.saveBtn}
        />
        {!dirty && (
          <AppText variant="caption" color={colors.text.subtle} center style={styles.hint}>
            Modifiez un champ pour activer l’enregistrement
          </AppText>
        )}
      </ScrollView>

      <ZonesSelectionModal
        visible={zonesOpen}
        onClose={() => setZonesOpen(false)}
        selectedZones={zones}
        onToggleZone={toggleZone}
      />
    </View>
  );
}

const Field: React.FC<{ label: string; last?: boolean; children: React.ReactNode }> = ({ label, last, children }) => (
  <View style={[styles.field, !last && styles.fieldDivider]}>
    <AppText variant="caption" color={colors.text.muted} style={styles.fieldLabel}>{label}</AppText>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.DEFAULT },
  center: { alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingBottom: spacing[3],
    backgroundColor: colors.bg.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border.subtle,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], paddingBottom: spacing[12], gap: spacing[2] },

  photoBlock: { alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  photoWrap: { position: 'relative' },
  photo: { width: 88, height: 88, borderRadius: radii.full },
  photoEmpty: { alignItems: 'center', justifyContent: 'center' },
  photoBadge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 28, height: 28, borderRadius: radii.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.bg.DEFAULT,
  },

  sectionHeader: { marginTop: spacing[4], marginBottom: spacing[2], letterSpacing: 0.6 },
  card: {
    backgroundColor: colors.bg.surface, borderRadius: radii.xl,
    borderWidth: 1, borderColor: colors.border.DEFAULT,
    paddingHorizontal: spacing[4],
  },
  field: { paddingVertical: spacing[3], gap: spacing[1] },
  fieldDivider: { borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  fieldLabel: { letterSpacing: 0.3 },
  input: { fontSize: 15, color: colors.text.DEFAULT, paddingVertical: spacing[1] },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },

  vehicleRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2],
    paddingVertical: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.border.subtle,
  },
  vehicleChip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: radii.full, borderWidth: 1,
  },

  zonesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[4] },
  notice: {
    borderRadius: radii.lg, borderWidth: 1,
    padding: spacing[3], marginBottom: spacing[4],
  },

  saveBtn: { marginTop: spacing[6] },
  hint: { marginTop: spacing[2] },
});
