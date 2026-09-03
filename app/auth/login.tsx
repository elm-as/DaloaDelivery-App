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
    <SafeAreaView style={styles.container}>
      <Header title="Connexion Livreur" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerBox}>
            <View style={styles.logoBox}>
              <Bike size={36} color={colors.primary.DEFAULT} />
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
            leftIcon={<Mail size={18} color={colors.grey[400]} />}
            autoCapitalize="none"
          />

          <Input
            label="Mot de passe *"
            placeholder="Votre mot de passe"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Lock size={18} color={colors.grey[400]} />}
          />

          <TouchableOpacity
            onPress={() => router.push('/auth/reset-password' as any)}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <View style={{ marginTop: 12 }}>
            <Button
              title="Se connecter"
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={handleLogin}
              fullWidth
            />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Pas encore de compte livreur ?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
              <Text style={styles.registerLink}>Devenir coursier partenaire</Text>
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
    marginBottom: spacing[6],
    marginTop: spacing[2],
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: radii['2xl'],
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  welcomeTitle: {
    color: '#111827',
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  welcomeSub: {
    color: colors.grey[500],
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: spacing[3],
  },
  forgotText: {
    color: colors.primary.DEFAULT,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  registerRow: {
    alignItems: 'center',
    marginTop: spacing[6],
    gap: 4,
  },
  registerPrompt: {
    color: colors.grey[500],
    fontSize: typography.sizes.xs,
  },
  registerLink: {
    color: colors.primary.DEFAULT,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
