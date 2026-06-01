import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

import FeedStack             from './FeedStack';
import DiscoverStack         from './DiscoverStack';
import VisitorMessagesScreen from '../screens/visitor/VisitorMessagesScreen';
import VisitorProfileScreen  from '../screens/visitor/VisitorProfileScreen';
import FavoritesScreen       from '../screens/visitor/FavoritesScreen';

const Tab = createBottomTabNavigator();
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; icon: IoniconName; iconActive: IoniconName; component: React.ComponentType<any> }[] = [
  { name: 'Fil',       icon: 'home-outline',       iconActive: 'home',        component: FeedStack },
  { name: 'Découvrir', icon: 'compass-outline',    iconActive: 'compass',     component: DiscoverStack },
  { name: 'Messages',  icon: 'chatbubble-outline', iconActive: 'chatbubble',  component: VisitorMessagesScreen },
  { name: 'Profil',    icon: 'person-outline',     iconActive: 'person',      component: VisitorProfileScreen },
  // Favoris accessible via le header (icône ♥) — pas dans la tab bar
  { name: 'Favoris',   icon: 'heart-outline',      iconActive: 'heart',       component: FavoritesScreen },
];

// Seuls les 4 premiers s'affichent dans la tab bar
const VISIBLE_TABS = TABS.slice(0, 4);

export default function VisitorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? tab?.iconActive ?? tab?.icon ?? 'home' : tab?.icon ?? 'home-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 72,
            paddingBottom: 14,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          // Cache l'onglet Favoris de la barre
          tabBarButton: route.name === 'Favoris' ? () => null : undefined,
          tabBarItemStyle: route.name === 'Favoris' ? { display: 'none' } : undefined,
        };
      }}
    >
      {TABS.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}
