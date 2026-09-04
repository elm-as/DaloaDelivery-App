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
import { Bike, Lock, Mail, ArrowLeft, Shield, Wallet, Zap } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function DriverLoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useDriverAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!emailOrPhone.trim()) {
      setErrorMsg('Veuillez renseigner votre email ou numéro');
      return;
    }
    if (!password) {
      setErrorMsg('Veuillez renseigner votre mot de passe');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      await login({ emailOrPhone: emailOrPhone.trim(), password });
      Haptics.success();
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)' as any);
    } catch (err: any) {
      setErrorMsg(err.message || 'Identifiants livreur incorrects.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)' as any);
  };

  return (
    <KeyboardScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      >
        {/* 1. En-tête courbé en dégradé chaud DaloaDelivery */}
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
            Bon retour !
          </AppText>
          <AppText variant="body" color="#FFE0B2">
            Espace Livreur DaloaDelivery
          </AppText>
        </LinearGradient>

        {/* 2. Carte formulaire flottante */}
        <View style={styles.formCard}>
          {errorMsg && (
            <View style={styles.errorBox}>
              <AppText variant="caption" color={colors.status.errorDark}>
                {errorMsg}
              </AppText>
            </View>
          )}

          <Input
            label="Email ou Téléphone *"
            placeholder="Ex: 07 01 02 03 04 ou coursier@daloa.ci"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            leftIcon={<Mail size={16} color={colors.text.subtle} />}
            autoCapitalize="none"
          />

          <Input
            label="Mot de passe *"
            placeholder="Votre mot de passe"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Lock size={16} color={colors.text.subtle} />}
          />

          <AppPressable
            haptic="none"
            onPress={() => router.push('/auth/reset-password' as any)}
            style={styles.forgotBtn}
            accessibilityRole="button"
          >
            <AppText variant="caption" color="#E65100">
              Mot de passe oublié ?
            </AppText>
          </AppPressable>

          <Button
            title={isLoading ? 'Connexion en cours...' : 'Se connecter'}
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleLogin}
            fullWidth
          />

          <View style={styles.registerRow}>
            <AppText variant="body" color={colors.text.muted}>
              Pas encore de compte livreur ?{' '}
            </AppText>
            <AppPressable
              haptic="light"
              onPress={() => router.push('/auth/register' as any)}
              accessibilityRole="link"
            >
              <AppText variant="bodyStrong" color="#E65100">
                Devenir coursier partenaire
              </AppText>
            </AppPressable>
          </View>
        </View>

        {/* 3. Propositions de valeur livreur (fidèles au Web) */}
        <View style={styles.valueSection}>
          <View style={styles.valueCard}>
            <View style={[styles.valueIconWrap, { backgroundColor: '#FFF4E6' }]}>
              <Wallet size={18} color="#E65100" />
            </View>
            <View style={styles.valueContent}>
              <AppText variant="label" color={colors.text.DEFAULT}>
                Rémunération Transparente
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Reversement direct de vos gains de livraison sur Wave ou MTN.
              </AppText>
            </View>
          </View>

          <View style={styles.valueCard}>
            <View style={[styles.valueIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Shield size={18} color="#D97706" />
            </View>
            <View style={styles.valueContent}>
              <AppText variant="label" color={colors.text.DEFAULT}>
                Sécurité Couvre-Feu (22h30)
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Courses suspendues la nuit pour protéger les coursiers et les colis.
              </AppText>
            </View>
          </View>

          <View style={styles.valueCard}>
            <View style={[styles.valueIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Zap size={18} color="#059669" />
            </View>
            <View style={styles.valueContent}>
              <AppText variant="label" color={colors.text.DEFAULT}>
                Alertes Courses en Temps Réel
              </AppText>
              <AppText variant="caption" color={colors.text.muted}>
                Attribution directe dès qu'un acheteur passe commande à Daloa.
              </AppText>
            </View>
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
    paddingBottom: spacing[9],
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing[1],
    marginBottom: spacing[4],
    paddingVertical: spacing[1],
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[5],
    flexWrap: 'wrap',
  },
  valueSection: {
    marginHorizontal: spacing[4],
    marginTop: spacing[6],
    gap: spacing[3],
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: spacing[3],
  },
  valueIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContent: {
    flex: 1,
  },
});
