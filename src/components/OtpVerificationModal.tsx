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
  onSubmit: (otp: string, photoUri: string) => Promise<void>;
  isLoading?: boolean;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  visible,
  onClose,
  type,
  onSubmit,
  isLoading = false,
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isPickup = type === 'pickup';
  const modalTitle = isPickup ? 'Validation Ramassage Vendeur' : 'Validation Livraison Acheteur';
  const personRole = isPickup ? 'le vendeur' : 'l’acheteur';

  const handleTakePhoto = async () => {
    Haptics.lightImpact();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'L’accès à la caméra est obligatoire pour photographier le colis.');
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
              <Camera size={16} color="#FFFFFF" />
              <Text style={styles.retakeText}>Reprendre la photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleTakePhoto}
            activeOpacity={0.8}
            style={styles.cameraBox}
          >
            <Camera size={28} color={colors.delivery.primary} />
            <Text style={styles.cameraText}>
              {isPickup ? 'Prendre la photo du colis' : 'Prendre la photo de la livraison'}
            </Text>
            <Text style={styles.cameraSub}>Photo claire du paquet ou du produit</Text>
          </TouchableOpacity>
        )}

        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        {/* Submit */}
        <Button
          title={isPickup ? 'Confirmer le ramassage' : 'Confirmer la livraison'}
          variant="delivery"
          size="lg"
          loading={isLoading}
          disabled={otpCode.length !== 4 || !photoUri || isLoading}
          onPress={handleConfirm}
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
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginBottom: spacing[4],
  },
  inputLabel: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[2],
  },
  cameraBox: {
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    borderStyle: 'dashed',
    borderRadius: radii['2xl'],
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    gap: 4,
  },
  cameraText: {
    color: colors.delivery.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  cameraSub: {
    color: colors.dark.textDim,
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
    backgroundColor: colors.dark.surfaceRaised,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceRaised,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.lg,
    gap: 6,
    marginTop: spacing[2],
  },
  retakeText: {
    color: colors.dark.text,
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
    marginTop: spacing[1],
  },
});
