import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bike } from 'lucide-react-native';
import { colors, AppText, Button, radii, spacing } from '@daloa/ui';

interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

export const UnauthenticatedProfileView: React.FC<Props> = ({ onLogin, onRegister }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary[400], colors.primary.DEFAULT, colors.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.unauthHeader}
      >
        <View style={styles.unauthIconCircle}>
          <Bike size={36} color={colors.primary[700]} />
        </View>
        <AppText variant="h1" color={colors.text.inverse} center>
          Profil Livreur
        </AppText>
        <AppText variant="body" color={colors.primary[100]} center style={{ marginTop: 4 }}>
          Connectez-vous pour gérer votre compte coursier.
        </AppText>
      </LinearGradient>

      <View style={styles.unauthCard}>
        <Button
          title="Se connecter"
          variant="primary"
          size="lg"
          onPress={onLogin}
          fullWidth
        />
        <View style={{ height: 12 }} />
        <Button
          title="Devenir coursier partenaire"
          variant="outline"
          size="lg"
          onPress={onRegister}
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grey[50],
  },
  unauthHeader: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[12],
    paddingBottom: spacing[10],
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
  },
  unauthIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  unauthCard: {
    backgroundColor: colors.bg.surface,
    marginHorizontal: spacing[4],
    marginTop: -spacing[4],
    borderRadius: radii['2xl'],
    padding: spacing[5],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});
