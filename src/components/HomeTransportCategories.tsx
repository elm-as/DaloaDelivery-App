import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bike, Car, Truck } from 'lucide-react-native';
import { colors, radii, spacing, AppText, AppPressable, typography } from '@daloa/ui';

interface HomeTransportCategoriesProps {
  onSelectCategory: (category: string) => void;
  selectedCategory?: string;
}

const CATEGORIES = [
  { id: 'Moto', label: 'Moto', icon: Bike, color: colors.primary[700], bg: colors.primary[50] },
  { id: 'Vélo', label: 'Vélo', icon: Bike, color: '#0066CC', bg: '#E5F0FF' },
  { id: 'Voiture', label: 'Voiture', icon: Car, color: '#059669', bg: colors.status.successLight },
  { id: 'Triporteur', label: 'Triporteur', icon: Truck, color: colors.categories.home.text, bg: colors.status.warningLight },
];

export const HomeTransportCategories: React.FC<HomeTransportCategoriesProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <View style={styles.container}>
      <AppText variant="label" color={colors.text.DEFAULT} style={styles.sectionTitle}>
        MOYENS DE TRANSPORT
      </AppText>

      <View style={styles.grid}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <AppPressable
              key={cat.id}
              haptic="selection"
              onPress={() => onSelectCategory(cat.id)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
              accessibilityLabel={`Filtrer par ${cat.label}`}
            >
              <View style={[styles.iconWrap, { backgroundColor: cat.bg }]}>
                <Icon size={22} color={cat.color} strokeWidth={2.2} />
              </View>
              <AppText
                variant="caption"
                color={isSelected ? colors.primary.DEFAULT : colors.text.DEFAULT}
                style={styles.label}
              >
                {cat.label}
              </AppText>
            </AppPressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  sectionTitle: {
    fontFamily: typography.families.extrabold,
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: spacing[3],
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radii['2xl'],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.bg.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  cardSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary[50],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.families.bold,
    fontSize: 12,
  },
});
