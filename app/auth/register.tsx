import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { normalizePayoutNetwork } from '@daloa/config';
import { supabase, deliveryPersonService } from '@daloa/api';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { signInWithGoogle } from '../../src/lib/googleAuth';
import { RegistrationStepHeader } from '../../src/components/registration/RegistrationStepHeader';
import { AuthStep } from '../../src/components/registration/AuthStep';
import { PersonalInfoStep } from '../../src/components/registration/PersonalInfoStep';
import { ServiceInfoStep } from '../../src/components/registration/ServiceInfoStep';
import { ZonesSelectionModal } from '../../src/components/registration/ZonesSelectionModal';
import { AlreadyDriverView } from '../../src/components/registration/AlreadyDriverView';
import { RegistrationNavButtons } from '../../src/components/registration/RegistrationNavButtons';
import { registrationStyles as styles } from '../../src/components/registration/registrationStyles';

export default function DriverRegisterScreen() {
  const router = useRouter();
  const { user, refreshDriverProfile } = useDriverAuth();

  const [step, setStep] = useState(1);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [payoutNetwork, setPayoutNetwork] = useState('wave');
  const [payoutNumber, setPayoutNumber] = useState('');

  const [vehicleType, setVehicleType] = useState('Moto');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [coverageZones, setCoverageZones] = useState<string[]>([]);
  const [pricingDescription, setPricingDescription] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showZonesModal, setShowZonesModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuthAndProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await deliveryPersonService.getDeliveryPersonByUserId(session.user.id);
          if (profile) {
            setHasExistingProfile(true);
            return;
          }
          if (session.user.user_metadata?.full_name) {
            setFullName(session.user.user_metadata.full_name);
          }
          if (session.user.email) {
            setEmail(session.user.email);
          }
          setStep(2);
        }
      } catch (err) {
        console.warn('Erreur vérification profil livreur:', err);
      } finally {
        setIsCheckingProfile(false);
      }
    }
    checkAuthAndProfile();
  }, [user]);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMsg("Autorisation d'accès aux photos refusée.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      Haptics.success();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const existing = await deliveryPersonService.getDeliveryPersonByUserId(session.user.id);
        if (existing) {
          router.replace('/(tabs)');
          return;
        }
        if (session.user.user_metadata?.full_name) setFullName(session.user.user_metadata.full_name);
        if (session.user.email) setEmail(session.user.email);
        setStep(2);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Échec de la connexion Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const canGoNext = (): boolean => {
    if (step === 1) return email.trim().length > 0 && password.length >= 6 && password === confirmPassword;
    if (step === 2) return fullName.trim().length >= 2 && phone.trim().length >= 8;
    if (step === 3) return vehicleType.length > 0 && coverageZones.length > 0 && termsAccepted;
    return false;
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!email.includes('@')) {
        setErrorMsg('Veuillez renseigner un email valide.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Les mots de passe ne correspondent pas.');
        return;
      }
      Haptics.lightImpact();
      setStep(2);
    } else if (step === 2) {
      if (!phone.trim()) {
        setErrorMsg('Veuillez renseigner un numéro de téléphone joignable.');
        return;
      }
      Haptics.lightImpact();
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      setErrorMsg('Veuillez accepter les CGU pour finaliser votre inscription.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      let authUserId = user?.id;

      if (!authUserId) {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              role: 'livreur',
            },
          },
        });
        if (signUpErr) throw signUpErr;
        authUserId = signUpData.user?.id;
      }

      if (!authUserId) {
        throw new Error('Impossible de valider votre compte utilisateur.');
      }

      let uploadedPhotoUrl: string | null = null;
      if (photoUri) {
        try {
          uploadedPhotoUrl = await deliveryPersonService.uploadProfilePhoto(photoUri, authUserId);
        } catch (photoErr) {
          console.warn('Upload photo échoué (non bloquant):', photoErr);
        }
      }

      const cleanPayoutNetwork = normalizePayoutNetwork(payoutNetwork);

      await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          avatar_url: uploadedPhotoUrl || null,
          role: 'livreur',
          payout_network: cleanPayoutNetwork,
          payout_number: payoutNumber || phone.trim(),
        } as any)
        .eq('id', authUserId);

      await deliveryPersonService.createDeliveryPerson({
        user_id: authUserId,
        name: fullName.trim(),
        phone: phone.trim(),
        photo_url: uploadedPhotoUrl || null,
        is_available: true,
        vehicle_type: vehicleType,
        vehicle_details: vehicleDetails.trim(),
        coverage_zones: coverageZones,
        pricing_description: pricingDescription.trim(),
        payout_network: cleanPayoutNetwork,
        payout_number: payoutNumber || phone.trim(),
      });

      Haptics.success();
      await refreshDriverProfile();
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setErrorMsg(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isCheckingProfile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (hasExistingProfile) {
    return <AlreadyDriverView onGoToDashboard={() => router.replace('/(tabs)')} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <RegistrationStepHeader
        step={step}
        totalSteps={3}
        onBack={() => (step > 1 ? setStep(step - 1) : router.back())}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {errorMsg && (
          <View style={styles.errorBanner}>
            <AlertCircle size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <View style={styles.card}>
          {step === 1 && (
            <AuthStep
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onGoogleAuth={handleGoogleAuth}
              isGoogleLoading={isGoogleLoading}
            />
          )}

          {step === 2 && (
            <PersonalInfoStep
              fullName={fullName}
              setFullName={setFullName}
              phone={phone}
              setPhone={setPhone}
              photoUri={photoUri}
              onPickPhoto={handlePickPhoto}
              payoutNetwork={payoutNetwork}
              setPayoutNetwork={setPayoutNetwork}
              payoutNumber={payoutNumber}
              setPayoutNumber={setPayoutNumber}
            />
          )}

          {step === 3 && (
            <ServiceInfoStep
              vehicleType={vehicleType}
              setVehicleType={setVehicleType}
              vehicleDetails={vehicleDetails}
              setVehicleDetails={setVehicleDetails}
              coverageZones={coverageZones}
              onOpenZonesModal={() => setShowZonesModal(true)}
              pricingDescription={pricingDescription}
              setPricingDescription={setPricingDescription}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
            />
          )}
        </View>

        <RegistrationNavButtons
          step={step}
          submitting={submitting}
          canGoNext={canGoNext()}
          onPrev={() => setStep(step - 1)}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />

        {step === 1 && (
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Déjà coursier partenaire ? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <ZonesSelectionModal
        visible={showZonesModal}
        onClose={() => setShowZonesModal(false)}
        selectedZones={coverageZones}
        onToggleZone={(zone) => {
          setCoverageZones((prev) =>
            prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
          );
        }}
      />
    </SafeAreaView>
  );
}
