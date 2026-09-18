import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { authService } from '@daloa/api';
import { colors, radii, spacing, Header, Input, Button, typography } from '@daloa/ui';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react-native';
import { Haptics, formatUserErrorMessage } from '@daloa/utils';

export default function DriverResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Veuillez renseigner une adresse email valide.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      await authService.resetPassword(email.trim());
      Haptics.success();
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(formatUserErrorMessage(err, 'Impossible d’envoyer le lien de réinitialisation.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mot de passe oublié" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isSuccess ? (
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <CheckCircle2 size={48} color={colors.status.success} />
            </View>
            <Text style={styles.title}>Email envoyé !</Text>
            <Text style={styles.sub}>
              Consultez votre boîte de réception à l'adresse{' '}
              <Text style={styles.emailHighlight}>{email}</Text>. Cliquez sur le lien reçu pour définir
              votre nouveau mot de passe.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.85}
            >
              <ArrowLeft size={18} color={colors.text.inverse} />
              <Text style={styles.backButtonText}>Retour à la connexion</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formCard}>
            <View style={styles.iconBox}>
              <KeyRound size={32} color={colors.primary.DEFAULT} />
            </View>

            <Text style={styles.title}>Récupération de compte</Text>
            <Text style={styles.sub}>
              Saisissez votre email de compte livreur pour recevoir un lien sécurisé.
            </Text>

            {errorMsg && (
              <View style={styles.errorBox}>
                <AlertCircle size={18} color={colors.status.errorDark} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <Input
              label="Adresse Email *"
              placeholder="Ex: coursier@daloa.ci"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.text.subtle} />}
              containerStyle={{ width: '100%', marginTop: spacing[2] }}
            />

            <View style={{ width: '100%', marginTop: spacing[4] }}>
              <Button
                title={isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
                variant="primary"
                size="lg"
                loading={isLoading}
                onPress={handleReset}
                fullWidth
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grey[50],
  },
  content: {
    padding: spacing[4],
    alignItems: 'center',
    paddingTop: spacing[6],
  },
  formCard: {
    width: '100%',
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    padding: spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.bg.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  successCard: {
    width: '100%',
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    padding: spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  title: {
    color: colors.text.DEFAULT,
    fontSize: 20,
    fontFamily: typography.families.bold,
    marginBottom: 6,
    textAlign: 'center',
  },
  sub: {
    color: colors.text.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing[5],
    maxWidth: 300,
  },
  emailHighlight: {
    fontFamily: typography.families.bold,
    color: colors.text.DEFAULT,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.status.errorLight,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: radii.md,
    padding: spacing[3],
    marginBottom: spacing[3],
    width: '100%',
  },
  errorText: {
    flex: 1,
    color: colors.status.errorDark,
    fontSize: 13,
    fontFamily: typography.families.medium,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    width: '100%',
    marginTop: spacing[4],
  },
  backButtonText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontFamily: typography.families.bold,
  },
});
