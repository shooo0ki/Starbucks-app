import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getReviewNoteById, deleteReviewNote } from '@/services/review.service';
import { COLORS } from '@/constants/colors';
import type { ReviewNote, Mood } from '@/types/review';

const MOOD_MAP: Record<Mood, { emoji: string; label: string; color: string }> = {
  good: { emoji: '😊', label: 'よかった',   color: COLORS.success },
  okay: { emoji: '😐', label: 'まあまあ',   color: COLORS.warning },
  bad:  { emoji: '😔', label: 'しんどかった', color: COLORS.error },
};

type Section = { title: string; value: string | null; icon: React.ComponentProps<typeof Ionicons>['name'] };

export default function ReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<ReviewNote | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await getReviewNoteById(Number(id));
      setNote(data);
    })();
  }, [id]);

  if (!note) return null;

  const handleDelete = () => {
    Alert.alert('削除', 'この振り返りを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除', style: 'destructive',
        onPress: async () => {
          await deleteReviewNote(note.id);
          router.back();
        },
      },
    ]);
  };

  const sections: Section[] = [
    { title: 'うまくできたこと',             value: note.goodThings,  icon: 'checkmark-circle-outline' },
    { title: '難しかった・ミス',             value: note.mistakes,    icon: 'alert-circle-outline' },
    { title: '先輩・店長からのフィードバック', value: note.feedback,    icon: 'chatbubble-outline' },
    { title: '次のシフトまでに復習すること',   value: note.nextReview,  icon: 'book-outline' },
  ];

  const mood = note.mood ? MOOD_MAP[note.mood] : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{note.shiftDate}</Text>
        <View style={styles.navActions}>
          <TouchableOpacity onPress={() => router.push(`/review/new`)} hitSlop={8}>
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} hitSlop={8} style={{ marginLeft: 12 }}>
            <Ionicons name="trash-outline" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 手応え */}
        {mood && (
          <View style={[styles.moodBanner, { backgroundColor: mood.color + '22', borderColor: mood.color }]}>
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
          </View>
        )}

        {/* セクション */}
        {sections.map((s) =>
          s.value ? (
            <View key={s.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name={s.icon} size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>{s.title}</Text>
              </View>
              <Text style={styles.sectionContent}>{s.value}</Text>
            </View>
          ) : null
        )}

        <Text style={styles.meta}>記録日時: {note.createdAt.slice(0, 16).replace('T', ' ')}</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navbar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primaryDark, paddingHorizontal: 12, paddingVertical: 12,
  },
  navTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#fff', marginHorizontal: 8 },
  navActions: { flexDirection: 'row' },
  scroll: { padding: 16, gap: 12 },
  moodBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, borderWidth: 1, padding: 14,
  },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 16, fontWeight: '700' },
  section: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, gap: 8,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  sectionContent: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  meta: { fontSize: 11, color: COLORS.textDisabled, textAlign: 'right' },
});
