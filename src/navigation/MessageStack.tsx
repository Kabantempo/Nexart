import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';

import MessagesScreen      from '../screens/shared/MessagesScreen';
import ConversationScreen  from '../screens/shared/ConversationScreen';

export type MessageStackParams = {
  ConversationList: undefined;
  Conversation: {
    conversationId:     string;
    eventTitle:         string;
    otherPartyName:     string;
    otherPartyId?:      string;
    otherPartyAvatarUrl?: string | null;
  };
};

const Stack = createStackNavigator<MessageStackParams>();

export default function MessageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="ConversationList" component={MessagesScreen} />
      <Stack.Screen name="Conversation"     component={ConversationScreen} />
    </Stack.Navigator>
  );
}
