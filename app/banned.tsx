import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, typography, Header, Input, Button, showAlert } from '@daloa/ui';
import { ShieldAlert, Send } from 'lucide-react-native';
import { useDriverAuth } from '../src/context/DriverAuthContext';
import { supabase } from '@daloa/api';

export default function DriverBannedScreen() {
  const router = useRouter();
  const { user, profile, logout } = useDriverAuth();
  const [appealReason, setAppealReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAppeal = async () => {
    if (!appealReason.trim()) {
      showAlert('Erreur', 'Veuillez expliciter les faits pour votre recours.');
      return;
    }

    try {
      setIsSubmitting(true);
      await supabase.from('ban_appeals').insert({
        user_id: user?.id || 'anonymous',
        full_name: profile?.full_name || 'Livreur',
        phone: profile?.phone || '',
        reason: appealReason.trim(),
        status: 'pending',
      });

      showAlert('Recours envoyé', 'L’équipe de modération logistique étudiera votre dossier.');
      setAppealReason('');
    } catch (err: any) {
      showAlert('Erreur', err.message || 'Impossible d’envoyer le recours');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Compte Livreur Suspendu" onBack={() => logout()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconBox}>
          <ShieldAlert size={48} color={colors.status.error} />
        </View>

        <Text style={styles.title}>Accès Coursier Suspendu</Text>
        <Text style={styles.sub}>
          Votre accès aux courses DaloaDelivery est restreint suite à un incident ou un non-respect de la charte.
        </Text>

        <Input
          label="Votre recours motivé *"
          placeholder="Expliquez la situation..."
          value={appealReason}
          onChangeText={setAppealReason}
          multiline
          numberOfLines={4}
          inputStyle={{ minHeight: 90, textAlignVertical: 'top' }}
        />

        <Button
          title="Soumettre mon recours"
          variant="danger"
          size="lg"
          loading={isSubmitting}
          onPress={handleAppeal}
          leftIcon={<Send size={16} color={colors.text.inverse} />}
          style={{ marginTop: spacing[2], width: '100%' }}
        />

        <Button
          title="Se déconnecter"
          variant="outline"
          size="md"
          onPress={() => logout()}
          style={{ marginTop: spacing[4], width: '100%' }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.surface,
  },
  scrollContent: {
    padding: spacing[4],
    alignItems: 'center',
    backgroundColor: colors.bg.DEFAULT,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.status.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing[4],
  },
  title: {
    color: colors.text.DEFAULT,
    fontSize: typography.sizes.xl,
    fontFamily: typography.families.bold,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  sub: {
    color: colors.grey[500],
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing[4],
  },
});
