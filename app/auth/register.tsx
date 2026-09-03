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
import { VEHICLE_TYPES } from '@daloa/config';
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
    <SafeAreaView style={styles.container}>
      <Header title="Inscription Livreur" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerBox}>
            <View style={styles.logoBox}>
              <Bike size={32} color={colors.primary.DEFAULT} />
            </View>
            <Text style={styles.welcomeTitle}>Rejoignez la Flotte DaloaDelivery</Text>
            <Text style={styles.welcomeSub}>
              Devenez coursier partenaire et recevez des commandes de livraison partout à Daloa.
            </Text>
          </View>

          <Input
            label="Nom & Prénoms *"
            placeholder="Ex: Kouamé Konan"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<User size={18} color={colors.grey[400]} />}
          />

          <Input
            label="Numéro de téléphone (+225) *"
            placeholder="Ex: 07 01 02 03 04"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={colors.grey[400]} />}
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
            leftIcon={<Lock size={18} color={colors.grey[400]} />}
          />

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <View style={{ marginTop: 10 }}>
            <Button
              title="Créer mon compte livreur"
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={handleRegister}
              fullWidth
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Déjà inscrit ?</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing[4],
    backgroundColor: '#F8F9FA',
  },
  headerBox: {
    alignItems: 'center',
    marginVertical: spacing[3],
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: radii['2xl'],
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  welcomeTitle: {
    color: '#111827',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  welcomeSub: {
    color: colors.grey[500],
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16,
  },
  inputLabel: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  vehicleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  vehicleCardActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: '#FFF4E6',
  },
  vehicleText: {
    color: colors.grey[600],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  vehicleTextActive: {
    color: colors.primary[700],
    fontWeight: typography.weights.bold,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing[5],
  },
  footerText: {
    color: colors.grey[500],
    fontSize: typography.sizes.sm,
  },
  loginLink: {
    color: colors.primary.DEFAULT,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
