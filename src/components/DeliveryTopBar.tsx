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
import { ArrowLeft, MoreVertical, Bell, X, Shield, FileText, HelpCircle } from 'lucide-react-native';
import { colors, radii, spacing, AppText } from '@daloa/ui';
import { Haptics } from '@daloa/utils';

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
            <ArrowLeft size={18} color="#374151" strokeWidth={2.2} />
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
          <MoreVertical size={18} color="#4B5563" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.lightImpact();
            setShowNotifs(true);
          }}
          style={styles.iconCircle}
          accessibilityLabel="Notifications"
        >
          <Bell size={18} color="#4B5563" />
          <View style={styles.unreadBadge} />
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
              <FileText size={16} color="#6B7280" />
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
              <Shield size={16} color="#6B7280" />
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
              <HelpCircle size={16} color="#6B7280" />
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

            <View style={styles.notifItem}>
              <View style={[styles.notifDot, { backgroundColor: '#FF6B00' }]} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color={colors.text.DEFAULT} style={{ fontWeight: '700' }}>
                  Besoin d'une livraison rapide ?
                </AppText>
                <AppText variant="caption" color={colors.text.muted} style={{ marginTop: 2 }}>
                  Consultez notre annuaire pour trouver le livreur idéal à Daloa.
                </AppText>
              </View>
            </View>

            <View style={styles.notifItem}>
              <View style={[styles.notifDot, { backgroundColor: '#10B981' }]} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color={colors.text.DEFAULT} style={{ fontWeight: '700' }}>
                  Service Express Daloa
                </AppText>
                <AppText variant="caption" color={colors.text.muted} style={{ marginTop: 2 }}>
                  Tous nos livreurs partenaires sont vérifiés et disponibles sur WhatsApp.
                </AppText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    fontWeight: '800',
    color: '#FF6B00',
    letterSpacing: -0.3,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
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
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F3F4F6',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
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
