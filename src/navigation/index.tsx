import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../stores/auth';
import { colors } from '../constants/theme';

// Lazy imports (screens à créer)
import AuthNavigator from './AuthNavigator';
import CreatorNavigator from './CreatorNavigator';
import OrganizerNavigator from './OrganizerNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, text: colors.text.primary, border: colors.border, primary: colors.primary, notification: colors.primary } }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : profile?.role === 'creator' ? (
          <Stack.Screen name="Creator" component={CreatorNavigator} />
        ) : (
          <Stack.Screen name="Organizer" component={OrganizerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
