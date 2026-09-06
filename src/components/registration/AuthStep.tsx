import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { colors, radii, spacing, Input } from '@daloa/ui';
import { GoogleIcon } from '../GoogleIcon';

interface Props {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  onGoogleAuth: () => void;
  isGoogleLoading: boolean;
}

export const AuthStep: React.FC<Props> = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  onGoogleAuth,
  isGoogleLoading,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Créer vos accès livreur</Text>
      <Text style={styles.stepSubtitle}>
        Ces identifiants vous permettront de vous connecter à votre console.
      </Text>

      {/* Bouton Google OAuth */}
      <TouchableOpacity
        onPress={onGoogleAuth}
        disabled={isGoogleLoading}
        style={styles.googleBtn}
        activeOpacity={0.85}
      >
        {isGoogleLoading ? (
          <ActivityIndicator size="small" color="#4B5563" />
        ) : (
          <GoogleIcon size={20} />
        )}
        <Text style={styles.googleBtnText}>
          {isGoogleLoading ? 'Connexion Google…' : 'Continuer avec Google'}
        </Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou avec votre e-mail</Text>
        <View style={styles.dividerLine} />
      </View>

      <Input
        label="Adresse Email *"
        placeholder="votre@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={<Mail size={16} color={colors.text.subtle} />}
      />

      <View style={styles.passwordWrapper}>
        <Input
          label="Mot de passe *"
          placeholder="Au moins 6 caractères"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          leftIcon={<Lock size={16} color={colors.text.subtle} />}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeBtn}
          accessibilityLabel="Afficher/Masquer le mot de passe"
        >
          {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
        </TouchableOpacity>
      </View>

      <View style={styles.passwordWrapper}>
        <Input
          label="Confirmer le mot de passe *"
          placeholder="Retapez votre mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          leftIcon={<Lock size={16} color={colors.text.subtle} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing[3] },
  stepTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  stepSubtitle: { fontSize: 12, color: '#6B7280', marginTop: -4, marginBottom: 6 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: radii.xl,
    paddingVertical: 13,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleBtnText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
  passwordWrapper: { position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 36,
    padding: 4,
  },
});
