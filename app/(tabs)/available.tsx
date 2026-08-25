import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDriverAuth } from '../../src/context/DriverAuthContext';
import { useAvailableRuns, deliveryService } from '@daloa/api';
import { colors, radii, spacing, typography, Header, EmptyState, Skeleton, Button } from '@daloa/ui';
import { DeliveryRunCard } from '../../src/components/DeliveryRunCard';
import { Zap, AlertCircle } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export default function AvailableRunsScreen() {
  const router = useRouter();
  const { driverProfile, isOnline, driverLocation, toggleOnlineStatus } = useDriverAuth();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const { data: runs, isLoading, refetch, isRefetching } = useAvailableRuns(
    driverLocation,
    isOnline
  );

  const runList = runs || [];

  const handleAcceptRun = async (assignmentId: string) => {
    if (!driverProfile?.id) {
      Alert.alert('Erreur', 'Profil livreur introuvable.');
      return;
    }

    try {
      setAcceptingId(assignmentId);
      await deliveryService.acceptRun(assignmentId, driverProfile.id);
      Haptics.success();
      router.push(`/run/${assignmentId}`);
    } catch (err: any) {
      Alert.alert('Course déjà prise', 'Un autre coursier vient d’accepter cette course.');
      refetch();
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Courses Disponibles"
        onBack={() => router.back()}
        rightAction={
          <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>{runList.length}</Text>
          </View>
        }
      />

      {!isOnline ? (
        <View style={styles.offlineBox}>
          <AlertCircle size={36} color="#F59E0B" />
          <Text style={styles.offlineTitle}>Vous êtes Hors Ligne</Text>
          <Text style={styles.offlineSub}>
            Passez En Ligne pour voir et accepter les livraisons en direct à Daloa.
          </Text>
          <Button
            title="Passer En Ligne"
            variant="delivery"
            size="md"
            onPress={() => toggleOnlineStatus(true)}
            style={{ marginTop: spacing[3] }}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.delivery.primary}
            />
          }
        >
          {isLoading ? (
            <View style={{ gap: spacing[3] }}>
              <Skeleton height={160} borderRadius={radii['2xl']} />
              <Skeleton height={160} borderRadius={radii['2xl']} />
            </View>
          ) : runList.length === 0 ? (
            <EmptyState
              icon={<Zap size={32} color={colors.delivery.primary} />}
              title="Aucune course disponible"
              description="Toutes les livraisons en cours sont déjà prises en charge. Restez connecté, de nouvelles courses arrivent !"
            />
          ) : (
            runList.map((run) => (
              <DeliveryRunCard
                key={run.assignmentId}
                run={run}
                onAccept={() => handleAcceptRun(run.assignmentId)}
                onPressDetails={() => router.push(`/run/${run.assignmentId}`)}
                isAccepting={acceptingId === run.assignmentId}
              />
            ))
          )}
        </ScrollView>
      )}
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
  badgeCount: {
    backgroundColor: colors.delivery.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: typography.weights.extrabold,
  },
  offlineBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[2],
  },
  offlineTitle: {
    color: colors.dark.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  offlineSub: {
    color: colors.dark.textMuted,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});
