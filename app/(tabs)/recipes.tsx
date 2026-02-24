import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList,
  StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CategoryTabBar } from '@/components/drinks/CategoryTabBar';
import { DrinkCard } from '@/components/drinks/DrinkCard';
import { useDrinksByUiCategory } from '@/hooks/useDrinks';
import { COLORS } from '@/constants/colors';
import type { UiCategory } from '@/utils/uiCategory';

export default function RecipesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<UiCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const { drinks, isLoading, reload } = useDrinksByUiCategory(selectedCategory, query);

  const handleCategoryChange = useCallback((cat: UiCategory | 'all') => {
    setSelectedCategory(cat);
    setQuery('');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>レシピ</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/recipes/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* 検索バー */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ドリンク名・略称コードで検索"
          placeholderTextColor={COLORS.textDisabled}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* カテゴリタブ */}
      <CategoryTabBar selected={selectedCategory} onChange={handleCategoryChange} />

      {/* リスト */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : drinks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={COLORS.border} />
          <Text style={styles.emptyText}>該当するドリンクがありません</Text>
        </View>
      ) : (
        <FlatList
          data={drinks}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <DrinkCard
              drink={item}
              onPress={(id) => router.push(`/recipes/${id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          onRefresh={reload}
          refreshing={isLoading}
        />
      )}
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: COLORS.text,
  },
  list: { paddingVertical: 8, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
});
