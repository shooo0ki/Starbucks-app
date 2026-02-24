import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import type { Step } from '@/types/drink';
import type { DrinkSize } from './SizeSelector';

const SIZE_KEYS: Record<DrinkSize, keyof Step['ingredients'][number]> = {
  S: 'qtyShort',
  T: 'qtyTall',
  G: 'qtyGrande',
  V: 'qtyVenti',
};

type Props = {
  step: Step;
  size: DrinkSize;
};

export function StepCard({ step, size }: Props) {
  const qtyKey = SIZE_KEYS[size];
  const hasIngredients = step.ingredients.some((i) => i.name);

  return (
    <View style={[styles.card, !step.isRequired && styles.cardOptional]}>
      <View style={styles.numberBadge}>
        <Text style={styles.number}>{step.stepOrder}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.description}>{step.description}</Text>
        {!step.isRequired && (
          <Text style={styles.optionalLabel}>任意</Text>
        )}
        {hasIngredients && (
          <View style={styles.ingredients}>
            {step.ingredients.map((ing) => {
              const qty = ing[qtyKey] as number | null;
              if (!ing.name) return null;
              return (
                <View key={ing.id} style={styles.ingRow}>
                  <Text style={styles.ingName}>{ing.name}</Text>
                  {qty !== null ? (
                    <Text style={styles.ingQty}>
                      {qty}
                      {ing.unit ? ` ${ing.unit}` : ''}
                    </Text>
                  ) : (
                    <Text style={styles.ingQtyNA}>—</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardOptional: {
    opacity: 0.65,
    borderStyle: 'dashed',
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  number: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  body: { flex: 1, gap: 6 },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  optionalLabel: {
    fontSize: 11,
    color: COLORS.textDisabled,
    fontStyle: 'italic',
  },
  ingredients: {
    marginTop: 4,
    gap: 4,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: 8,
  },
  ingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingName: { fontSize: 13, color: COLORS.text },
  ingQty: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  ingQtyNA: { fontSize: 13, color: COLORS.textDisabled },
});
