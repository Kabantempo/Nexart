import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MessageStackParams } from '../../navigation/MessageStack';
import { useAuth } from '../../stores/auth';
import { useMessages } from '../../hooks/useMessages';
import { Message } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<MessageStackParams, 'Conversation'>;
  route: RouteProp<MessageStackParams, 'Conversation'>;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function Bubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  return (
    <View style={[styles.bubbleWrap, isOwn && styles.bubbleWrapOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{msg.content}</Text>
      </View>
      <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>
        {formatTime(msg.created_at)}
        {isOwn && msg.read_at ? '  ✓✓' : ''}
      </Text>
    </View>
  );
}

export default function ConversationScreen({ navigation, route }: Props) {
  const { conversationId, eventTitle, otherPartyName } = route.params;
  const { profile } = useAuth();
  const { messages, loading, sending, sendMessage } = useMessages(conversationId, profile?.id);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    await sendMessage(content);
  };

  // Group messages by day
  const withDayHeaders: Array<Message | { type: 'day'; label: string; id: string }> = [];
  let lastDay = '';
  for (const msg of messages) {
    const day = msg.created_at.slice(0, 10);
    if (day !== lastDay) {
      withDayHeaders.push({ type: 'day', label: formatDay(msg.created_at), id: `day-${day}` });
      lastDay = day;
    }
    withDayHeaders.push(msg);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>{otherPartyName}</Text>
          <Text style={styles.headerEvent} numberOfLines={1}>{eventTitle}</Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={withDayHeaders}
          keyExtractor={item => ('id' in item ? item.id : item.id)}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            if ('type' in item && item.type === 'day') {
              return (
                <View style={styles.dayHeader}>
                  <Text style={styles.dayLabel}>{item.label}</Text>
                </View>
              );
            }
            const msg = item as Message;
            return <Bubble msg={msg} isOwn={msg.sender_id === profile?.id} />;
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>Commencez la conversation ✨</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Votre message…"
          placeholderTextColor={colors.text.secondary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending
            ? <ActivityIndicator color={colors.text.inverse} size="small" />
            : <Text style={styles.sendIcon}>↑</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn:    { padding: 4 },
  backText:   { ...typography.h2, color: colors.text.secondary },
  headerInfo: { flex: 1 },
  headerName: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  headerEvent:{ ...typography.caption, color: colors.primary },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  messageList: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexGrow: 1 },

  dayHeader: { alignItems: 'center', marginVertical: spacing.md },
  dayLabel:  { ...typography.caption, color: colors.text.secondary, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radius.full },

  bubbleWrap: { marginBottom: spacing.sm, maxWidth: '78%', alignSelf: 'flex-start' },
  bubbleWrapOwn: { alignSelf: 'flex-end' },
  bubble: { borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubbleOther: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleOwn:   { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleText:     { ...typography.body, color: colors.text.primary },
  bubbleTextOwn:  { color: colors.text.inverse },
  bubbleTime:     { ...typography.caption, color: colors.text.secondary, marginTop: 2, paddingHorizontal: 2 },
  bubbleTimeOwn:  { textAlign: 'right' },

  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyChatText: { ...typography.body, color: colors.text.secondary },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderTopWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1, ...typography.body, color: colors.text.primary,
    backgroundColor: colors.background, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendIcon: { ...typography.h3, color: colors.text.inverse, lineHeight: 24 },
});
