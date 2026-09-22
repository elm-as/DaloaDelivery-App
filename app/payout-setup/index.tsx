import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { payoutService, usePayoutSettings, denormalizePayoutNetwork } from '@daloa/api';
import { MOBILE_MONEY_NETWORKS } from '@daloa/config';
import {
  colors,
  radii,
  spacing,
  typography,
  Header,
  Input,
  Button,
  ConfirmDialog,
} from '@daloa/ui';
import { ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

const OPERATOR_LOGOS: Record<string, any> = {
  wave: require('../../assets/operators/wave.png'),
  orange: require('../../assets/operators/orange.png'),
  mtn: require('../../assets/operators/mtn.jpeg'),
  moov: require('../../assets/operators/moov.png'),
};

export default function PayoutSetupScreen() {
  const router = useRouter();
  const { user, profile, driverProfile, refreshDriverProfile } = useDriverAuth();
  const { data: currentSettings, refetch } = usePayoutSettings(user?.id);

  const [network, setNetwork] = useState<'wave' | 'orange' | 'mtn' | 'moov'>('wave');
  const [phone, setPhone] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentSettings) {
      setNetwork((currentSettings.network as any) || 'wave');
      setPhone(currentSettings.phone || driverProfile?.payout_number || driverProfile?.phone || profile?.phone || '');
      setAccountName(currentSettings.accountName || driverProfile?.name || profile?.full_name || '');
    } else if (driverProfile || profile) {
      if (driverProfile?.payout_network) {
        setNetwork((denormalizePayoutNetwork(driverProfile.payout_network) as any) || 'wave');
      }
      setPhone(driverProfile?.payout_number || driverProfile?.phone || profile?.phone || '');
      setAccountName(driverProfile?.name || profile?.full_name || '');
    }
  }, [currentSettings, driverProfile, profile]);

  const handleSave = async () => {
    if (!user?.id) return;
    if (!phone.trim() || phone.length < 8) {
      setErrorDialogMessage('Veuillez renseigner un numéro de téléphone valide à 10 chiffres.');
      return;
    }
    if (!accountName.trim()) {
      setErrorDialogMessage('Le nom du titulaire est obligatoire.');
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

      if (refreshDriverProfile) {
        await refreshDriverProfile();
      }
      Haptics.success();
      refetch();
      setShowSuccessDialog(true);
    } catch (err: any) {
      setErrorDialogMessage(err.message || 'Impossible d’enregistrer le compte de retrait.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Compte de Retrait" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.securityCard}>
          <ShieldCheck size={24} color={colors.primary.DEFAULT} />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Versement de vos gains</Text>
            <Text style={styles.securityDesc}>
              Vos gains de livraison vous sont versés automatiquement sur ce numéro.
            </Text>
          </View>
        </View>

        {/* Sélection du Réseau */}
        <Text style={styles.sectionTitle}>Réseau Mobile Money *</Text>
        <View style={styles.networksGrid}>
          {MOBILE_MONEY_NETWORKS.map((net) => {
            const isSelected = network === net.id;
            const logoSource = OPERATOR_LOGOS[net.id];

            return (
              <TouchableOpacity
                key={net.id}
                onPress={() => {
                  Haptics.selection();
                  setNetwork(net.id as any);
                }}
                style={[styles.networkCard, isSelected && styles.networkCardActive]}
              >
                <View style={[styles.networkLogoWrapper, isSelected && styles.networkLogoWrapperActive]}>
                  {logoSource ? (
                    <Image source={logoSource} style={styles.networkLogo} resizeMode="contain" />
                  ) : (
                    <View style={[styles.networkDot, { backgroundColor: net.color }]} />
                  )}
                </View>
                <Text style={[styles.networkName, isSelected && styles.networkNameActive]}>
                  {net.name}
                </Text>
                {isSelected && <CheckCircle2 size={18} color={colors.primary.DEFAULT} />}
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

        <View style={{ marginTop: 14 }}>
          <Button
            title="Enregistrer mon compte"
            variant="primary"
            size="lg"
            loading={isSaving}
            onPress={handleSave}
            fullWidth
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showSuccessDialog}
        type="success"
        title="Compte enregistré"
        message="Vos gains seront désormais versés sur ce compte Mobile Money."
        confirmText="Continuer"
        onConfirm={() => {
          setShowSuccessDialog(false);
          router.back();
        }}
        onCancel={() => {
          setShowSuccessDialog(false);
          router.back();
        }}
      />

      <ConfirmDialog
        visible={Boolean(errorDialogMessage)}
        type="warning"
        title="Information requise"
        message={errorDialogMessage || ''}
        confirmText="Compris"
        onConfirm={() => setErrorDialogMessage(null)}
        onCancel={() => setErrorDialogMessage(null)}
      />
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
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  securityTitle: {
    color: colors.primary[800],
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.bold,
  },
  securityDesc: {
    color: colors.primary[900],
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.text.DEFAULT,
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.bold,
  },
  networksGrid: {
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  networkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radii.xl,
    padding: spacing[3],
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
    gap: spacing[3],
  },
  networkCardActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary[50],
  },
  networkLogoWrapper: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 3,
  },
  networkLogoWrapperActive: {
    borderColor: colors.primary.DEFAULT,
  },
  networkLogo: {
    width: '100%',
    height: '100%',
  },
  networkDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  networkName: {
    color: colors.text.DEFAULT,
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.medium,
    flex: 1,
  },
  networkNameActive: {
    fontFamily: typography.families.bold,
    color: colors.primary[700],
  },
});
