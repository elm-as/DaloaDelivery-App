import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { colors, radii, spacing } from '@daloa/ui';

interface Props {
  onGoToDashboard: () => void;
}

export const AlreadyDriverView: React.FC<Props> = ({ onGoToDashboard }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconWrapper}>
        <CheckCircle size={48} color="#10B981" />
      </View>
      <Text style={styles.title}>Vous êtes déjà livreur</Text>
      <Text style={styles.subtitle}>
        Vous possédez déjà un profil actif sur DaloaDelivery. Vos courses et vos gains vous attendent.
      </Text>
      <TouchableOpacity
        onPress={onGoToDashboard}
        style={styles.dashboardBtn}
        activeOpacity={0.85}
      >
        <Text style={styles.dashboardBtnText}>Accéder à mon tableau de bord</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing[6],
  },
  dashboardBtn: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.lg,
    width: '100%',
    alignItems: 'center',
  },
  dashboardBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
