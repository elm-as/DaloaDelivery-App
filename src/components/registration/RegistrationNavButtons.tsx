import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { registrationStyles as styles } from './registrationStyles';

interface Props {
  step: number;
  submitting: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const RegistrationNavButtons: React.FC<Props> = ({
  step,
  submitting,
  canGoNext,
  onPrev,
  onNext,
  onSubmit,
}) => {
  return (
    <View style={styles.navRow}>
      {step > 1 && (
        <TouchableOpacity
          onPress={onPrev}
          disabled={submitting}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color="#374151" />
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      )}

      {step < 3 ? (
        <TouchableOpacity
          onPress={onNext}
          disabled={!canGoNext || submitting}
          style={[styles.nextBtn, !canGoNext && styles.btnDisabled]}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>Continuer</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onSubmit}
          disabled={!canGoNext || submitting}
          style={[styles.submitBtn, (!canGoNext || submitting) && styles.btnDisabled]}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Terminer mon inscription</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};
