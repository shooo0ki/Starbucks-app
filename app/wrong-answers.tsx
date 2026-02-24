import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getWrongAnswers, resolveWrongAnswer } from '@/services/wrong-answer.service';
import { createPracticeSession } from '@/services/practice.service';
import { usePracticeStore } from '@/store/practiceStore';
import { COLORS } from '@/constants/colors';
import type { WrongAnswerItem } from '@/services/wrong-answer.service';

const CAT_COLORS: Record<string, string> = {
  hot: COLORS.hot, ice: COLORS.ice, frappuccino: COLORS.frappuccino,
  seasonal: COLORS.seasonal, user_limited: COLORS.accent,
};

export default function WrongAnswersScreen() {
  const router = useRouter();
  const setSession = usePracticeStore((s) => s.setSession);
  const [items, setItems] = useState<WrongAnswerItem[]>([]);
  const [sort, setSort] = useState<'wrong_count_desc' | 'last_wrong_at_desc'>('wrong_count_desc');

  const load = useCallback(() => {
    (async () => {
      const result = await getWrongAnswers(sort);
      setItems(result);
    })();
  }, [sort]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleStartReview = async () => {
    try {
      const session = await createPracticeSession('advanced', 'all');
      setSession(session);
      router.push('/practice/orders');
    } catch {
      Alert.alert('エラー', '再練習セッションを開始できませんでした');
    }
  };

  const handleResolve = (item: WrongAnswerItem) => {
    Alert.alert('消化済みにする', `「${item.drinkName}」を要復習リストから外しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '消化済みにする',
        onPress: async () => {
          await resolveWrongAnswer(item.drinkId);
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>要復習リスト</Text>
        <View style={{ width: 32 }} />
      </View>

      {items.length > 0 && (
        <View style={styles.toolbar}>
          <View style={styles.sortRow}>
            {(['wrong_count_desc', 'last_wrong_at_desc'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.sortChip, sort === s && styles.sortChipActive]}
                onPress={() => setSort(s)}
              >
                <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>
                  {s === 'wrong_count_desc' ? '間違い回数順' : '最終間違い日順'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.reviewBtn} onPress={handleStartReview} activeOpacity={0.8}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.reviewBtnText}>再練習する</Text>
          </TouchableOpacity>
        </View>
      )}

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle" size={52} color={COLORS.success} />
          <Text style={styles.emptyTitle}>要復習ドリンクはありません</Text>
          <Text style={styles.emptyDesc}>練習を続けて弱点をなくしていこう！</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.catBar, { backgroundColor: CAT_COLORS[item.category] ?? COLORS.primary }]} />
              <TouchableOpacity
                style={styles.cardBody}
                onPress={() => router.push(`/recipes/${item.drinkId}`)}
                activeOpacity={0.75}
              >
                <View style={styles.cardMain}>
                  <Text style={styles.drinkName}>{item.drinkName}</Text>
                  <Text style={styles.drinkMeta}>
                    {item.shortCode ? `${item.shortCode} · ` : ''}
                    間違い {item.wrongCount}回
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.wrongCount}>{item.wrongCount}</Text>
                  <Text style={styles.wrongCountLabel}>回</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item)} hitSlop={4}>
                <Ionicons name="checkmark-done-outline" size={18} color={COLORS.success} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primaryDark, paddingHorizontal: 12, paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center' },
  toolbar: { padding: 12, gap: 8 },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  sortChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  sortText: { fontSize: 12, color: COLORS.textSecondary },
  sortTextActive: { color: COLORS.primary, fontWeight: '600' },
  reviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: COLORS.error, borderRadius: 10, paddingVertical: 12,
  },
  reviewBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  catBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  cardMain: { flex: 1 },
  drinkName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  drinkMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  cardRight: { alignItems: 'center' },
  wrongCount: { fontSize: 22, fontWeight: '800', color: COLORS.error },
  wrongCountLabel: { fontSize: 10, color: COLORS.textSecondary },
  resolveBtn: { paddingHorizontal: 12, paddingVertical: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptyDesc: { fontSize: 13, color: COLORS.textSecondary },
});
