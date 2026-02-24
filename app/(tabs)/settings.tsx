import { useState, useCallback } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSettings, updateSettings, resetAllData } from '@/services/settings.service';
import { COLORS } from '@/constants/colors';
import type { AppSettings } from '@/types/settings';
import type { Difficulty } from '@/types/practice';

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: 'beginner',     label: '初級' },
  { key: 'intermediate', label: '中級' },
  { key: 'advanced',     label: '上級' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const load = useCallback(() => {
    (async () => {
      const data = await getSettings();
      setSettings(data);
    })();
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!settings) return null;

  const update = async (patch: Partial<Omit<AppSettings, 'updatedAt'>>) => {
    await updateSettings(patch);
    setSettings((prev) => prev ? { ...prev, ...patch } : prev);
  };

  const handleReset = () => {
    Alert.alert(
      'データをリセット',
      '練習履歴・進捗・振り返り・マイレシピがすべて削除されます。\nこの操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット', style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Alert.alert('完了', 'データをリセットしました');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 練習設定 */}
        <Text style={styles.groupTitle}>練習設定</Text>
        <View style={styles.group}>
          <Text style={styles.itemLabel}>デフォルト難易度</Text>
          <View style={styles.diffRow}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d.key}
                style={[styles.diffChip, settings.defaultDifficulty === d.key && styles.diffChipActive]}
                onPress={() => update({ defaultDifficulty: d.key })}
                activeOpacity={0.7}
              >
                <Text style={[styles.diffChipText, settings.defaultDifficulty === d.key && styles.diffChipTextActive]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchBody}>
              <Text style={styles.itemLabel}>制限時間</Text>
              <Text style={styles.itemDesc}>練習問題に制限時間を設ける</Text>
            </View>
            <Switch
              value={settings.timerEnabled}
              onValueChange={(v) => update({ timerEnabled: v })}
              trackColor={{ true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchBody}>
              <Text style={styles.itemLabel}>分量クイズ</Text>
              <Text style={styles.itemDesc}>手順に加えて分量問題も出題する</Text>
            </View>
            <Switch
              value={settings.qtyQuizEnabled}
              onValueChange={(v) => update({ qtyQuizEnabled: v })}
              trackColor={{ true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* 端末設定 */}
        <Text style={styles.groupTitle}>端末設定</Text>
        <View style={styles.group}>
          <View style={styles.switchRow}>
            <View style={styles.switchBody}>
              <Text style={styles.itemLabel}>ハプティクス</Text>
              <Text style={styles.itemDesc}>操作時の振動フィードバック</Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(v) => update({ hapticsEnabled: v })}
              trackColor={{ true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* アプリ情報 */}
        <Text style={styles.groupTitle}>アプリ情報</Text>
        <View style={styles.group}>
          {[
            { label: 'バージョン', value: '1.0.0' },
            { label: 'ビルド番号', value: '1' },
          ].map((item, i) => (
            <View key={item.label}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.infoRow}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* データリセット */}
        <Text style={styles.groupTitle}>データ管理</Text>
        <View style={styles.group}>
          <TouchableOpacity style={styles.resetRow} onPress={handleReset} activeOpacity={0.75}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            <View style={styles.switchBody}>
              <Text style={[styles.itemLabel, { color: COLORS.error }]}>全データをリセット</Text>
              <Text style={styles.itemDesc}>練習履歴・進捗・振り返り・マイレシピを削除</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textDisabled} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primaryDark, paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  scroll: { padding: 16, gap: 6 },
  groupTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginTop: 12, marginBottom: 4, marginLeft: 4 },
  group: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 4,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  itemLabel: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  itemDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  diffRow: { flexDirection: 'row', gap: 8, paddingVertical: 10 },
  diffChip: {
    flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background,
  },
  diffChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  diffChipText: { fontSize: 13, color: COLORS.textSecondary },
  diffChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  switchBody: { flex: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoValue: { fontSize: 14, color: COLORS.textSecondary },
  resetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
});
