import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/theme';

import OrganizerHomeScreen from '../screens/organizer/HomeScreen';
import CreateEventScreen from '../screens/organizer/CreateEventScreen';
import ManageEventsScreen from '../screens/organizer/ManageEventsScreen';
import MessagesScreen from '../screens/shared/MessagesScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function OrganizerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
      }}
    >
      <Tab.Screen name="Tableau de bord" component={OrganizerHomeScreen} />
      <Tab.Screen name="Mes marchés" component={ManageEventsScreen} />
      <Tab.Screen name="Créer" component={CreateEventScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
