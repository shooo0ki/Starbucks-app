import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePracticeStore } from '@/store/practiceStore';
import { COLORS } from '@/constants/colors';
import type { PracticeOrder } from '@/types/practice';

const CAT_COLORS: Record<string, string> = {
  hot: COLORS.hot, ice: COLORS.ice, frappuccino: COLORS.frappuccino,
  seasonal: COLORS.seasonal, user_limited: COLORS.accent,
};

export default function OrdersScreen() {
  const router = useRouter();
  const { session, orderedOrders, setOrderedOrders } = usePracticeStore();

  if (!session) {
    router.replace('/(tabs)/practice');
    return null;
  }

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...orderedOrders];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setOrderedOrders(next.map((o, i) => ({ ...o, orderIndex: i })));
  };

  const moveDown = (index: number) => {
    if (index === orderedOrders.length - 1) return;
    const next = [...orderedOrders];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setOrderedOrders(next.map((o, i) => ({ ...o, orderIndex: i })));
  };

  const renderItem = ({ item, index }: { item: PracticeOrder; index: number }) => (
    <View style={styles.orderCard}>
      <View style={[styles.orderNum, { backgroundColor: CAT_COLORS[item.category] ?? COLORS.primary }]}>
        <Text style={styles.orderNumText}>{index + 1}</Text>
      </View>
      <View style={styles.orderBody}>
        <Text style={styles.drinkName}>{item.drinkName}</Text>
        <Text style={styles.sizeBadge}>サイズ: {item.size}</Text>
        {item.customLabel ? (
          <View style={styles.customRow}>
            <View style={styles.customTag}>
              <Text style={styles.customTagText}>カスタム</Text>
            </View>
            <Text style={styles.customText} numberOfLines={1}>{item.customLabel}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.orderActions}>
        <TouchableOpacity onPress={() => moveUp(index)} disabled={index === 0} hitSlop={6}>
          <Ionicons name="chevron-up" size={20} color={index === 0 ? COLORS.border : COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => moveDown(index)} disabled={index === orderedOrders.length - 1} hitSlop={6}>
          <Ionicons name="chevron-down" size={20} color={index === orderedOrders.length - 1 ? COLORS.border : COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>作業順の確認</Text>
          <Text style={styles.headerSub}>効率的な順番に並び替えよう</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={orderedOrders}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.hint}>
            <Ionicons name="information-circle-outline" size={13} color={COLORS.textSecondary} />
            {' '}同時に複数オーダーが入った場合の作業順を考えてみましょう
          </Text>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={() => router.push('/practice/question')} activeOpacity={0.8}>
          <Text style={styles.confirmText}>確定して問題を始める</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  hint: { fontSize: 12, color: COLORS.textSecondary, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  orderNumText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  orderBody: { flex: 1 },
  drinkName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  sizeBadge: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  customTag: {
    backgroundColor: COLORS.accent,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  customTagText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  customText: { fontSize: 11, color: COLORS.accent, flex: 1 },
  orderActions: { flexDirection: 'column', gap: 4 },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
