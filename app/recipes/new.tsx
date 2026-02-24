import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RecipeForm } from '@/components/drinks/RecipeForm';
import { createDrink } from '@/services/drink.service';
import { COLORS } from '@/constants/colors';
import type { CreateDrinkInput } from '@/services/drink.service';

export default function NewRecipeScreen() {
  const router = useRouter();

  const handleSubmit = (input: CreateDrinkInput) => {
    try {
      const id = createDrink(input);
      router.replace(`/recipes/${id}`);
    } catch (e) {
      console.error('createDrink error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>新規レシピ登録</Text>
        <View style={{ width: 32 }} />
      </View>
      <RecipeForm onSubmit={handleSubmit} submitLabel="登録する" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navTitle: { fontSize: 17, fontWeight: '600', color: '#ffffff' },
});
