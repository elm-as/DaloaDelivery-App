import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { authService } from '@daloa/api';
import { colors, radii, spacing, typography, Header, Input, Button } from '@daloa/ui';
import { KeyRound, Mail } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function DriverResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner votre email.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(email.trim());
      Haptics.success();
      Alert.alert('Email envoyé', 'Consultez votre boîte mail pour réinitialiser votre mot de passe.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d’envoyer le lien');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mot de passe oublié" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconBox}>
          <KeyRound size={32} color={colors.primary.DEFAULT} />
        </View>

        <Text style={styles.title}>Récupération de compte</Text>
        <Text style={styles.sub}>
          Saisissez votre email pour recevoir le lien de réinitialisation.
        </Text>

        <Input
          label="Adresse Email"
          placeholder="votre-email@domaine.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={18} color={colors.grey[400]} />}
          containerStyle={{ width: '100%', marginTop: spacing[3] }}
        />

        <View style={{ width: '100%', marginTop: spacing[3] }}>
          <Button
            title="Envoyer le lien"
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleReset}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: spacing[4],
    alignItems: 'center',
    paddingTop: spacing[6],
    backgroundColor: '#F8F9FA',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: radii['2xl'],
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  title: {
    color: '#111827',
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  sub: {
    color: colors.grey[500],
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
    marginBottom: spacing[4],
  },
});
