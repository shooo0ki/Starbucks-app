import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getReviewNotes } from '@/services/review.service';
import { COLORS } from '@/constants/colors';
import type { ReviewNote, Mood } from '@/types/review';

const MOOD_EMOJI: Record<Mood, string> = { good: '😊', okay: '😐', bad: '😔' };

export default function ReviewListScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<ReviewNote[]>([]);
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    (async () => {
      const result = await getReviewNotes({ q: query || undefined });
      setNotes(result);
    })();
  }, [query]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>振り返り記録</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/review/new')} activeOpacity={0.8}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="振り返り内容を検索"
          placeholderTextColor={COLORS.textDisabled}
          value={query}
          onChangeText={(t) => { setQuery(t); }}
          onSubmitEditing={load}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {notes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="journal-outline" size={52} color={COLORS.border} />
          <Text style={styles.emptyTitle}>振り返りがありません</Text>
          <Text style={styles.emptyDesc}>シフト後に気づきを記録しよう</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/review/new')}>
            <Text style={styles.emptyBtnText}>振り返りを記録する</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ReviewCard note={item} onPress={() => router.push(`/review/${item.id}`)} />}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={false}
        />
      )}
    </SafeAreaView>
  );
}

function ReviewCard({ note, onPress }: { note: ReviewNote; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{note.shiftDate}</Text>
        {note.mood && <Text style={styles.cardMood}>{MOOD_EMOJI[note.mood]}</Text>}
      </View>
      {note.goodThings ? (
        <Text style={styles.cardSnippet} numberOfLines={2}>{note.goodThings}</Text>
      ) : note.mistakes ? (
        <Text style={styles.cardSnippet} numberOfLines={2}>{note.mistakes}</Text>
      ) : (
        <Text style={styles.cardEmpty}>（内容なし）</Text>
      )}
      <Ionicons name="chevron-forward" size={14} color={COLORS.textDisabled} style={styles.arrow} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primaryDark, paddingHorizontal: 16, paddingVertical: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, margin: 12, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12,
  },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: COLORS.text },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, gap: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  cardMood: { fontSize: 18 },
  cardSnippet: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  cardEmpty: { fontSize: 13, color: COLORS.textDisabled, fontStyle: 'italic' },
  arrow: { alignSelf: 'flex-end' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptyDesc: { fontSize: 13, color: COLORS.textSecondary },
  emptyBtn: {
    marginTop: 8, backgroundColor: COLORS.primary,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
