import { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/ui/StatCard';
import { getDashboardSummary } from '@/services/dashboard.service';
import { COLORS } from '@/constants/colors';
import type { DashboardSummary } from '@/types/dashboard';
import type { DrinkCategory } from '@/types/drink';

const CAT_LABELS: Record<DrinkCategory, string> = {
  hot:          'ホット',
  ice:          'アイス',
  frappuccino:  'フラペチーノ',
  seasonal:     'シーズナル',
  user_limited: 'マイレシピ',
};

const CAT_COLORS: Record<DrinkCategory, string> = {
  hot:          COLORS.hot,
  ice:          COLORS.ice,
  frappuccino:  COLORS.frappuccino,
  seasonal:     COLORS.seasonal,
  user_limited: COLORS.accent,
};

export default function HomeScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    try {
      setSummary(getDashboardSummary());
    } catch (e) {
      console.error('Dashboard load error:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
    setRefreshing(false);
  }, [load]);

  const masteredRate = summary?.masteredRate ?? 0;
  const masteredPct = Math.round(masteredRate * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>スタバ研修アプリ</Text>
          <Text style={styles.headerTitle}>ダッシュボード</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/(tabs)/settings')}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* 習得率カード */}
        <View style={styles.masteryCard}>
          <View style={styles.masteryHeader}>
            <Text style={styles.masteryTitle}>ドリンク習得率</Text>
            <Text style={styles.masteryPct}>{masteredPct}%</Text>
          </View>
          <ProgressBar value={masteredRate} height={10} />
          <Text style={styles.masteryCount}>
            {summary?.masteredCount ?? 0} / {summary?.totalDrinkCount ?? 0} 品
          </Text>
        </View>

        {/* スタット 2列グリッド */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatCard
              icon="barbell-outline"
              iconColor={COLORS.primary}
              iconBg={COLORS.primaryLight}
              label="今週の練習"
              value={`${summary?.weeklyPracticeCount ?? 0} 回`}
            />
          </View>
          <View style={styles.gridItem}>
            <StatCard
              icon="alert-circle-outline"
              iconColor={COLORS.error}
              iconBg="#FFEBEE"
              label="要復習"
              value={`${summary?.unresolvedWrongCount ?? 0} 件`}
              onPress={
                (summary?.unresolvedWrongCount ?? 0) > 0
                  ? () => router.push('/wrong-answers')
                  : undefined
              }
            />
          </View>
        </View>

        {/* 苦手カテゴリ */}
        {summary?.weakestCategory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>苦手カテゴリ</Text>
            <TouchableOpacity
              style={styles.weakCard}
              onPress={() => router.push('/(tabs)/recipes')}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.weakDot,
                  { backgroundColor: CAT_COLORS[summary.weakestCategory] },
                ]}
              />
              <View style={styles.weakBody}>
                <Text style={styles.weakLabel}>
                  {CAT_LABELS[summary.weakestCategory]}
                </Text>
                {summary.weakestCategoryRate !== null && (
                  <Text style={styles.weakRate}>
                    正解率 {Math.round(summary.weakestCategoryRate * 100)}%
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textDisabled} />
            </TouchableOpacity>
          </View>
        )}

        {/* 直近の振り返り */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>直近の振り返り</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/review')}>
              <Text style={styles.sectionLink}>すべて見る</Text>
            </TouchableOpacity>
          </View>
          {summary?.latestReviewSnippet ? (
            <TouchableOpacity
              style={styles.reviewCard}
              onPress={() => router.push('/(tabs)/review')}
              activeOpacity={0.75}
            >
              <Text style={styles.reviewDate}>{summary.latestReviewDate}</Text>
              <Text style={styles.reviewSnippet}>{summary.latestReviewSnippet}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.reviewEmpty}>
              <Ionicons name="journal-outline" size={32} color={COLORS.border} />
              <Text style={styles.reviewEmptyText}>まだ振り返りがありません</Text>
              <TouchableOpacity
                style={styles.reviewCTA}
                onPress={() => router.push('/review/new')}
                activeOpacity={0.8}
              >
                <Text style={styles.reviewCTAText}>振り返りを記録する</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* クイックアクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クイックアクション</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => router.push('/(tabs)/practice')}
              activeOpacity={0.8}
            >
              <Ionicons name="barbell" size={20} color="#ffffff" />
              <Text style={styles.actionText}>練習を始める</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.primaryDark }]}
              onPress={() => router.push('/(tabs)/recipes')}
              activeOpacity={0.8}
            >
              <Ionicons name="book" size={20} color="#ffffff" />
              <Text style={styles.actionText}>レシピを見る</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  settingsBtn: { padding: 4 },
  scroll: { padding: 16, gap: 16 },

  masteryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masteryTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  masteryPct: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  masteryCount: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },

  grid: { flexDirection: 'row', gap: 12 },
  gridItem: { flex: 1 },

  section: { gap: 10 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  sectionLink: { fontSize: 13, color: COLORS.primary },

  weakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weakDot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  weakBody: { flex: 1 },
  weakLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  weakRate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewDate: { fontSize: 12, color: COLORS.textSecondary },
  reviewSnippet: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  reviewEmpty: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  reviewEmptyText: { fontSize: 13, color: COLORS.textSecondary },
  reviewCTA: {
    marginTop: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reviewCTAText: { fontSize: 13, color: '#ffffff', fontWeight: '600' },

  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
});
