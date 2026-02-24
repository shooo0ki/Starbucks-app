import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { StepInput } from '@/services/drink.service';

type Props = {
  index: number;
  step: StepInput;
  total: number;
  onChange: (index: number, step: StepInput) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (index: number) => void;
};

export function StepFormCard({
  index, step, total, onChange, onMoveUp, onMoveDown, onRemove,
}: Props) {
  return (
    <View style={styles.card}>
      {/* ヘッダー行 */}
      <View style={styles.header}>
        <View style={styles.numberBadge}>
          <Text style={styles.number}>{index + 1}</Text>
        </View>
        <Text style={styles.title}>ステップ {index + 1}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onMoveUp(index)}
            disabled={index === 0}
            style={[styles.iconBtn, index === 0 && styles.iconBtnDisabled]}
            hitSlop={6}
          >
            <Ionicons name="chevron-up" size={18} color={index === 0 ? COLORS.border : COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onMoveDown(index)}
            disabled={index === total - 1}
            style={[styles.iconBtn, index === total - 1 && styles.iconBtnDisabled]}
            hitSlop={6}
          >
            <Ionicons name="chevron-down" size={18} color={index === total - 1 ? COLORS.border : COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemove(index)}
            style={styles.iconBtn}
            hitSlop={6}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 説明テキスト */}
      <TextInput
        style={styles.input}
        value={step.description}
        onChangeText={(text) => onChange(index, { ...step, description: text })}
        placeholder="手順の説明を入力"
        placeholderTextColor={COLORS.textDisabled}
        multiline
        textAlignVertical="top"
      />

      {/* 必須/任意トグル */}
      <TouchableOpacity
        style={styles.requiredRow}
        onPress={() => onChange(index, { ...step, isRequired: !step.isRequired })}
        activeOpacity={0.7}
      >
        <View style={[styles.toggle, step.isRequired && styles.toggleOn]}>
          <View style={[styles.thumb, step.isRequired && styles.thumbOn]} />
        </View>
        <Text style={styles.requiredLabel}>
          {step.isRequired ? '必須ステップ' : '任意ステップ'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { fontSize: 12, fontWeight: '700', color: '#fff' },
  title: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 4 },
  iconBtnDisabled: { opacity: 0.3 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 72,
    backgroundColor: COLORS.background,
  },
  requiredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: COLORS.primary },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  thumbOn: { alignSelf: 'flex-end' },
  requiredLabel: { fontSize: 12, color: COLORS.textSecondary },
});
