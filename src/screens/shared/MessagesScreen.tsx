import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../stores/auth';
import { useConversations, ConversationSummary } from '../../hooks/useConversations';
import { MessageStackParams } from '../../navigation/MessageStack';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = { navigation: StackNavigationProp<MessageStackParams, 'ConversationList'> };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "à l'instant";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

function ConversationRow({
  item, userId, onPress,
}: {
  item: ConversationSummary; userId: string; onPress: () => void;
}) {
  const isCreator = item.creator_id === userId;
  const other     = isCreator ? item.organizer : item.creator;
  const otherName = other?.full_name ?? '—';
  const initial   = otherName[0]?.toUpperCase() ?? '?';
  const hasUnread = item.unread_count > 0;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.avatar, hasUnread && styles.avatarUnread]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.otherName, hasUnread && styles.bold]} numberOfLines={1}>
            {otherName}
          </Text>
          {item.last_message && (
            <Text style={styles.time}>{timeAgo(item.last_message.created_at)}</Text>
          )}
        </View>
        <Text style={styles.eventName} numberOfLines={1}>{item.event?.title ?? '—'}</Text>
        {item.last_message ? (
          <Text style={[styles.preview, hasUnread && styles.previewUnread]} numberOfLines={1}>
            {item.last_message.sender_id === userId ? 'Vous : ' : ''}{item.last_message.content}
          </Text>
        ) : (
          <Text style={styles.preview}>Démarrer la conversation</Text>
        )}
      </View>
      {hasUnread && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function MessagesScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const { conversations, loading, refetch } = useConversations(profile?.id);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <ConversationRow
            item={item}
            userId={profile?.id ?? ''}
            onPress={() => {
              const isCreator = item.creator_id === profile?.id;
              const other = isCreator ? item.organizer : item.creator;
              navigation.navigate('Conversation', {
                conversationId: item.id,
                eventTitle:     item.event?.title ?? 'Marché',
                otherPartyName: other?.full_name ?? '—',
                otherPartyId:   other?.id,
              });
            }}
          />
        )}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={loading}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Aucun message</Text>
            <Text style={styles.emptySubtitle}>
              Les conversations s'ouvrent une fois qu'un organisateur accepte votre candidature
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  list:  { paddingBottom: spacing.xxl },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 76 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border },
  avatarUnread: { borderColor: colors.primary },
  avatarText: { ...typography.h3, color: colors.primary },
  rowContent: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  otherName: { ...typography.label, color: colors.text.primary, fontWeight: '500', flex: 1 },
  bold: { fontWeight: '700' },
  time: { ...typography.caption, color: colors.text.secondary, marginLeft: spacing.sm },
  eventName: { ...typography.caption, color: colors.primary, marginBottom: 2 },
  preview: { ...typography.caption, color: colors.text.secondary },
  previewUnread: { color: colors.text.primary, fontWeight: '600' },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { ...typography.caption, color: colors.text.inverse, fontWeight: '700', fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyIcon:     { fontSize: 40, marginBottom: spacing.lg },
  emptyTitle:    { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
  emptySubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
});
