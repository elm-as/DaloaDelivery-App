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
import {
  colors,
  radii,
  spacing,
  typography,
  Header,
  Input,
  Button,
} from '@daloa/ui';
import { Bike, Lock, Mail } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function DriverLoginScreen() {
  const router = useRouter();
  const { login } = useDriverAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!emailOrPhone.trim()) {
      setErrorMsg('Veuillez saisir votre email ou numéro');
      return;
    }
    if (!password) {
      setErrorMsg('Veuillez saisir votre mot de passe');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      await login({ emailOrPhone: emailOrPhone.trim(), password });
      Haptics.success();
      router.back();
    } catch (err: any) {
      setErrorMsg(err.message || 'Identifiants livreur incorrects.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Connexion Livreur" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerBox}>
            <View style={styles.logoBox}>
              <Bike size={36} color={colors.delivery.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Espace Livreur DaloaDelivery</Text>
            <Text style={styles.welcomeSub}>
              Connectez-vous pour commencer à livrer et encaisser vos gains.
            </Text>
          </View>

          <Input
            label="Email ou Téléphone *"
            placeholder="Ex: 07 01 02 03 04"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            leftIcon={<Mail size={18} color={colors.dark.textDim} />}
            autoCapitalize="none"
          />

          <Input
            label="Mot de passe *"
            placeholder="Votre mot de passe"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Lock size={18} color={colors.dark.textDim} />}
          />

          <TouchableOpacity
            onPress={() => router.push('/auth/reset-password')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <Button
            title="Se connecter"
            variant="delivery"
            size="lg"
            loading={isLoading}
            onPress={handleLogin}
            style={styles.submitBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Pas encore livreur ?</Text>
            <TouchableOpacity onPress={() => router.replace('/auth/register')}>
              <Text style={styles.registerLink}>S'inscrire</Text>
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
    marginVertical: spacing[4],
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: radii['2xl'],
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  welcomeTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.xl,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: spacing[4],
  },
  forgotText: {
    color: colors.delivery.primary,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing[6],
  },
  footerText: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.sm,
  },
  registerLink: {
    color: colors.delivery.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
