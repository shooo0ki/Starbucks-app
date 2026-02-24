import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type TabConfig = {
  name: string;
  title: string;
  icon: IoniconsName;
  activeIcon: IoniconsName;
};

const TABS: TabConfig[] = [
  { name: 'index',    title: 'ホーム',  icon: 'home-outline',    activeIcon: 'home' },
  { name: 'recipes',  title: 'レシピ',  icon: 'book-outline',    activeIcon: 'book' },
  { name: 'practice', title: '練習',    icon: 'barbell-outline', activeIcon: 'barbell' },
  { name: 'review',   title: '記録',    icon: 'journal-outline', activeIcon: 'journal' },
  { name: 'settings', title: '設定',    icon: 'settings-outline',activeIcon: 'settings' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00704A',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
