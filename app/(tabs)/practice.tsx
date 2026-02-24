import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createPracticeSession } from '@/services/practice.service';
import { usePracticeStore } from '@/store/practiceStore';
import { COLORS } from '@/constants/colors';
import type { Difficulty, CategoryFilter } from '@/types/practice';

type DiffConfig = { key: Difficulty; label: string; desc: string; color: string };
type CatConfig = { key: CategoryFilter; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] };

const DIFFICULTIES: DiffConfig[] = [
  { key: 'beginner',     label: '初級',  desc: 'ホット系を中心にした基本問題',        color: COLORS.success },
  { key: 'intermediate', label: '中級',  desc: '全カテゴリをバランスよく出題',          color: COLORS.warning },
  { key: 'advanced',     label: '上級',  desc: '要復習ドリンクを優先して出題',          color: COLORS.error },
];

const CATEGORIES: CatConfig[] = [
  { key: 'all',         label: 'すべて',        icon: 'apps-outline' },
  { key: 'coffee',      label: 'コーヒー',      icon: 'cafe-outline' },
  { key: 'espresso',    label: 'エスプレッソ',  icon: 'construct-outline' },
  { key: 'frappuccino', label: 'フラペチーノ',  icon: 'ice-cream-outline' },
  { key: 'tea',         label: 'ティー',        icon: 'leaf-outline' },
  { key: 'other',       label: 'その他',        icon: 'color-palette-outline' },
];

export default function PracticeScreen() {
  const router = useRouter();
  const setSession = usePracticeStore((s) => s.setSession);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const session = await createPracticeSession(difficulty, category);
      setSession(session);
      router.push('/practice/orders');
    } catch (e: unknown) {
      const msg = e instanceof Error && e.message === 'ERR_NO_DRINKS'
        ? '対象のドリンクがありません。カテゴリを変えてお試しください。'
        : '練習セッションの作成に失敗しました';
      Alert.alert('エラー', msg);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>練習設定</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 難易度 */}
        <Text style={styles.sectionTitle}>難易度</Text>
        <View style={styles.difficultyList}>
          {DIFFICULTIES.map((d) => {
            const isActive = d.key === difficulty;
            return (
              <TouchableOpacity
                key={d.key}
                style={[styles.diffCard, isActive && { borderColor: d.color, borderWidth: 2 }]}
                onPress={() => setDifficulty(d.key)}
                activeOpacity={0.75}
              >
                <View style={[styles.diffBadge, { backgroundColor: d.color }]}>
                  <Text style={styles.diffBadgeText}>{d.label}</Text>
                </View>
                <View style={styles.diffBody}>
                  <Text style={styles.diffLabel}>{d.label}</Text>
                  <Text style={styles.diffDesc}>{d.desc}</Text>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={22} color={d.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* カテゴリ */}
        <Text style={styles.sectionTitle}>カテゴリ</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => {
            const isActive = c.key === category;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.catCard, isActive && styles.catCardActive]}
                onPress={() => setCategory(c.key)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={c.icon}
                  size={28}
                  color={isActive ? '#fff' : COLORS.textSecondary}
                />
                <Text style={[styles.catLabel, isActive && styles.catLabelActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 開始ボタン */}
        <TouchableOpacity
          style={[styles.startBtn, isStarting && styles.startBtnDisabled]}
          onPress={handleStart}
          activeOpacity={0.8}
          disabled={isStarting}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.startText}>練習を開始する（10問）</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  scroll: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  difficultyList: { gap: 10 },
  diffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diffBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  diffBody: { flex: 1 },
  diffLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  diffDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  catLabelActive: { color: '#fff' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    marginTop: 8,
  },
  startBtnDisabled: { opacity: 0.6 },
  startText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
