import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { payoutService, usePayoutSettings } from '@daloa/api';
import { MOBILE_MONEY_NETWORKS } from '@daloa/config';
import {
  colors,
  radii,
  spacing,
  typography,
  Header,
  Input,
  Button,
  Card,
} from '@daloa/ui';
import { ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function PayoutSetupScreen() {
  const router = useRouter();
  const { user } = useDriverAuth();
  const { data: currentSettings, refetch } = usePayoutSettings(user?.id);

  const [network, setNetwork] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [phone, setPhone] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setNetwork((currentSettings.network as any) || 'wave');
      setPhone(currentSettings.phone || '');
      setAccountName(currentSettings.accountName || '');
    }
  }, [currentSettings]);

  const handleSave = async () => {
    if (!user?.id) return;
    if (!phone.trim() || phone.length < 8) {
      Alert.alert('Erreur', 'Numéro de téléphone invalide.');
      return;
    }
    if (!accountName.trim()) {
      Alert.alert('Erreur', 'Le nom du titulaire est obligatoire.');
      return;
    }

    try {
      setIsSaving(true);
      await payoutService.savePayoutSettings(user.id, {
        network,
        phone: phone.trim(),
        accountName: accountName.trim(),
        isActive: true,
      });

      Haptics.success();
      refetch();
      Alert.alert('Compte enregistré', 'Vos gains seront versés sur ce compte Mobile Money.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d’enregistrer le compte');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Compte de Retrait" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.securityCard}>
          <ShieldCheck size={24} color={colors.delivery.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Versement de vos gains</Text>
            <Text style={styles.securityDesc}>
              Vos gains de livraison vous sont versés automatiquement sur ce numéro.
            </Text>
          </View>
        </Card>

        {/* Sélection du Réseau */}
        <Text style={styles.sectionTitle}>Réseau Mobile Money *</Text>
        <View style={styles.networksGrid}>
          {MOBILE_MONEY_NETWORKS.map((net) => {
            const isSelected = network === net.id;
            return (
              <TouchableOpacity
                key={net.id}
                onPress={() => {
                  Haptics.selection();
                  setNetwork(net.id as any);
                }}
                style={[styles.networkCard, isSelected && styles.networkCardActive]}
              >
                <View style={[styles.networkDot, { backgroundColor: net.color }]} />
                <Text style={[styles.networkName, isSelected && styles.networkNameActive]}>
                  {net.name}
                </Text>
                {isSelected && <CheckCircle2 size={16} color={colors.delivery.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Numéro de téléphone Mobile Money *"
          placeholder="Ex: 07 01 02 03 04"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Input
          label="Nom & Prénoms du titulaire *"
          placeholder="Ex: Kouamé Konan Jean"
          value={accountName}
          onChangeText={setAccountName}
          helperText="Le nom doit correspondre au compte opérateur"
        />

        <Button
          title="Enregistrer mon compte"
          variant="delivery"
          size="lg"
          loading={isSaving}
          onPress={handleSave}
          style={{ marginTop: spacing[4] }}
        />
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
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  securityTitle: {
    color: colors.delivery.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  securityDesc: {
    color: colors.dark.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  networksGrid: {
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  networkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceRaised,
    borderRadius: radii.xl,
    padding: spacing[3],
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    gap: spacing[3],
  },
  networkCardActive: {
    borderColor: colors.delivery.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  networkDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  networkName: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  networkNameActive: {
    fontWeight: typography.weights.bold,
  },
});
