import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';

import DiscoverHomeScreen       from '../screens/discover/DiscoverHomeScreen';
import PublicEventDetailScreen  from '../screens/discover/PublicEventDetailScreen';
import PublicCreatorProfile     from '../screens/discover/PublicCreatorProfileScreen';
import CreatorsListScreen       from '../screens/discover/CreatorsListScreen';

export type DiscoverStackParams = {
  DiscoverHome:          undefined;
  PublicEventDetail:     { eventId: string };
  PublicCreatorProfile:  { creatorId: string };
  CreatorsList:          { discipline?: string };
};

const Stack = createStackNavigator<DiscoverStackParams>();

export default function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="DiscoverHome"         component={DiscoverHomeScreen} />
      <Stack.Screen name="PublicEventDetail"    component={PublicEventDetailScreen} />
      <Stack.Screen name="PublicCreatorProfile" component={PublicCreatorProfile} />
      <Stack.Screen name="CreatorsList"         component={CreatorsListScreen} />
    </Stack.Navigator>
  );
}
