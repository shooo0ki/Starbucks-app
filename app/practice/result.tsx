import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePracticeStore } from '@/store/practiceStore';
import { finishSession } from '@/services/practice.service';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COLORS } from '@/constants/colors';

export default function ResultScreen() {
  const router = useRouter();
  const { session, results, sessionStartMs, reset } = usePracticeStore();

  useEffect(() => {
    if (!session) return;
    (async () => {
      const durationSec = Math.round((Date.now() - sessionStartMs) / 1000);
      const correctCount = results.filter((r) => r.isCorrect).length;
      await finishSession(session.sessionId, correctCount, durationSec);
    })();
  }, []);

  if (!session) {
    router.replace('/(tabs)/practice');
    return null;
  }

  const correctCount = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const rate = total > 0 ? correctCount / total : 0;
  const durationSec = Math.round((Date.now() - sessionStartMs) / 1000);
  const wrongResults = results.filter((r) => !r.isCorrect);

  const getRateColor = (r: number) => {
    if (r >= 0.8) return COLORS.success;
    if (r >= 0.5) return COLORS.warning;
    return COLORS.error;
  };

  const getRateLabel = (r: number) => {
    if (r >= 0.9) return '素晴らしい！';
    if (r >= 0.7) return 'よくできました';
    if (r >= 0.5) return 'もう少し！';
    return '復習しよう';
  };

  const handleFinish = () => {
    reset();
    router.replace('/(tabs)/practice');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { backgroundColor: getRateColor(rate) }]}>
        <Ionicons name="trophy" size={36} color="#fff" />
        <View>
          <Text style={styles.rateLabel}>{getRateLabel(rate)}</Text>
          <Text style={styles.rateValue}>{correctCount} / {total} 正解</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 正解率ゲージ */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>正解率</Text>
            <Text style={[styles.rateNum, { color: getRateColor(rate) }]}>
              {Math.round(rate * 100)}%
            </Text>
          </View>
          <ProgressBar value={rate} color={getRateColor(rate)} height={12} />
          <Text style={styles.duration}>所要時間: {Math.floor(durationSec / 60)}分{durationSec % 60}秒</Text>
        </View>

        {/* 間違えたドリンク */}
        {wrongResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>間違えたドリンク（{wrongResults.length}件）</Text>
            <View style={styles.wrongList}>
              {wrongResults.map((r, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.wrongCard}
                  onPress={() => router.push(`/recipes/${r.drinkId}`)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="close-circle" size={18} color={COLORS.error} />
              <Text style={styles.wrongName}>
                {r.drinkName}
                {r.customLabel ? ` / ${r.customLabel}` : ''}
              </Text>
              <Text style={styles.wrongSize}>({r.size})</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.textDisabled} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* CTA */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => { reset(); router.replace('/review/new'); }}
            activeOpacity={0.8}
          >
            <Ionicons name="journal-outline" size={18} color="#fff" />
            <Text style={styles.ctaText}>振り返りを記録する</Text>
          </TouchableOpacity>
          {wrongResults.length > 0 && (
            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnSecondary]}
              onPress={() => { reset(); router.replace('/wrong-answers'); }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color={COLORS.primary} />
              <Text style={[styles.ctaText, styles.ctaTextSecondary]}>間違い問題を復習する</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} activeOpacity={0.8}>
            <Text style={styles.finishText}>練習設定に戻る</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  rateLabel: { fontSize: 20, fontWeight: '800', color: '#fff' },
  rateValue: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  scroll: { padding: 16, gap: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  rateNum: { fontSize: 28, fontWeight: '800' },
  duration: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' },
  section: { gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  wrongList: { gap: 6 },
  wrongCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wrongName: { flex: 1, fontSize: 14, color: COLORS.text },
  wrongSize: { fontSize: 12, color: COLORS.textSecondary },
  actions: { gap: 10 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  ctaBtnSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ctaText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  ctaTextSecondary: { color: COLORS.primary },
  finishBtn: { alignItems: 'center', paddingVertical: 12 },
  finishText: { fontSize: 14, color: COLORS.textSecondary },
});
