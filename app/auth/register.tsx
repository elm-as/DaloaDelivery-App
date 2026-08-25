import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { VEHICLE_TYPES, DALOA_DISTRICTS } from '@daloa/config';
import {
  colors,
  radii,
  spacing,
  typography,
  Header,
  Input,
  Button,
} from '@daloa/ui';
import { Bike, User, Phone, Lock, Mail } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function DriverRegisterScreen() {
  const router = useRouter();
  const { register } = useDriverAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState<string>('moto');
  const [district, setDistrict] = useState('Lobia');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      setErrorMsg('Veuillez renseigner votre nom complet');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setErrorMsg('Veuillez renseigner un numéro de téléphone valide');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${phone.replace(/\D/g, '')}@delivery.daloamarket.ci`,
        password,
        role: 'delivery',
        district,
        vehicleType: vehicleType as any,
      });

      Haptics.success();
      router.back();
    } catch (err: any) {
      setErrorMsg(err.message || 'Échec de l’inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Inscription Livreur" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerBox}>
            <View style={styles.logoBox}>
              <Bike size={32} color={colors.delivery.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Rejoignez la Flotte DaloaDelivery</Text>
            <Text style={styles.welcomeSub}>
              Devenez coursier indépendant et recevez des livraisons partout à Daloa.
            </Text>
          </View>

          <Input
            label="Nom & Prénoms *"
            placeholder="Ex: Kouamé Konan"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<User size={18} color={colors.dark.textDim} />}
          />

          <Input
            label="Numéro de téléphone (+225) *"
            placeholder="Ex: 07 01 02 03 04"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={colors.dark.textDim} />}
          />

          {/* Type de véhicule */}
          <Text style={styles.inputLabel}>Votre moyen de transport *</Text>
          <View style={styles.vehicleRow}>
            {VEHICLE_TYPES.map((v) => {
              const isSelected = vehicleType === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => {
                    Haptics.selection();
                    setVehicleType(v.id);
                  }}
                  style={[styles.vehicleCard, isSelected && styles.vehicleCardActive]}
                >
                  <Text style={[styles.vehicleText, isSelected && styles.vehicleTextActive]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Mot de passe *"
            placeholder="Au moins 6 caractères"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Lock size={18} color={colors.dark.textDim} />}
          />

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <Button
            title="Créer mon compte livreur"
            variant="delivery"
            size="lg"
            loading={isLoading}
            onPress={handleRegister}
            style={styles.submitBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Déjà inscrit ?</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  headerBox: {
    alignItems: 'center',
    marginVertical: spacing[3],
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: radii['2xl'],
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  welcomeTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  welcomeSub: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16,
  },
  inputLabel: {
    color: colors.dark.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing[1] + 2,
  },
  vehicleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  vehicleCard: {
    backgroundColor: colors.dark.surfaceRaised,
    borderRadius: radii.xl,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 1.5,
    borderColor: colors.dark.border,
  },
  vehicleCardActive: {
    borderColor: colors.delivery.primary,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  vehicleText: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  vehicleTextActive: {
    color: colors.delivery.primary,
    fontWeight: typography.weights.bold,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing[5],
  },
  footerText: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.sm,
  },
  loginLink: {
    color: colors.delivery.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
