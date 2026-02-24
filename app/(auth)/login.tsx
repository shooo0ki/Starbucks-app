import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';

type Step = 'email' | 'otp';

export default function LoginScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) {
      // Supabase が返すエラーコードに応じたメッセージ
      const msg = error.message.toLowerCase();
      if (msg.includes('signups not allowed') || msg.includes('user not found') || msg.includes('not registered')) {
        Alert.alert('未登録', 'このメールアドレスは登録されていません。\n管理者に連絡してください。');
      } else {
        Alert.alert('送信エラー', `${error.message}\n\n時間をおいて再試行してください。`);
      }
      return;
    }
    setStep('otp');
    Alert.alert(
      'コードを送信しました',
      `${email.trim().toLowerCase()} に6桁のコードを送りました。\nメールが届かない場合はスパムフォルダをご確認ください。`,
      [{ text: 'OK' }]
    );
  }

  async function handleVerifyOtp() {
    if (otp.trim().length < 6) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: 'email',
    });
    setLoading(false);
    if (error) {
      Alert.alert('エラー', 'コードが正しくありません。もう一度お試しください');
    }
    // 成功時は AuthProvider の onAuthStateChange が session を更新し、
    // _layout.tsx のリダイレクトが (tabs) へ自動遷移させる
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* ロゴエリア */}
        <View style={styles.logoArea}>
          <Text style={styles.logoText}>☕</Text>
          <Text style={styles.title}>スタバ練習アプリ</Text>
          <Text style={styles.subtitle}>店舗メンバー専用</Text>
        </View>

        {step === 'email' ? (
          <View style={styles.form}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@gmail.com"
              placeholderTextColor={COLORS.textDisabled}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
            />
            <TouchableOpacity
              style={[styles.button, (!email.trim() || loading) && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={!email.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>確認コードを送信</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>
              {email} に届いた{'\n'}コードを入力
            </Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={otp}
              onChangeText={setOtp}
              placeholder="コードを入力"
              placeholderTextColor={COLORS.textDisabled}
              keyboardType="number-pad"
              maxLength={8}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleVerifyOtp}
            />
            <TouchableOpacity
              style={[styles.button, (otp.trim().length < 6 || loading) && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={otp.trim().length < 6 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>ログイン</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setStep('email');
                setOtp('');
              }}
            >
              <Text style={styles.backText}>← メールアドレスを変更</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
