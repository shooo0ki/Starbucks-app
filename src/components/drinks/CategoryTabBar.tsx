import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import type { UiCategory } from '@/utils/uiCategory';

type Tab = { key: UiCategory | 'all'; label: string };

const TABS: Tab[] = [
  { key: 'all',          label: 'すべて' },
  { key: 'coffee',       label: 'コーヒー' },
  { key: 'espresso',     label: 'エスプレッソ' },
  { key: 'frappuccino',  label: 'フラペチーノ' },
  { key: 'tea',          label: 'ティー' },
  { key: 'other',        label: 'その他' },
];

type Props = {
  selected: UiCategory | 'all';
  onChange: (key: UiCategory | 'all') => void;
};

export function CategoryTabBar({ selected, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {TABS.map((tab) => {
          const isActive = tab.key === selected;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  labelActive: {
    color: '#ffffff',
  },
});
