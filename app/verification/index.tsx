import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { deliveryService } from '@daloa/api';
import {
  colors,
  radii,
  spacing,
  typography,
  Header,
  Button,
  showAlert,
} from '@daloa/ui';
import { ShieldCheck, Camera, CheckCircle2 } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';
import { requiresDrivingLicence } from '@daloa/config';

export default function VerificationScreen() {
  const router = useRouter();
  const { driverProfile, refreshDriverProfile } = useDriverAuth();

  const [cniFront, setCniFront] = useState<string | null>(null);
  const [cniBack, setCniBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [licence, setLicence] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Le permis n'est demandé que pour un véhicule motorisé. L'exiger d'un
     coursier à vélo l'écarterait sans raison. */
  const needsLicence = requiresDrivingLicence(driverProfile?.vehicle_type);

  const handlePickDocument = async (target: 'front' | 'back' | 'selfie' | 'licence') => {
    Haptics.lightImpact();
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      if (target === 'front') setCniFront(result.assets[0].uri);
      if (target === 'back') setCniBack(result.assets[0].uri);
      if (target === 'selfie') setSelfie(result.assets[0].uri);
      if (target === 'licence') setLicence(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!driverProfile?.id) {
      showAlert('Session requise', 'Veuillez vous reconnecter pour soumettre votre dossier de vérification.');
      return;
    }

    if (!cniFront || !cniBack || !selfie) {
      showAlert('Documents requis', 'Veuillez photographier le recto, le verso de votre CNI et votre selfie.');
      return;
    }

    if (needsLicence && !licence) {
      showAlert(
        'Permis requis',
        `Votre véhicule (${driverProfile?.vehicle_type}) nécessite un permis de conduire valide. Photographiez-le pour continuer.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const frontPath = await deliveryService.uploadKycDocument(cniFront, driverProfile.id, 'cni_front');
      const backPath = await deliveryService.uploadKycDocument(cniBack, driverProfile.id, 'cni_back');
      const selfiePath = await deliveryService.uploadKycDocument(selfie, driverProfile.id, 'selfie');
      const licencePath = licence
        ? await deliveryService.uploadKycDocument(licence, driverProfile.id, 'licence')
        : null;

      await deliveryService.submitKycVerification(driverProfile.id, {
        cniUrl: frontPath,
        selfieCniUrl: selfiePath,
        portraitLiveUrl: backPath,
        licenceUrl: licencePath,
      });

      await refreshDriverProfile?.();

      Haptics.success();
      showAlert(
        'Documents reçus ! 🎉',
        'Votre dossier de vérification a été transmis à l’équipe DaloaDelivery. Validation sous 24h.',
        [{ text: 'Super', onPress: () => router.back() }]
      );
    } catch (err: any) {
      showAlert('Erreur', err.message || 'Échec de l’envoi du dossier');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Vérification CNI / KYC" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroBox}>
          <ShieldCheck size={36} color={colors.primary.DEFAULT} />
          <Text style={styles.heroTitle}>Devenez Livreur Certifié DaloaDelivery</Text>
          <Text style={styles.heroSub}>
            La vérification de votre identité est obligatoire pour garantir la sécurité des colis et accéder à toutes les courses.
          </Text>
        </View>

        {/* 1. CNI Recto */}
        <Text style={styles.sectionTitle}>1. Recto de votre pièce d'identité *</Text>
        {cniFront ? (
          <Image source={{ uri: cniFront }} style={styles.previewImage} />
        ) : (
          <TouchableOpacity onPress={() => handlePickDocument('front')} style={styles.uploadBox}>
            <Camera size={24} color={colors.primary.DEFAULT} />
            <Text style={styles.uploadText}>Prendre en photo le recto</Text>
          </TouchableOpacity>
        )}

        {/* 2. CNI Verso */}
        <Text style={styles.sectionTitle}>2. Verso de la CNI *</Text>
        {cniBack ? (
          <Image source={{ uri: cniBack }} style={styles.previewImage} />
        ) : (
          <TouchableOpacity onPress={() => handlePickDocument('back')} style={styles.uploadBox}>
            <Camera size={24} color={colors.primary.DEFAULT} />
            <Text style={styles.uploadText}>Prendre en photo le verso</Text>
          </TouchableOpacity>
        )}

        {/* 3. Selfie */}
        <Text style={styles.sectionTitle}>3. Selfie portrait en tenant la pièce *</Text>
        {selfie ? (
          <Image source={{ uri: selfie }} style={styles.previewImage} />
        ) : (
          <TouchableOpacity onPress={() => handlePickDocument('selfie')} style={styles.uploadBox}>
            <Camera size={24} color={colors.primary.DEFAULT} />
            <Text style={styles.uploadText}>Prendre un selfie avec votre pièce</Text>
          </TouchableOpacity>
        )}

        {/* 4. Permis — uniquement pour un véhicule motorisé */}
        {needsLicence && (
          <>
            <Text style={styles.sectionTitle}>
              4. Permis de conduire ({driverProfile?.vehicle_type}) *
            </Text>
            <Text style={styles.sectionHint}>
              Votre pièce d'identité dit qui vous êtes ; le permis atteste que vous
              pouvez conduire votre véhicule. Les deux sont demandés.
            </Text>
            {licence ? (
              <Image source={{ uri: licence }} style={styles.previewImage} />
            ) : (
              <TouchableOpacity onPress={() => handlePickDocument('licence')} style={styles.uploadBox}>
                <Camera size={24} color={colors.primary.DEFAULT} />
                <Text style={styles.uploadText}>Prendre en photo le permis</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ marginTop: 16 }}>
          <Button
            title="Envoyer mes documents pour validation"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={!cniFront || !cniBack || !selfie || (needsLicence && !licence) || isSubmitting}
            onPress={handleSubmit}
            fullWidth
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
    backgroundColor: colors.bg.DEFAULT,
  },
  heroBox: {
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing[4],
    gap: spacing[2],
  },
  heroTitle: {
    color: colors.text.DEFAULT,
    fontSize: typography.sizes.base,
    fontFamily: typography.families.bold,
    textAlign: 'center',
  },
  heroSub: {
    color: colors.grey[600],
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  sectionTitle: {
    color: colors.text.DEFAULT,
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.bold,
    marginTop: spacing[2],
  },
  sectionHint: {
    color: colors.text.muted,
    fontSize: typography.sizes.xs,
    fontFamily: typography.families.normal,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 2,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    backgroundColor: colors.primary[50],
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadText: {
    color: colors.primary[700],
    fontSize: typography.sizes.xs,
    fontFamily: typography.families.semibold,
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: radii.xl,
    backgroundColor: colors.bg.subtle,
  },
});
