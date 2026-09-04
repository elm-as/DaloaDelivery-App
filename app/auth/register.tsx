import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { VEHICLE_TYPES } from '@daloa/config';
import {
  colors,
  radii,
  spacing,
  AppText,
  AppPressable,
  Button,
  Input,
  KeyboardScreen,
} from '@daloa/ui';
import { Bike, User, Phone, Lock, ArrowLeft, Car, Truck } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function DriverRegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useDriverAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState<string>('moto');
  const [district] = useState('Lobia');

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
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)' as any);
    } catch (err: any) {
      setErrorMsg(err.message || 'Échec de l’inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/auth/login' as any);
  };

  const renderVehicleIcon = (id: string, isSelected: boolean) => {
    const iconColor = isSelected ? '#FFFFFF' : '#6B7280';
    if (id === 'voiture') return <Car size={16} color={iconColor} />;
    if (id === 'triporteur') return <Truck size={16} color={iconColor} />;
    return <Bike size={16} color={iconColor} />;
  };

  return (
    <KeyboardScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      >
        {/* 1. En-tête courbé dégradé */}
        <LinearGradient
          colors={['#FFA726', '#FF9800', '#E65100']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.curvedHeader}
        >
          <AppPressable
            onPress={handleBack}
            rippleBorderless
            style={styles.backBtn}
            accessibilityLabel="Retour"
          >
            <ArrowLeft size={18} color={colors.text.inverse} />
          </AppPressable>

          <View style={styles.logoBadge}>
            <Bike size={32} color="#E65100" />
          </View>

          <AppText variant="h1" color={colors.text.inverse} style={styles.titleText}>
            Rejoindre la Flotte
          </AppText>
          <AppText variant="body" color="#FFE0B2">
            Devenez coursier partenaire DaloaDelivery
          </AppText>
        </LinearGradient>

        {/* 2. Formulaire dans la carte flottante */}
        <View style={styles.formCard}>
          {errorMsg && (
            <View style={styles.errorBox}>
              <AppText variant="caption" color={colors.status.errorDark}>
                {errorMsg}
              </AppText>
            </View>
          )}

          <Input
            label="Nom & Prénoms *"
            placeholder="Ex: Kouamé Konan"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<User size={16} color={colors.text.subtle} />}
          />

          <Input
            label="Numéro de téléphone (+225) *"
            placeholder="Ex: 07 01 02 03 04"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={16} color={colors.text.subtle} />}
          />

          {/* Type de véhicule */}
          <AppText variant="caption" color={colors.text.DEFAULT} style={styles.vehicleLabel}>
            Votre moyen de transport *
          </AppText>
          <View style={styles.vehicleRow}>
            {VEHICLE_TYPES.map((v) => {
              const isSelected = vehicleType === v.id;
              return (
                <AppPressable
                  key={v.id}
                  haptic="selection"
                  onPress={() => setVehicleType(v.id)}
                  style={[
                    styles.vehiclePill,
                    isSelected && styles.vehiclePillActive,
                  ]}
                  accessibilityLabel={v.label}
                >
                  {renderVehicleIcon(v.id, isSelected)}
                  <AppText
                    variant="caption"
                    color={isSelected ? colors.text.inverse : colors.text.body}
                    style={styles.vehiclePillText}
                  >
                    {v.label}
                  </AppText>
                </AppPressable>
              );
            })}
          </View>

          <Input
            label="Mot de passe *"
            placeholder="Au moins 6 caractères"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Lock size={16} color={colors.text.subtle} />}
          />

          <View style={{ marginTop: spacing[3] }}>
            <Button
              title={isLoading ? 'Création du compte...' : 'Créer mon compte livreur'}
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={handleRegister}
              fullWidth
            />
          </View>

          <View style={styles.footerRow}>
            <AppText variant="body" color={colors.text.muted}>
              Déjà inscrit ?{' '}
            </AppText>
            <AppPressable
              haptic="light"
              onPress={() => router.replace('/auth/login' as any)}
              accessibilityRole="link"
            >
              <AppText variant="bodyStrong" color="#E65100">
                Se connecter
              </AppText>
            </AppPressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    paddingBottom: spacing[8],
  },
  curvedHeader: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: 36,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: spacing[4],
    left: spacing[4],
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  titleText: {
    marginTop: 2,
    marginBottom: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing[4],
    marginTop: -spacing[6],
    borderRadius: radii['2xl'],
    padding: spacing[5],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: radii.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  vehicleLabel: {
    marginBottom: spacing[2],
    fontWeight: '600',
  },
  vehicleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.full,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vehiclePillActive: {
    backgroundColor: '#E65100',
    borderColor: '#E65100',
  },
  vehiclePillText: {
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[5],
  },
});
