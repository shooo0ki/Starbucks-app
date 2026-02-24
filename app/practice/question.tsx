import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePracticeStore } from '@/store/practiceStore';
import { getStepsForQuiz, submitResult } from '@/services/practice.service';
import { getPumpCount } from '@/services/custom-option.service';
import { COLORS } from '@/constants/colors';
import type { StepForQuiz } from '@/types/practice';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuestionScreen() {
  const router = useRouter();
  const { session, orderedOrders, currentOrderIndex, addResult, nextQuestion } = usePracticeStore();
  const [steps, setSteps] = useState<StepForQuiz[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const currentOrder = orderedOrders[currentOrderIndex];

  useEffect(() => {
    if (!currentOrder) return;
    (async () => {
      const raw = await getStepsForQuiz(currentOrder.drinkId, !!currentOrder.customLabel);
      if (raw.length === 0) {
        handleSkip();
        return;
      }
      setSteps(shuffle(raw));
      setSelectedIndex(null);
    })();
  }, [currentOrderIndex, currentOrder?.drinkId]);

  if (!session || !currentOrder) {
    router.replace('/(tabs)/practice');
    return null;
  }

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...steps];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSteps(next);
    setSelectedIndex(null);
  };

  const moveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const next = [...steps];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setSteps(next);
    setSelectedIndex(null);
  };

  const handleTap = (index: number) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      // swap
      const next = [...steps];
      [next[selectedIndex], next[index]] = [next[index], next[selectedIndex]];
      setSteps(next);
      setSelectedIndex(null);
    }
  };

  const handleAnswer = async () => {
    const userAnswer = steps.map((s) => s.id);
    const correctAnswer = [...steps].sort((a, b) => a.correctOrder - b.correctOrder).map((s) => s.id);
    const isCorrect = await submitResult({
      sessionId: session.sessionId,
      drinkId: currentOrder.drinkId,
      size: currentOrder.size,
      customLabel: currentOrder.customLabel,
      userAnswer,
      correctAnswer,
    });

    addResult({
      orderIndex: currentOrderIndex,
      drinkId: currentOrder.drinkId,
      drinkName: currentOrder.drinkName,
      size: currentOrder.size,
      customLabel: currentOrder.customLabel,
      isCorrect,
      userAnswer,
      correctAnswer,
    });

    router.push('/practice/feedback');
  };

  const handleSkip = () => {
    nextQuestion();
    if (currentOrderIndex + 1 >= orderedOrders.length) {
      router.replace('/practice/result');
    }
  };

  const total = orderedOrders.length;
  const progress = (currentOrderIndex + 1) / total;
  const customCategory = currentOrder.category === 'frappuccino' ? 'frappuccino' : 'hot_ice';
  const pumpCount = currentOrder.customLabel
    ? getPumpCount(currentOrder.customLabel, currentOrder.size, customCategory)
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.questionNum}>{currentOrderIndex + 1} / {total}</Text>
          <View style={styles.drinkInfo}>
            <Text style={styles.drinkName}>{currentOrder.drinkName}</Text>
            <Text style={styles.sizeLabel}>サイズ: {currentOrder.size}</Text>
            {currentOrder.customLabel ? (
              <View style={styles.customBadgeRow}>
                <View style={styles.customBadge}>
                  <Text style={styles.customBadgeText}>カスタム</Text>
                </View>
                <Text style={styles.customLabel}>
                  {currentOrder.customLabel}
                  {pumpCount != null ? `（${currentOrder.size}=${pumpCount}ポンプ）` : ''}
                </Text>
              </View>
            ) : null}
          </View>
      </View>
      </View>

      <View style={styles.instruction}>
        <Ionicons name="swap-vertical-outline" size={16} color={COLORS.primary} />
        <Text style={styles.instructionText}>
          タップして選択 → 移動先をタップ、または ↑↓ で並び替え
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {steps.map((step, index) => {
          const isSelected = selectedIndex === index;
          return (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.stepCard,
                step.isCustom && styles.stepCardCustom,
                isSelected && styles.stepCardSelected,
              ]}
              onPress={() => handleTap(index)}
              activeOpacity={0.75}
            >
              <View style={[
                styles.stepNum,
                step.isCustom && styles.stepNumCustom,
                isSelected && styles.stepNumSelected,
              ]}>
                <Text style={styles.stepNumText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                {step.isCustom && (
                  <View style={styles.stepCustomTag}>
                    <Text style={styles.stepCustomTagText}>カスタム手順</Text>
                  </View>
                )}
                <Text style={[styles.stepDesc, isSelected && styles.stepDescSelected]} numberOfLines={3}>
                  {step.description}
                </Text>
              </View>
              <View style={styles.stepArrows}>
                <TouchableOpacity onPress={() => moveUp(index)} disabled={index === 0} hitSlop={6}>
                  <Ionicons name="chevron-up" size={18} color={index === 0 ? COLORS.border : COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => moveDown(index)} disabled={index === steps.length - 1} hitSlop={6}>
                  <Ionicons name="chevron-down" size={18} color={index === steps.length - 1 ? COLORS.border : COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.answerBtn} onPress={handleAnswer} activeOpacity={0.8}>
          <Text style={styles.answerText}>回答する</Text>
          <Ionicons name="checkmark" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primaryDark, paddingBottom: 12 },
  progressBarTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressBarFill: { height: 4, backgroundColor: COLORS.accent },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  questionNum: { fontSize: 12, color: 'rgba(255,255,255,0.6)', width: 40 },
  drinkInfo: { flex: 1 },
  drinkName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  sizeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  customBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  customBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  customBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  customLabel: { fontSize: 12, color: '#FFE0A3', flex: 1, flexShrink: 1 },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  instructionText: { fontSize: 12, color: COLORS.primary, flex: 1 },
  scroll: { padding: 16, gap: 8 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepCardCustom: {
    borderColor: COLORS.accent,
    borderWidth: 1.5,
    backgroundColor: '#FFFBF2',
  },
  stepCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primaryLight,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumCustom: { backgroundColor: COLORS.accent },
  stepNumSelected: { backgroundColor: COLORS.primary },
  stepNumText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  stepDesc: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 18 },
  stepDescSelected: { color: COLORS.primaryDark },
  stepCustomTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0CC',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 3,
  },
  stepCustomTagText: { fontSize: 9, fontWeight: '700', color: COLORS.accent },
  stepArrows: { flexDirection: 'column', gap: 2 },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  answerText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
