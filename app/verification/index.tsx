import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
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
  Card,
} from '@daloa/ui';
import { ShieldCheck, Camera, CheckCircle2 } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function VerificationScreen() {
  const router = useRouter();
  const { driverProfile, refreshDriverProfile } = useDriverAuth();

  const [cniFront, setCniFront] = useState<string | null>(null);
  const [cniBack, setCniBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickDocument = async (target: 'front' | 'back' | 'selfie') => {
    Haptics.lightImpact();
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      if (target === 'front') setCniFront(result.assets[0].uri);
      if (target === 'back') setCniBack(result.assets[0].uri);
      if (target === 'selfie') setSelfie(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!cniFront || !cniBack || !selfie) {
      Alert.alert('Documents requis', 'Veuillez prendre en photo le recto, le verso de votre CNI et votre selfie.');
      return;
    }

    try {
      setIsSubmitting(true);
      const frontUrl = await deliveryService.uploadDeliveryProof(cniFront);
      const backUrl = await deliveryService.uploadDeliveryProof(cniBack);
      const selfieUrl = await deliveryService.uploadDeliveryProof(selfie);

      Haptics.success();
      Alert.alert(
        'Documents reçus ! 🎉',
        'Votre dossier de vérification a été transmis à l’équipe DaloaDelivery. Validation sous 24h.',
        [{ text: 'Super', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Échec du téléversement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Vérification CNI / KYC" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroBox}>
          <ShieldCheck size={36} color={colors.delivery.primary} />
          <Text style={styles.heroTitle}>Devenez Livreur Certifié DaloaDelivery</Text>
          <Text style={styles.heroSub}>
            La vérification de votre identité est obligatoire pour garantir la sécurité des colis et accéder à toutes les courses.
          </Text>
        </View>

        {/* 1. CNI Recto */}
        <Text style={styles.sectionTitle}>1. Recto de la CNI ou Permis de conduire *</Text>
        {cniFront ? (
          <Image source={{ uri: cniFront }} style={styles.previewImage} />
        ) : (
          <TouchableOpacity onPress={() => handlePickDocument('front')} style={styles.uploadBox}>
            <Camera size={24} color={colors.delivery.primary} />
            <Text style={styles.uploadText}>Prendre en photo le recto</Text>
          </TouchableOpacity>
        )}

        {/* 2. CNI Verso */}
        <Text style={styles.sectionTitle}>2. Verso de la CNI *</Text>
        {cniBack ? (
          <Image source={{ uri: cniBack }} style={styles.previewImage} />
        ) : (
          <TouchableOpacity onPress={() => handlePickDocument('back')} style={styles.uploadBox}>
            <Camera size={24} color={colors.delivery.primary} />
            <Text style={styles.uploadText}>Prendre en photo le verso</Text>
          </TouchableOpacity>
        )}

        {/* 3. Selfie */}
        <Text style={styles.sectionTitle}>3. Selfie portrait en tenant la pièce *</Text>
        {selfie ? (
          <Image source={{ uri: selfie }} style={styles.previewImage} />
        ) : (
          <TouchableOpacity onPress={() => handlePickDocument('selfie')} style={styles.uploadBox}>
            <Camera size={24} color={colors.delivery.primary} />
            <Text style={styles.uploadText}>Prendre un selfie avec votre pièce</Text>
          </TouchableOpacity>
        )}

        <Button
          title="Envoyer mes documents pour validation"
          variant="delivery"
          size="lg"
          loading={isSubmitting}
          disabled={!cniFront || !cniBack || !selfie || isSubmitting}
          onPress={handleSubmit}
          style={{ marginTop: spacing[4] }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  heroBox: {
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing[4],
    gap: spacing[2],
  },
  heroTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  heroSub: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  sectionTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginTop: spacing[2],
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadText: {
    color: colors.delivery.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: radii.xl,
    backgroundColor: colors.dark.surfaceRaised,
  },
});
