import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

type Props = {
  value: number; // 0.0 〜 1.0
  color?: string;
  height?: number;
  backgroundColor?: string;
};

export function ProgressBar({
  value,
  color = COLORS.primary,
  height = 8,
  backgroundColor = COLORS.border,
}: Props) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <View style={[styles.track, { height, backgroundColor }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, height, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 99,
  },
});
