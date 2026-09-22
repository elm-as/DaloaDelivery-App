import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Bell, X, Shield, FileText, HelpCircle, Zap } from 'lucide-react-native';
import { colors, radii, spacing, AppText, typography } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import { useAvailableRunsBrief } from '@daloa/api';
import { useDriverAuth } from '../context/DriverAuthContext';

interface DeliveryTopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const DeliveryTopBar: React.FC<DeliveryTopBarProps> = ({
  title,
  showBack = false,
  onBack,
}) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  /* La cloche affichait un point rouge codé en dur, allumé en permanence, et
     deux notifications de démonstration. Elle montre désormais les vraies
     courses à prendre — et seulement pour un livreur connecté : un visiteur de
     l'annuaire n'a aucune course à récupérer. */
  const { isAuthenticated, driverProfile, isOnline } = useDriverAuth();
  const isDriver = Boolean(isAuthenticated && driverProfile);
  const { data: brief } = useAvailableRunsBrief(isDriver);
  const availableCount = isDriver ? brief?.count ?? 0 : 0;
  const availableRuns = isDriver ? brief?.runs ?? [] : [];

  const handleBack = () => {
    Haptics.selection();
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const isHome = !title || title === 'DaloaDelivery';

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.iconCircle}
            accessibilityLabel="Retour"
          >
            <ArrowLeft size={18} color={colors.text.body} strokeWidth={2.2} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          style={styles.brandRow}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          {isHome ? (
            <Text style={styles.brandName}>DaloaDelivery</Text>
          ) : (
            <Text style={styles.screenTitle} numberOfLines={1}>
              {title}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.rightGroup}>
        <TouchableOpacity
          onPress={() => {
            Haptics.lightImpact();
            setShowMenu(true);
          }}
          style={styles.iconCircle}
          accessibilityLabel="Menu d'options"
        >
          <MoreVertical size={18} color={colors.grey[600]} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.lightImpact();
            setShowNotifs(true);
          }}
          style={styles.iconCircle}
          accessibilityLabel={
            availableCount > 0
              ? `Notifications, ${availableCount} course${availableCount > 1 ? 's' : ''} disponible${availableCount > 1 ? 's' : ''}`
              : 'Notifications'
          }
        >
          <Bell size={18} color={colors.grey[600]} />
          {availableCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {availableCount > 9 ? '9+' : availableCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Menu Options */}
      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <AppText variant="subtitle" color={colors.text.DEFAULT}>
                Options DaloaDelivery
              </AppText>
              <TouchableOpacity onPress={() => setShowMenu(false)} hitSlop={8}>
                <X size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push('/legal/terms' as any);
              }}
            >
              <FileText size={16} color={colors.text.muted} />
              <AppText variant="body" color={colors.text.DEFAULT}>
                Conditions Générales (CGU)
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push('/legal/privacy' as any);
              }}
            >
              <Shield size={16} color={colors.text.muted} />
              <AppText variant="body" color={colors.text.DEFAULT}>
                Politique de confidentialité
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push('/legal/help' as any);
              }}
            >
              <HelpCircle size={16} color={colors.text.muted} />
              <AppText variant="body" color={colors.text.DEFAULT}>
                Aide & Support
              </AppText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Notifications */}
      <Modal visible={showNotifs} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowNotifs(false)}
        >
          <View style={styles.notifsCard}>
            <View style={styles.menuHeader}>
              <AppText variant="subtitle" color={colors.text.DEFAULT}>
                Notifications
              </AppText>
              <TouchableOpacity onPress={() => setShowNotifs(false)} hitSlop={8}>
                <X size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            {!isDriver ? (
              <>
                <View style={styles.notifItem}>
                  <View style={[styles.notifDot, { backgroundColor: colors.primary.DEFAULT }]} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" color={colors.text.DEFAULT} style={{ fontFamily: typography.families.bold }}>
                      Besoin d'une livraison rapide ?
                    </AppText>
                    <AppText variant="caption" color={colors.text.muted} style={{ marginTop: 2 }}>
                      Consultez notre annuaire pour trouver le livreur idéal à Daloa.
                    </AppText>
                  </View>
                </View>

                <View style={styles.notifItem}>
                  <View style={[styles.notifDot, { backgroundColor: colors.status.success }]} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" color={colors.text.DEFAULT} style={{ fontFamily: typography.families.bold }}>
                      Service Express Daloa
                    </AppText>
                    <AppText variant="caption" color={colors.text.muted} style={{ marginTop: 2 }}>
                      Tous nos livreurs partenaires sont vérifiés et disponibles sur WhatsApp.
                    </AppText>
                  </View>
                </View>
              </>
            ) : availableRuns.length === 0 ? (
              <View style={styles.notifEmpty}>
                <AppText variant="caption" color={colors.text.muted} style={{ textAlign: 'center' }}>
                  {isOnline
                    ? 'Aucune course disponible pour le moment.'
                    : 'Vous êtes hors ligne : passez en ligne pour recevoir les courses.'}
                </AppText>
              </View>
            ) : (
              <>
                {availableRuns.map((run) => (
                  <TouchableOpacity
                    key={run.assignmentId}
                    style={styles.notifItem}
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowNotifs(false);
                      router.push('/(tabs)/available' as any);
                    }}
                  >
                    <View style={[styles.notifDot, { backgroundColor: colors.primary.DEFAULT }]} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="caption" color={colors.text.DEFAULT} style={{ fontFamily: typography.families.bold }}>
                        Course à prendre · {run.deliveryPrice} FCFA
                      </AppText>
                      <AppText variant="caption" color={colors.text.muted} style={{ marginTop: 2 }} numberOfLines={1}>
                        {run.pickupLocation} → {run.dropoffLocation}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.notifCta}
                  activeOpacity={0.85}
                  onPress={() => {
                    setShowNotifs(false);
                    router.push('/(tabs)/available' as any);
                  }}
                >
                  <Zap size={14} color={colors.primary.DEFAULT} />
                  <AppText variant="caption" color={colors.primary.DEFAULT} style={{ fontFamily: typography.families.bold }}>
                    Voir les {availableCount} course{availableCount > 1 ? 's' : ''} disponible{availableCount > 1 ? 's' : ''}
                  </AppText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    backgroundColor: colors.bg.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    zIndex: 30,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 26,
    height: 26,
  },
  brandName: {
    fontSize: 18,
    fontFamily: typography.families.extrabold,
    color: colors.primary.DEFAULT,
    letterSpacing: -0.3,
  },
  screenTitle: {
    fontSize: 17,
    fontFamily: typography.families.extrabold,
    color: colors.text.DEFAULT,
    letterSpacing: -0.2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.grey[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.bg.subtle,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bg.surface,
  },
  unreadBadgeText: {
    color: colors.text.inverse,
    fontSize: 9,
    fontFamily: typography.families.black,
    fontVariant: ['tabular-nums'],
  },
  notifEmpty: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[2],
  },
  notifCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing[2],
    paddingVertical: spacing[2],
    borderRadius: radii.lg,
    backgroundColor: colors.primary[50],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  menuCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  notifsCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    gap: 12,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.subtle,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[50],
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
});
