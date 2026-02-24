import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Switch,
  TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StepFormCard } from './StepFormCard';
import { COLORS } from '@/constants/colors';
import { CATEGORY_LABELS, type CategoryLabel } from '@/constants/categoryLabels';
import type { CreateDrinkInput, StepInput } from '@/services/drink.service';
import type { DrinkCategory } from '@/types/drink';

const CATEGORIES: { key: DrinkCategory; label: string }[] = [
  { key: 'hot',          label: 'ホット' },
  { key: 'ice',          label: 'アイス' },
  { key: 'frappuccino',  label: 'フラペチーノ' },
  { key: 'seasonal',     label: 'シーズナル' },
  { key: 'user_limited', label: 'マイレシピ' },
];

type Props = {
  initialValue?: Partial<CreateDrinkInput>;
  onSubmit: (input: CreateDrinkInput) => void;
  onDelete?: () => void;
  submitLabel?: string;
};

export function RecipeForm({ initialValue, onSubmit, onDelete, submitLabel = '保存' }: Props) {
  const [nameJa, setNameJa] = useState(initialValue?.nameJa ?? '');
  const [shortCode, setShortCode] = useState(initialValue?.shortCode ?? '');
  const [category, setCategory] = useState<DrinkCategory>(initialValue?.category ?? 'user_limited');
  const [subCategory, setSubCategory] = useState(initialValue?.subCategory ?? '');
  const [label, setLabel] = useState<CategoryLabel | null>(
    CATEGORY_LABELS.includes((initialValue?.subCategory as CategoryLabel) ?? '')
      ? (initialValue?.subCategory as CategoryLabel)
      : null
  );
  const [needsSleeve, setNeedsSleeve] = useState(initialValue?.needsSleeve ?? false);
  const [specialEquipment, setSpecialEquipment] = useState(initialValue?.specialEquipment ?? '');
  const [memo, setMemo] = useState(initialValue?.memo ?? '');
  const [practiceEnabled, setPracticeEnabled] = useState(initialValue?.practiceEnabled ?? true);
  const [steps, setSteps] = useState<StepInput[]>(
    initialValue?.steps ?? [{ description: '', isRequired: true }]
  );

  const handleStepChange = (index: number, step: StepInput) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? step : s)));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSteps((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    setSteps((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleRemove = (index: number) => {
    if (steps.length === 1) {
      Alert.alert('削除できません', '最低1つのステップが必要です');
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setSteps((prev) => [...prev, { description: '', isRequired: true }]);
  };

  const handleSubmit = () => {
    if (!nameJa.trim()) {
      Alert.alert('入力エラー', 'ドリンク名を入力してください');
      return;
    }
    const emptyStep = steps.findIndex((s) => !s.description.trim());
    if (emptyStep !== -1) {
      Alert.alert('入力エラー', `ステップ ${emptyStep + 1} の説明が空です`);
      return;
    }
    onSubmit({
      nameJa: nameJa.trim(),
      shortCode: shortCode.trim() || undefined,
      category,
      subCategory: (label ?? subCategory.trim()) || undefined,
      needsSleeve,
      specialEquipment: specialEquipment.trim() || undefined,
      memo: memo.trim() || undefined,
      practiceEnabled,
      steps,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      {/* 基本情報 */}
      <Text style={styles.sectionTitle}>基本情報</Text>
      <View style={styles.section}>
        <View style={styles.field}>
          <Text style={styles.label}>ドリンク名 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={nameJa}
            onChangeText={setNameJa}
            placeholder="例: ストロベリーラテ"
            placeholderTextColor={COLORS.textDisabled}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>略称コード</Text>
          <TextInput
            style={styles.input}
            value={shortCode}
            onChangeText={setShortCode}
            placeholder="例: SL"
            placeholderTextColor={COLORS.textDisabled}
            autoCapitalize="characters"
            maxLength={6}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>カテゴリ <Text style={styles.required}>*</Text></Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.catChip, category === c.key && styles.catChipActive]}
                onPress={() => setCategory(c.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catChipText, category === c.key && styles.catChipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>サブカテゴリ</Text>
          <TextInput
            style={styles.input}
            value={subCategory}
            onChangeText={setSubCategory}
            placeholder="例: フルーツ系"
            placeholderTextColor={COLORS.textDisabled}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>カテゴリラベル（任意）</Text>
          <View style={styles.labelRow}>
            {CATEGORY_LABELS.map((l) => {
              const active = label === l;
              return (
                <TouchableOpacity
                  key={l}
                  style={[styles.labelChip, active && styles.labelChipActive]}
                  onPress={() => {
                    if (active) {
                      setLabel(null);
                      return;
                    }
                    setLabel(l);
                    setSubCategory(l); // 入力欄にも即反映
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.labelChipText, active && styles.labelChipTextActive]}>{l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.helpText}>選択するとサブカテゴリに反映されます（手入力より優先）</Text>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchBody}>
            <Text style={styles.label}>スリーブ必要</Text>
            <Text style={styles.switchDesc}>ホットドリンクのスリーブ要否</Text>
          </View>
          <Switch
            value={needsSleeve}
            onValueChange={setNeedsSleeve}
            trackColor={{ true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>特殊機材</Text>
          <TextInput
            style={styles.input}
            value={specialEquipment}
            onChangeText={setSpecialEquipment}
            placeholder="例: バイタミックス"
            placeholderTextColor={COLORS.textDisabled}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>メモ</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={memo}
            onChangeText={setMemo}
            placeholder="自由メモ（季節・注意点など）"
            placeholderTextColor={COLORS.textDisabled}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchBody}>
            <Text style={styles.label}>練習対象に含める</Text>
            <Text style={styles.switchDesc}>練習セッションでこのレシピを出題する</Text>
          </View>
          <Switch
            value={practiceEnabled}
            onValueChange={setPracticeEnabled}
            trackColor={{ true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* ステップ */}
      <Text style={styles.sectionTitle}>手順ステップ</Text>
      <View style={styles.stepsSection}>
        {steps.map((step, i) => (
          <StepFormCard
            key={i}
            index={i}
            step={step}
            total={steps.length}
            onChange={handleStepChange}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onRemove={handleRemove}
          />
        ))}
        <TouchableOpacity style={styles.addStepBtn} onPress={handleAddStep} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addStepText}>ステップを追加</Text>
        </TouchableOpacity>
      </View>

      {/* 保存ボタン */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
        <Text style={styles.submitText}>{submitLabel}</Text>
      </TouchableOpacity>

      {/* 削除ボタン（編集時のみ） */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          <Text style={styles.deleteText}>このレシピを削除</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 8 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 14,
  },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  required: { color: COLORS.error },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  catChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  catChipText: { fontSize: 13, color: COLORS.textSecondary },
  catChipTextActive: { color: COLORS.primary, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchBody: { flex: 1, gap: 2 },
  switchDesc: { fontSize: 11, color: COLORS.textSecondary },
  labelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  labelChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  labelChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  labelChipText: { fontSize: 12, color: COLORS.textSecondary },
  labelChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  helpText: { fontSize: 11, color: COLORS.textDisabled, marginTop: 4 },
  stepsSection: { gap: 10 },
  addStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: COLORS.primaryLight,
  },
  addStepText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 4,
  },
  deleteText: { fontSize: 14, color: COLORS.error },
});
