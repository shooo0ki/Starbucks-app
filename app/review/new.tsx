import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { upsertReviewNote } from '@/services/review.service';
import { COLORS } from '@/constants/colors';
import type { Mood } from '@/types/review';

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'good', emoji: '😊', label: 'よかった' },
  { key: 'okay', emoji: '😐', label: 'まあまあ' },
  { key: 'bad',  emoji: '😔', label: 'しんどかった' },
];

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function NewReviewScreen() {
  const router = useRouter();
  const today = toDateString(new Date());
  const [shiftDate, setShiftDate] = useState(today);
  const [goodThings, setGoodThings] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [nextReview, setNextReview] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);

  const handleSave = () => {
    if (!shiftDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('入力エラー', 'シフト日をYYYY-MM-DD形式で入力してください');
      return;
    }
    try {
      upsertReviewNote({
        shiftDate,
        goodThings: goodThings.trim() || undefined,
        mistakes: mistakes.trim() || undefined,
        feedback: feedback.trim() || undefined,
        nextReview: nextReview.trim() || undefined,
        mood: mood ?? undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>シフト振り返り</Text>
        <TouchableOpacity onPress={handleSave} hitSlop={8}>
          <Text style={styles.saveBtn}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* シフト日 */}
        <View style={styles.field}>
          <Text style={styles.label}>シフト日 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={shiftDate}
            onChangeText={setShiftDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textDisabled}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            maxLength={10}
          />
        </View>

        {/* 手応え */}
        <View style={styles.field}>
          <Text style={styles.label}>今日の手応え</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.moodCard, mood === m.key && styles.moodCardActive]}
                onPress={() => setMood(mood === m.key ? null : m.key)}
                activeOpacity={0.75}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, mood === m.key && styles.moodLabelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* テキストフィールド群 */}
        {[
          { label: 'うまくできたこと', value: goodThings, onChange: setGoodThings, placeholder: 'レジ操作がスムーズになった、など' },
          { label: '難しかった・ミス', value: mistakes, onChange: setMistakes, placeholder: 'フラペのシロップ量を間違えた、など' },
          { label: '先輩・店長からのフィードバック', value: feedback, onChange: setFeedback, placeholder: 'スチームの温度が低かった、など' },
          { label: '次のシフトまでに復習すること', value: nextReview, onChange: setNextReview, placeholder: 'カフェラテの手順を確認する、など' },
        ].map((f) => (
          <View key={f.label} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={f.value}
              onChangeText={f.onChange}
              placeholder={f.placeholder}
              placeholderTextColor={COLORS.textDisabled}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },
  saveBtn: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  scroll: { padding: 16, gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  required: { color: COLORS.error },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface,
  },
  inputMulti: { minHeight: 88, textAlignVertical: 'top' },
  moodRow: { flexDirection: 'row', gap: 10 },
  moodCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, gap: 4,
  },
  moodCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 11, color: COLORS.textSecondary },
  moodLabelActive: { color: COLORS.primary, fontWeight: '600' },
});
