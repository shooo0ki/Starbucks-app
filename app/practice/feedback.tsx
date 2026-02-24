import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePracticeStore } from '@/store/practiceStore';
import { getStepsForQuiz } from '@/services/practice.service';
import { getPumpCount } from '@/services/custom-option.service';
import { COLORS } from '@/constants/colors';
import type { StepForQuiz } from '@/types/practice';

export default function FeedbackScreen() {
  const router = useRouter();
  const { session, orderedOrders, currentOrderIndex, results, nextQuestion } = usePracticeStore();

  const latestResult = results[results.length - 1];

  const [allSteps, setAllSteps] = useState<StepForQuiz[]>([]);

  useEffect(() => {
    if (!latestResult) return;
    const hasCustom = !!latestResult.customLabel;
    (async () => {
      const steps = await getStepsForQuiz(latestResult.drinkId, hasCustom);
      setAllSteps(steps);
    })();
  }, [latestResult?.drinkId, latestResult?.customLabel]);

  if (!session || !latestResult) {
    router.replace('/(tabs)/practice');
    return null;
  }

  const isLast = currentOrderIndex >= orderedOrders.length - 1;

  const hasCustom = !!latestResult.customLabel;
  const pumpCount = latestResult.customLabel
    ? getPumpCount(latestResult.customLabel, latestResult.size)
    : null;

  // 正解ステップを取得して表示（カスタムの有無に合わせる）
  const correctSteps = [...allSteps].sort((a, b) => a.correctOrder - b.correctOrder);

  // ユーザー回答の順序でステップを並べる
  const userOrderedSteps = latestResult.userAnswer
    .map((id) => allSteps.find((s) => s.id === id))
    .filter(Boolean) as typeof allSteps;

  const handleNext = () => {
    nextQuestion();
    if (isLast) {
      router.replace('/practice/result');
    } else {
      router.replace('/practice/question');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { backgroundColor: latestResult.isCorrect ? COLORS.success : COLORS.error }]}>
        <Ionicons
          name={latestResult.isCorrect ? 'checkmark-circle' : 'close-circle'}
          size={40}
          color="#fff"
        />
        <View>
          <Text style={styles.verdict}>{latestResult.isCorrect ? '正解！' : '不正解'}</Text>
          <Text style={styles.drinkLabel}>
            {latestResult.drinkName}（{latestResult.size}）
          </Text>
          {latestResult.customLabel ? (
            <Text style={styles.customLabel}>
              カスタム: {latestResult.customLabel}
              {pumpCount != null ? `（${latestResult.size}=${pumpCount}ポンプ）` : ''}
            </Text>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!latestResult.isCorrect && (
          <>
            <Text style={styles.sectionTitle}>あなたの回答</Text>
            <View style={styles.stepList}>
              {userOrderedSteps.map((step, i) => {
                const isWrong = correctSteps[i]?.id !== step.id;
                return (
                  <View
                    key={step.id}
                    style={[
                      styles.stepRow,
                      step.isCustom && styles.stepRowCustom,
                      isWrong && styles.stepRowWrong,
                    ]}
                  >
                    <View style={[styles.stepBadge, isWrong ? styles.stepBadgeWrong : step.isCustom ? styles.stepBadgeCustom : undefined]}>
                      <Text style={styles.stepBadgeText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      {step.isCustom && <Text style={styles.stepCustomTag}>カスタム手順</Text>}
                      <Text style={[styles.stepText, isWrong && styles.stepTextWrong]} numberOfLines={2}>
                        {step.description}
                      </Text>
                    </View>
                    {isWrong && <Ionicons name="close" size={16} color={COLORS.error} />}
                  </View>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>正解の手順</Text>
          </>
        )}

        {(latestResult.isCorrect || !latestResult.isCorrect) && (
          <View style={styles.stepList}>
            {correctSteps.map((step, i) => (
              <View
                key={step.id}
                style={[
                  styles.stepRow,
                  styles.stepRowCorrect,
                  step.isCustom && styles.stepRowCustom,
                ]}
              >
                <View style={[styles.stepBadge, step.isCustom ? styles.stepBadgeCustom : styles.stepBadgeCorrect]}>
                  <Text style={styles.stepBadgeText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  {step.isCustom && (
                    <Text style={styles.stepCustomTag}>カスタム手順</Text>
                  )}
                  <Text style={styles.stepText} numberOfLines={2}>{step.description}</Text>
                </View>
                <Ionicons name="checkmark" size={16} color={step.isCustom ? COLORS.accent : COLORS.success} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.progress}>
          {results.length} / {orderedOrders.length} 問完了
        </Text>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextText}>{isLast ? '結果を見る' : '次の問題へ'}</Text>
          <Ionicons name={isLast ? 'trophy' : 'arrow-forward'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
    paddingVertical: 20,
  },
  verdict: { fontSize: 24, fontWeight: '800', color: '#fff' },
  drinkLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  customLabel: { fontSize: 12, color: '#FFE0A3', marginTop: 2 },
  scroll: { padding: 16, gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  stepList: { gap: 6 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepRowWrong: { borderColor: COLORS.error, backgroundColor: '#FFF5F5' },
  stepRowCorrect: { borderColor: COLORS.success, backgroundColor: '#F5FFF7' },
  stepRowCustom: { borderColor: COLORS.accent, backgroundColor: '#FFFBF2' },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textDisabled,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepBadgeWrong: { backgroundColor: COLORS.error },
  stepBadgeCorrect: { backgroundColor: COLORS.success },
  stepBadgeCustom: { backgroundColor: COLORS.accent },
  stepCustomTag: { fontSize: 9, fontWeight: '700', color: COLORS.accent, marginBottom: 2 },
  stepBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  stepText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 18 },
  stepTextWrong: { color: COLORS.error },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  progress: { textAlign: 'center', fontSize: 12, color: COLORS.textSecondary },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  nextText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
