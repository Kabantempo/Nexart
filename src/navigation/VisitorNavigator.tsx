import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/theme';

import FeedStack         from './FeedStack';
import DiscoverStack     from './DiscoverStack';
import FavoritesScreen   from '../screens/visitor/FavoritesScreen';
import VisitorMessagesScreen from '../screens/visitor/VisitorMessagesScreen';
import VisitorProfileScreen  from '../screens/visitor/VisitorProfileScreen';

const Tab = createBottomTabNavigator();

export default function VisitorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
      }}
    >
      <Tab.Screen name="Fil"       component={FeedStack} />
      <Tab.Screen name="Découvrir" component={DiscoverStack} />
      <Tab.Screen name="Favoris"   component={FavoritesScreen} />
      <Tab.Screen name="Messages"  component={VisitorMessagesScreen} />
      <Tab.Screen name="Profil"    component={VisitorProfileScreen} />
    </Tab.Navigator>
  );
}
