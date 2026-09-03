import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '@daloa/ui';
import { X, ScanLine, Keyboard, Zap } from 'lucide-react-native';
import { Haptics } from '@daloa/utils';

export interface QrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  /** pickup = orange (vendeur), delivery = bleu (acheteur). */
  type: 'pickup' | 'delivery';
  /** Appelé avec le code OTP extrait du QR. */
  onCodeScanned: (code: string) => void;
  /** Ouvre le fallback de saisie manuelle. */
  onManualEntry: () => void;
}

/**
 * Scanner QR plein écran (100% Expo Go). Le livreur scanne le QR présenté par
 * le vendeur (pickup) ou l'acheteur (delivery). Le QR encode
 * `daloa:<type>:<orderRef>:<code>` ; on extrait le code à 4 chiffres.
 */
export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  visible,
  onClose,
  type,
  onCodeScanned,
  onManualEntry,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const isPickup = type === 'pickup';
  const accent = isPickup ? colors.primary.DEFAULT : colors.secondary.DEFAULT;
  const title = isPickup ? 'Scanner le colis vendeur' : 'Scanner la remise acheteur';
  const hint = isPickup
    ? 'Cadrez le QR code affiché sur le téléphone du vendeur.'
    : 'Cadrez le QR code affiché sur le téléphone de l’acheteur.';

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) return;
      setScanned(true);

      // Formats acceptés : "daloa:pickup:ORDER:1234" ou un code à 4 chiffres brut.
      let code = '';
      const qrMatch = data.match(/^daloa:(pickup|delivery):(.+):(\d{4,6})$/i);
      if (qrMatch) {
        code = qrMatch[3];
      } else {
        const digits = data.replace(/\D/g, '');
        if (digits.length >= 4 && digits.length <= 6) code = digits;
      }

      if (code) {
        Haptics.success();
        onCodeScanned(code);
      } else {
        Haptics.warning();
        // Laisse le scanner actif pour une nouvelle tentative.
        setTimeout(() => setScanned(false), 1200);
      }
    },
    [scanned, onCodeScanned]
  );

  const renderBody = () => {
    if (!permission) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <ScanLine size={40} color="#FFFFFF" />
          <Text style={styles.permTitle}>Accès caméra requis</Text>
          <Text style={styles.permText}>
            Autorisez la caméra pour scanner le QR code du {isPickup ? 'vendeur' : 'client'}.
          </Text>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: accent }]}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Text style={styles.permBtnText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
        {/* Overlay cadre de visée */}
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={[styles.frame, { borderColor: accent }]}>
              <View style={[styles.corner, styles.cornerTL, { borderColor: accent }]} />
              <View style={[styles.corner, styles.cornerTR, { borderColor: accent }]} />
              <View style={[styles.corner, styles.cornerBL, { borderColor: accent }]} />
              <View style={[styles.corner, styles.cornerBR, { borderColor: accent }]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        </View>
      </View>
    );
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  const handleManual = () => {
    Haptics.selection();
    handleClose();
    onManualEntry();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Validation instantanée par QR code</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: accent }]}>
            <Zap size={13} color="#FFFFFF" />
            <Text style={styles.typeBadgeText}>{isPickup ? 'Ramassage' : 'Livraison'}</Text>
          </View>
        </View>

        {/* Caméra */}
        <View style={styles.body}>{renderBody()}</View>

        {/* Fallback saisie manuelle */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleManual} style={styles.manualBtn} activeOpacity={0.85}>
            <Keyboard size={16} color="#FFFFFF" />
            <Text style={styles.manualBtnText}>Saisir le code à la main</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0F17' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginTop: 1 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  typeBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  body: { flex: 1 },
  cameraContainer: { flex: 1, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlayMiddle: { flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  frame: {
    width: 240,
    height: 240,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: { position: 'absolute', width: 26, height: 26, borderWidth: 4 },
  cornerTL: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  cornerTR: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  cornerBL: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  cornerBR: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    paddingTop: 24,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32 },
  permTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  permText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 19 },
  permBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  permBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  footer: { paddingHorizontal: 16, paddingBottom: 34, paddingTop: 12 },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  manualBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

