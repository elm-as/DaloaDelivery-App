import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BottomSheet, Button, OtpInput } from '@daloa/ui';
import { colors, radii, spacing, typography } from '@daloa/ui';
import { Camera, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export interface OtpVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'pickup' | 'delivery';
  /** Code pré-rempli (ex. issu d'un scan QR). */
  initialCode?: string;
  onSubmit: (otp: string, photoUri: string) => Promise<void>;
  loading?: boolean;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  visible,
  onClose,
  type,
  initialCode = '',
  onSubmit,
  loading = false,
}) => {
  const [otpCode, setOtpCode] = useState(initialCode);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronise le code pré-rempli (ex. après un scan QR) à l'ouverture.
  React.useEffect(() => {
    if (visible) {
      setOtpCode(initialCode);
      setErrorMsg(null);
    }
  }, [visible, initialCode]);

  const isPickup = type === 'pickup';
  const modalTitle = isPickup ? 'Validation Ramassage Vendeur' : 'Validation Livraison Acheteur';
  const personRole = isPickup ? 'le vendeur' : 'l’acheteur';

  const handleTakePhoto = async () => {
    Haptics.lightImpact();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'L’accès à la caméra est nécessaire pour photographier le colis.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.selection();
    }
  };

  const handleConfirm = async () => {
    if (otpCode.length !== 4) {
      setErrorMsg(`Veuillez saisir le code OTP à 4 chiffres fourni par ${personRole}.`);
      return;
    }
    if (!photoUri) {
      setErrorMsg('La photo de preuve du colis est obligatoire avant validation.');
      return;
    }

    try {
      setErrorMsg(null);
      await onSubmit(otpCode, photoUri);
      setOtpCode('');
      setPhotoUri(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Code OTP incorrect ou erreur de validation');
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={modalTitle}>
      <View style={styles.content}>
        {/* Instruction */}
        <Text style={styles.instructions}>
          {isPickup
            ? 'Demandez le code secret de ramassage au vendeur et prenez une photo nette du colis.'
            : 'Demandez le code secret de livraison à l’acheteur et prenez une photo de la remise du colis.'}
        </Text>

        {/* OTP Input */}
        <Text style={styles.inputLabel}>Code Secret OTP (4 chiffres) *</Text>
        <OtpInput
          length={4}
          value={otpCode}
          onChange={setOtpCode}
          isError={Boolean(errorMsg)}
        />

        {/* Photo Proof Capture */}
        <Text style={styles.inputLabel}>Photo de preuve obligatoire *</Text>
        {photoUri ? (
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <TouchableOpacity
              onPress={handleTakePhoto}
              style={styles.retakeBtn}
            >
              <Camera size={16} color={colors.grey[700]} />
              <Text style={styles.retakeText}>Reprendre la photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleTakePhoto}
            activeOpacity={0.8}
            style={styles.cameraBox}
          >
            <Camera size={28} color={colors.primary.DEFAULT} />
            <Text style={styles.cameraText}>
              {isPickup ? 'Prendre la photo du colis' : 'Prendre la photo de la livraison'}
            </Text>
            <Text style={styles.cameraSub}>Photo nette du paquet ou de l’article</Text>
          </TouchableOpacity>
        )}

        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        {/* Submit */}
        <Button
          title={isPickup ? 'Confirmer le ramassage' : 'Confirmer la livraison'}
          variant={isPickup ? 'primary' : 'secondary'}
          size="lg"
          loading={loading}
          disabled={otpCode.length !== 4 || !photoUri || loading}
          onPress={handleConfirm}
          fullWidth
          style={styles.submitBtn}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[4],
  },
  instructions: {
    color: colors.grey[600],
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing[4],
  },
  inputLabel: {
    color: '#111827',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[2],
  },
  cameraBox: {
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    backgroundColor: '#FFF4E6',
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    gap: 4,
  },
  cameraText: {
    color: colors.primary[700],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  cameraSub: {
    color: colors.grey[500],
    fontSize: 11,
  },
  photoPreviewContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: radii.xl,
    backgroundColor: '#F3F4F6',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.md,
    gap: 6,
    marginTop: spacing[2],
  },
  retakeText: {
    color: colors.grey[800],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  submitBtn: {
    marginTop: spacing[2],
  },
});
