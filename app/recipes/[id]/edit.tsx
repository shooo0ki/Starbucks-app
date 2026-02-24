import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RecipeForm } from '@/components/drinks/RecipeForm';
import { getDrinkById, updateDrink, deleteDrink } from '@/services/drink.service';
import { COLORS } from '@/constants/colors';
import type { DrinkDetail } from '@/types/drink';
import type { CreateDrinkInput } from '@/services/drink.service';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [drink, setDrink] = useState<DrinkDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const data = getDrinkById(Number(id));
    setDrink(data);
    setIsLoading(false);
  }, [id]);

  const handleSubmit = (input: CreateDrinkInput) => {
    try {
      updateDrink(Number(id), input);
      router.back();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'レシピを削除',
      `「${drink?.nameJa}」を削除しますか？\nこの操作は元に戻せません。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            try {
              deleteDrink(Number(id));
              router.dismissAll();
              router.replace('/(tabs)/recipes');
            } catch (e) {
              Alert.alert('エラー', '削除に失敗しました');
            }
          },
        },
      ]
    );
  };

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
          <Text>レシピが見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initialValue: Partial<CreateDrinkInput> = {
    nameJa: drink.nameJa,
    shortCode: drink.shortCode ?? undefined,
    category: drink.category,
    subCategory: drink.subCategory ?? undefined,
    needsSleeve: drink.needsSleeve,
    specialEquipment: drink.specialEquipment ?? undefined,
    memo: drink.memo ?? undefined,
    practiceEnabled: drink.practiceEnabled,
    steps: drink.steps.map((s) => ({
      description: s.description,
      isRequired: s.isRequired,
    })),
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          編集: {drink.nameJa}
        </Text>
        <View style={{ width: 32 }} />
      </View>
      <RecipeForm
        initialValue={initialValue}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel="変更を保存"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: { fontSize: 17, fontWeight: '600', color: '#ffffff', flex: 1, textAlign: 'center' },
});
