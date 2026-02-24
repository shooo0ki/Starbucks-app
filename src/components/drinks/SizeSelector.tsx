import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

export type DrinkSize = 'S' | 'T' | 'G' | 'V';

const SIZES: { key: DrinkSize; label: string }[] = [
  { key: 'S', label: 'ショート' },
  { key: 'T', label: 'トール' },
  { key: 'G', label: 'グランデ' },
  { key: 'V', label: 'ベンティ' },
];

type Props = {
  selected: DrinkSize;
  onChange: (size: DrinkSize) => void;
};

export function SizeSelector({ selected, onChange }: Props) {
  return (
    <View style={styles.container}>
      {SIZES.map((s) => {
        const isActive = s.key === selected;
        return (
          <TouchableOpacity
            key={s.key}
            style={[styles.btn, isActive && styles.btnActive]}
            onPress={() => onChange(s.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.key, isActive && styles.keyActive]}>{s.key}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{s.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  btnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  key: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  keyActive: { color: COLORS.primary },
  label: {
    fontSize: 10,
    color: COLORS.textDisabled,
    marginTop: 2,
  },
  labelActive: { color: COLORS.primary },
});
