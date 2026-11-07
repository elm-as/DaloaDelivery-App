import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BottomSheet, Button, OtpInput, colors, radii, spacing, typography, showAlert } from '@daloa/ui';
import { Camera, CheckCircle2 } from 'lucide-react-native';
import { Haptics, formatUserErrorMessage } from '@daloa/utils';

export interface OtpVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'pickup' | 'delivery';
  /** Code pré-rempli uniquement lors d'un scan QR réel. */
  initialCode?: string;
  onSubmit: (otp: string, photoUri: string, photoBase64?: string | null) => Promise<void>;
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
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [codeError, setCodeError] = useState(false);

  const handleCodeChange = (code: string) => {
    setOtpCode(code);
    if (codeError) {
      setCodeError(false);
      setErrorMsg(null);
    }
  };

  React.useEffect(() => {
    if (visible) {
      setOtpCode(initialCode);
      setErrorMsg(null);
      setCodeError(false);
    }
  }, [visible, initialCode]);

  const isPickup = type === 'pickup';
  const modalTitle = isPickup ? 'Code Vendeur (6 chiffres)' : 'Code Client (6 chiffres)';
  const personRole = isPickup ? 'le vendeur' : 'le client';

  const handleTakePhoto = async () => {
    Haptics.lightImpact();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission requise', 'L’accès à la caméra est nécessaire pour photographier le colis.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
      if (!codeError) setErrorMsg(null);
      Haptics.selection();
    }
  };

  const handleConfirm = async () => {
    if (otpCode.length !== 6) {
      setCodeError(true);
      setErrorMsg(`Saisissez les 6 chiffres donnés par ${personRole}.`);
      return;
    }
    if (!photoUri) {
      setCodeError(false);
      setErrorMsg('Prenez une photo du colis avant de confirmer.');
      return;
    }

    try {
      setErrorMsg(null);
      setCodeError(false);
      await onSubmit(otpCode, photoUri, photoBase64);
      setOtpCode('');
      setPhotoUri(null);
      setPhotoBase64(null);
    } catch (err: any) {
      setCodeError(true);
      setErrorMsg(formatUserErrorMessage(err, 'Code incorrect ou erreur de validation'));
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={modalTitle}>
      <View style={styles.content}>
        <OtpInput
          length={6}
          value={otpCode}
          onChange={handleCodeChange}
          isError={codeError}
          autoFocus={visible && initialCode.length < 6}
        />

        {photoUri ? (
          <View style={styles.photoRowDone}>
            <Image source={{ uri: photoUri }} style={styles.photoThumb} />
            <View style={{ flex: 1 }}>
              <View style={styles.photoStatusRow}>
                <CheckCircle2 size={15} color="#059669" />
                <Text style={styles.photoDoneText}>Photo du colis prête</Text>
              </View>
              <Text style={styles.photoDoneSub}>Prête pour validation</Text>
            </View>
            <TouchableOpacity onPress={handleTakePhoto} style={styles.retakeBtn} activeOpacity={0.8}>
              <Camera size={14} color={colors.grey[700]} />
              <Text style={styles.retakeText}>Refaire</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleTakePhoto}
            activeOpacity={0.85}
            style={styles.cameraRow}
          >
            <View style={styles.cameraIconWrap}>
              <Camera size={20} color={colors.primary.DEFAULT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cameraText}>
                {isPickup ? 'Prendre la photo du colis' : 'Photo de remise au client'}
              </Text>
              <Text style={styles.cameraSub}>Appuyez ici pour ouvrir l’appareil photo</Text>
            </View>
          </TouchableOpacity>
        )}

        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        <Button
          title={isPickup ? 'Valider le ramassage' : 'Valider la livraison'}
          variant={isPickup ? 'primary' : 'secondary'}
          size="lg"
          loading={loading}
          disabled={otpCode.length !== 6 || !photoUri || loading}
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
    paddingBottom: spacing[2],
    gap: spacing[2],
  },
  cameraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
    marginTop: spacing[1],
  },
  cameraIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  cameraText: {
    color: colors.primary[700],
    fontSize: 13,
    fontFamily: typography.families.bold,
  },
  cameraSub: {
    color: colors.grey[600],
    fontSize: 11,
    marginTop: 1,
  },
  photoRowDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: radii.xl,
    padding: 8,
    marginTop: spacing[1],
  },
  photoThumb: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.bg.subtle,
  },
  photoStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  photoDoneText: {
    color: '#065F46',
    fontSize: 13,
    fontFamily: typography.families.bold,
  },
  photoDoneSub: {
    color: '#047857',
    fontSize: 11,
    marginTop: 1,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    gap: 5,
  },
  retakeText: {
    color: colors.grey[800],
    fontSize: 11,
    fontFamily: typography.families.semibold,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 12,
    fontFamily: typography.families.medium,
    textAlign: 'center',
    marginTop: 2,
  },
  submitBtn: {
    marginTop: spacing[1],
  },
});
