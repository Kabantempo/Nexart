import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';

import ManageEventsScreen from '../screens/organizer/ManageEventsScreen';
import EventApplicationsScreen from '../screens/organizer/EventApplicationsScreen';

export type OrganizerEventStackParams = {
  ManageEvents: undefined;
  EventApplications: { eventId: string; eventTitle: string };
};

const Stack = createStackNavigator<OrganizerEventStackParams>();

export default function OrganizerEventStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="ManageEvents"       component={ManageEventsScreen} />
      <Stack.Screen name="EventApplications"  component={EventApplicationsScreen} />
    </Stack.Navigator>
  );
}
