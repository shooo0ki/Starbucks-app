import { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { runMigrations } from './migrations';
import { COLORS } from '@/constants/colors';

type DBContextValue = { isReady: boolean };
const DBContext = createContext<DBContextValue>({ isReady: false });

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runMigrations()
      .then(() => setIsReady(true))
      .catch((e) => {
        console.error('DB migration failed:', e);
        setError(String(e));
      });
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 24 }}>
        <Text style={{ color: COLORS.error ?? '#e53e3e', fontSize: 16, textAlign: 'center', marginBottom: 8 }}>
          データベースの初期化に失敗しました
        </Text>
        <Text style={{ color: '#666', fontSize: 12, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <DBContext.Provider value={{ isReady }}>{children}</DBContext.Provider>;
}

export function useDB() {
  return useContext(DBContext);
}
