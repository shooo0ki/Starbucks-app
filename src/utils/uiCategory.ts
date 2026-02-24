import type { Drink } from '@/types/drink';
import { CATEGORY_LABELS } from '@/constants/categoryLabels';

export type UiCategory = 'coffee' | 'espresso' | 'frappuccino' | 'tea' | 'other';

export function mapToUiCategory(drink: Drink): UiCategory {
  // ラベル優先
  if (drink.subCategory && CATEGORY_LABELS.includes(drink.subCategory as any)) {
    const label = drink.subCategory as string;
    if (label.includes('コーヒ')) return 'coffee';
    if (label.includes('エスプレッソ')) return 'espresso';
    if (label.includes('フラペチーノ')) return 'frappuccino';
    if (label.includes('ティー')) return 'tea';
    return 'other';
  }

  // フラペチーノ優先
  if (drink.category === 'frappuccino' || drink.nameJa.includes('フラペ')) {
    return 'frappuccino';
  }

  // ティー系
  if (
    drink.category === 'seasonal' &&
    (drink.subCategory?.includes('ティー') || drink.nameJa.includes('ティー'))
  ) {
    return 'tea';
  }
  if (drink.subCategory?.includes('ティー') || drink.nameJa.includes('ティー')) {
    return 'tea';
  }

  // コーヒー（ドリップ/アメリカーノ系を優先）
  if (
    drink.nameJa.includes('アメリカーノ') ||
    drink.nameJa.includes('ドリップ') ||
    drink.nameJa.includes('コーヒー')
  ) {
    return 'coffee';
  }

  // チョコ・クリーム系などはその他へ
  if (
    drink.subCategory?.includes('チョコ') ||
    drink.nameJa.includes('チョコ') ||
    drink.nameJa.includes('ココア')
  ) {
    return 'other';
  }

  // エスプレッソ/ラテ/モカ/マキアート/カプチーノはエスプレッソ扱い
  if (
    drink.nameJa.includes('エスプレッソ') ||
    drink.nameJa.includes('ラテ') ||
    drink.nameJa.includes('モカ') ||
    drink.nameJa.includes('マキアート') ||
    drink.nameJa.includes('カプチーノ')
  ) {
    return 'espresso';
  }

  // デフォルト
  // それ以外のエスプレッソベース
  return 'espresso';
}
