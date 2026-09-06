import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bike, Lock, Mail, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, Input, Button, KeyboardScreen } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { supabase, deliveryPersonService } from '@daloa/api';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { signInWithGoogle } from '../../src/lib/googleAuth';
import { GoogleIcon } from '../../src/components/GoogleIcon';
import { LoginValueProps } from '../../src/components/auth/LoginValueProps';
import { loginStyles as styles } from '../../src/components/auth/loginStyles';

export default function DriverLoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, isAuthenticated, driverProfile } = useDriverAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (driverProfile) {
        router.replace('/(tabs)/livreur' as any);
      } else {
        router.replace('/auth/register' as any);
      }
    }
  }, [isAuthenticated, driverProfile, router]);

  const handleLogin = async () => {
    if (!emailOrPhone.trim()) {
      setErrorMsg('Veuillez renseigner votre adresse e-mail ou numéro.');
      return;
    }
    if (!password) {
      setErrorMsg('Veuillez saisir votre mot de passe.');
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

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        Haptics.success();
        const driverProfile = await deliveryPersonService.getDeliveryPersonByUserId(session.user.id);
        if (driverProfile) {
          router.replace('/(tabs)' as any);
        } else {
          router.replace('/auth/register' as any);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Échec de la connexion avec Google');
    } finally {
      setIsGoogleLoading(false);
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
        keyboardShouldPersistTaps="handled"
      >
        {/* En-tête avec dégradé DaloaDelivery */}
        <LinearGradient
          colors={['#FFA726', '#FF9800', '#E65100']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.curvedHeader}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityLabel="Retour"
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.logoBadge}>
            <Bike size={32} color="#E65100" />
          </View>

          <Text style={styles.headerTitle}>Bon retour !</Text>
          <Text style={styles.headerSubtitle}>Espace Coursier & Livreur DaloaDelivery</Text>
        </LinearGradient>

        {/* Carte de connexion */}
        <View style={styles.formCard}>
          {errorMsg && (
            <View style={styles.errorBox}>
              <AlertCircle size={18} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Bouton Google OAuth */}
          <TouchableOpacity
            onPress={handleGoogleAuth}
            disabled={isGoogleLoading || isLoading}
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
            <Text style={styles.dividerText}>ou avec identifiants</Text>
            <View style={styles.dividerLine} />
          </View>

          <Input
            label="Email ou Numéro de téléphone *"
            placeholder="Ex: 07 01 02 03 04 ou coursier@daloa.ci"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            leftIcon={<Mail size={16} color={colors.text.subtle} />}
            autoCapitalize="none"
          />

          <View style={{ marginTop: spacing[2] }}>
            <Input
              label="Mot de passe *"
              placeholder="Votre mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={<Lock size={16} color={colors.text.subtle} />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.text.subtle} />
                  ) : (
                    <Eye size={18} color={colors.text.subtle} />
                  )}
                </TouchableOpacity>
              }
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/auth/reset-password' as any)}
            style={styles.forgotBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Button
            title={isLoading ? 'Connexion en cours...' : 'Se connecter'}
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleLogin}
            fullWidth
          />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Pas encore de compte livreur ? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
              <Text style={styles.registerLink}>Devenir coursier partenaire</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Propositions de valeur (identiques au Web) */}
        <LoginValueProps />
      </ScrollView>
    </KeyboardScreen>
  );
}
