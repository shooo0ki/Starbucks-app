import { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { runMigrations } from './migrations';
import { COLORS } from '@/constants/colors';

type DBContextValue = { isReady: boolean };
const DBContext = createContext<DBContextValue>({ isReady: false });

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    runMigrations()
      .then(() => setIsReady(true))
      .catch((e) => console.error('DB migration failed:', e));
  }, []);

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
