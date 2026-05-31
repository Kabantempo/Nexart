import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';

import FeedScreen       from '../screens/feed/FeedScreen';
import CreatePostScreen from '../screens/feed/CreatePostScreen';

export type FeedStackParams = {
  Feed:       undefined;
  CreatePost: undefined;
};

const Stack = createStackNavigator<FeedStackParams>();

export default function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Feed"       component={FeedScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    </Stack.Navigator>
  );
}
