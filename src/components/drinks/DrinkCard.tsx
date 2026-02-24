import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { Drink, DrinkCategory } from '@/types/drink';

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
  frappuccino:  'フラペ',
  seasonal:     'シーズナル',
  user_limited: 'マイレシピ',
};

const STATUS_STARS: Record<string, { count: number; color: string }> = {
  not_started: { count: 0, color: COLORS.border },
  learning:    { count: 1, color: COLORS.accent },
  mastered:    { count: 3, color: COLORS.accent },
};

type Props = {
  drink: Drink;
  onPress: (id: number) => void;
};

export function DrinkCard({ drink, onPress }: Props) {
  const catColor = CATEGORY_COLORS[drink.category];
  const catLabel = CATEGORY_LABELS[drink.category];
  const status = drink.progress?.status ?? 'not_started';
  const stars = STATUS_STARS[status] ?? STATUS_STARS.not_started;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(drink.id)}
      activeOpacity={0.75}
    >
      <View style={[styles.categoryBar, { backgroundColor: catColor }]} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{drink.nameJa}</Text>
          {drink.needsSleeve && (
            <Ionicons name="flame-outline" size={14} color={COLORS.hot} style={styles.sleeveIcon} />
          )}
        </View>
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: catColor + '22', borderColor: catColor }]}>
            <Text style={[styles.badgeText, { color: catColor }]}>{catLabel}</Text>
          </View>
          {drink.shortCode && (
            <Text style={styles.shortCode}>{drink.shortCode}</Text>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <View style={styles.stars}>
          {[0, 1, 2].map((i) => (
            <Ionicons
              key={i}
              name={i < stars.count ? 'star' : 'star-outline'}
              size={12}
              color={stars.color}
            />
          ))}
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textDisabled} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  categoryBar: {
    width: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  sleeveIcon: {
    marginLeft: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  shortCode: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  right: {
    paddingRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
});
