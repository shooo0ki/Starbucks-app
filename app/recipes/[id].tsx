import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepCard } from '@/components/drinks/StepCard';
import { SizeSelector, type DrinkSize } from '@/components/drinks/SizeSelector';
import { getDrinkById } from '@/services/drink.service';
import { recordFirstViewed } from '@/services/progress.service';
import { COLORS } from '@/constants/colors';
import type { DrinkDetail, DrinkCategory } from '@/types/drink';

const CATEGORY_COLORS: Record<DrinkCategory, string> = {
  hot:          COLORS.hot,
  ice:          COLORS.ice,
  frappuccino:  COLORS.frappuccino,
  seasonal:     COLORS.seasonal,
  user_limited: COLORS.accent,
};

const CATEGORY_LABELS: Record<DrinkCategory, string> = {
  hot:          'ホット',
  ice:          'アイス',
  frappuccino:  'フラペチーノ',
  seasonal:     'シーズナル',
  user_limited: 'マイレシピ',
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [drink, setDrink] = useState<DrinkDetail | null>(null);
  const [size, setSize] = useState<DrinkSize>('T');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const drinkId = Number(id);
    const data = getDrinkById(drinkId);
    setDrink(data);
    setIsLoading(false);
    if (data) {
      recordFirstViewed(drinkId);
    }
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!drink) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>ドリンクが見つかりませんでした</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const catColor = CATEGORY_COLORS[drink.category];
  const catLabel = CATEGORY_LABELS[drink.category];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ナビバー */}
      <View style={[styles.navbar, { backgroundColor: COLORS.primaryDark }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{drink.nameJa}</Text>
        {drink.recipeType === 'user' && (
          <TouchableOpacity
            onPress={() => router.push(`/recipes/${drink.id}/edit`)}
            style={styles.editBtn}
            hitSlop={8}
          >
            <Ionicons name="pencil" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
        {drink.recipeType === 'builtin' && <View style={styles.editBtn} />}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ドリンクヘッダー */}
        <View style={[styles.drinkHeader, { borderLeftColor: catColor }]}>
          <View style={styles.drinkHeaderTop}>
            <Text style={styles.drinkName}>{drink.nameJa}</Text>
            {drink.needsSleeve && (
              <View style={styles.sleeveChip}>
                <Ionicons name="flame" size={12} color={COLORS.hot} />
                <Text style={styles.sleeveText}>スリーブ</Text>
              </View>
            )}
          </View>
          <View style={styles.drinkMeta}>
            <View style={[styles.catBadge, { backgroundColor: catColor + '22', borderColor: catColor }]}>
              <Text style={[styles.catLabel, { color: catColor }]}>{catLabel}</Text>
            </View>
            {drink.shortCode && (
              <Text style={styles.shortCode}>{drink.shortCode}</Text>
            )}
            {drink.specialEquipment && (
              <View style={styles.equipChip}>
                <Ionicons name="construct-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.equipText}>{drink.specialEquipment}</Text>
              </View>
            )}
          </View>
          {drink.memo ? (
            <Text style={styles.memo}>{drink.memo}</Text>
          ) : null}
        </View>

        {/* サイズ切替 */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionTitle}>サイズ</Text>
        </View>
        <SizeSelector selected={size} onChange={setSize} />

        {/* 手順 */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionTitle}>手順</Text>
          <Text style={styles.sectionCount}>{drink.steps.length}ステップ</Text>
        </View>
        <View style={styles.steps}>
          {drink.steps.map((step) => (
            <StepCard key={step.id} step={step} size={size} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, color: COLORS.textSecondary },
  backLink: { fontSize: 14, color: COLORS.primary },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  navTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 8,
  },
  editBtn: { width: 32, padding: 4 },
  scroll: { paddingBottom: 16 },
  drinkHeader: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  drinkHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drinkName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  sleeveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sleeveText: { fontSize: 11, color: COLORS.hot, fontWeight: '600' },
  drinkMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  catLabel: { fontSize: 12, fontWeight: '600' },
  shortCode: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  equipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  equipText: { fontSize: 11, color: COLORS.textSecondary },
  memo: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  sectionCount: { fontSize: 13, color: COLORS.textSecondary },
  steps: { gap: 0 },
});
