import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../stores/auth';
import { useConversations, ConversationSummary } from '../../hooks/useConversations';
import { useCreatorInquiries } from '../../hooks/useVisitorInquiry';
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

function ConversationRow({ item, userId, onPress }: { item: ConversationSummary; userId: string; onPress: () => void }) {
  const isCreator = item.creator_id === userId;
  const other     = isCreator ? item.organizer : item.creator;
  const otherName = other?.full_name ?? '—';
  const hasUnread = item.unread_count > 0;

  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[s.avatar, hasUnread && s.avatarUnread]}>
        <Text style={s.avatarText}>{otherName[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <View style={s.rowContent}>
        <View style={s.rowTop}>
          <Text style={[s.otherName, hasUnread && s.bold]} numberOfLines={1}>{otherName}</Text>
          {item.last_message && <Text style={s.time}>{timeAgo(item.last_message.created_at)}</Text>}
        </View>
        <Text style={s.eventName} numberOfLines={1}>{item.event?.title ?? '—'}</Text>
        {item.last_message
          ? <Text style={[s.preview, hasUnread && s.previewUnread]} numberOfLines={1}>
              {item.last_message.sender_id === userId ? 'Vous : ' : ''}{item.last_message.content}
            </Text>
          : <Text style={s.preview}>Démarrer la conversation</Text>
        }
      </View>
      {hasUnread && <View style={s.badge}><Text style={s.badgeText}>{item.unread_count}</Text></View>}
    </TouchableOpacity>
  );
}

// ─── Visitor inquiry row (for creators) ──────────────────────────────────────

function InquiryRow({ item, onReply }: { item: any; onReply: (id: string, msg: string, replyText: string) => void }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  return (
    <View style={s.inquiryCard}>
      <View style={s.inquiryHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{item.visitor?.full_name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.otherName}>{item.visitor?.full_name ?? 'Visiteur'}</Text>
          <Text style={s.time}>{timeAgo(item.created_at)}</Text>
        </View>
        {item.reply
          ? <View style={s.repliedBadge}><Text style={s.repliedText}>Répondu</Text></View>
          : <View style={s.pendingBadge}><Text style={s.pendingText}>En attente</Text></View>
        }
      </View>

      <View style={s.inquiryMsg}>
        <Text style={s.inquiryMsgText}>{item.message}</Text>
      </View>

      {item.reply && (
        <View style={s.inquiryReply}>
          <Text style={s.inquiryReplyLabel}>Votre réponse</Text>
          <Text style={s.inquiryReplyText}>{item.reply}</Text>
        </View>
      )}

      {!item.reply && !replying && (
        <TouchableOpacity style={s.replyBtn} onPress={() => setReplying(true)}>
          <Text style={s.replyBtnText}>Répondre</Text>
        </TouchableOpacity>
      )}

      {replying && (
        <View style={s.replyForm}>
          <TextInput
            style={s.replyInput}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Votre réponse…"
            placeholderTextColor={colors.text.secondary}
            multiline
            maxLength={500}
          />
          <View style={s.replyActions}>
            <TouchableOpacity style={s.cancelBtn} onPress={() => { setReplying(false); setReplyText(''); }}>
              <Text style={s.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.sendBtn, !replyText.trim() && { opacity: 0.5 }]}
              disabled={!replyText.trim()}
              onPress={() => { onReply(item.id, item.message, replyText.trim()); setReplying(false); setReplyText(''); }}
            >
              <Text style={s.sendText}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MessagesScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const { conversations, loading, refetch } = useConversations(profile?.id);
  const { inquiries, reply: replyToInquiry } = useCreatorInquiries(
    profile?.role === 'creator' ? profile?.id : undefined,
  );
  const [tab, setTab] = useState<'conv' | 'inquiries'>('conv');

  const isCreator  = profile?.role === 'creator';
  const unreadInq  = inquiries.filter(i => !i.reply).length;

  const handleReply = async (id: string, _msg: string, replyText: string) => {
    const err = await replyToInquiry(id, replyText);
    if (err) Alert.alert('Erreur', err.message);
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;

  return (
    <View style={s.container}>
      <Text style={s.title}>Messages</Text>

      {/* Tabs — only for creators */}
      {isCreator && (
        <View style={s.tabs}>
          <TouchableOpacity style={[s.tab, tab === 'conv' && s.tabActive]} onPress={() => setTab('conv')}>
            <Text style={[s.tabText, tab === 'conv' && s.tabTextActive]}>Conversations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, tab === 'inquiries' && s.tabActive]} onPress={() => setTab('inquiries')}>
            <Text style={[s.tabText, tab === 'inquiries' && s.tabTextActive]}>
              Demandes{unreadInq > 0 ? ` (${unreadInq})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'conv' ? (
        <FlatList
          data={conversations}
          keyExtractor={c => c.id}
          renderItem={({ item }) => (
            <ConversationRow
              item={item}
              userId={profile?.id ?? ''}
              onPress={() => {
                const isCreatorRow = item.creator_id === profile?.id;
                const other = isCreatorRow ? item.organizer : item.creator;
                navigation.navigate('Conversation', {
                  conversationId: item.id,
                  eventTitle: item.event?.title ?? 'Marché',
                  otherPartyName: other?.full_name ?? '—',
                  otherPartyId: other?.id,
                });
              }}
            />
          )}
          contentContainerStyle={s.list}
          onRefresh={refetch}
          refreshing={loading}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>💬</Text>
              <Text style={s.emptyTitle}>Aucune conversation</Text>
              <Text style={s.emptySubtitle}>Les conversations s'ouvrent après qu'une candidature est acceptée</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={inquiries}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <InquiryRow item={item} onReply={handleReply} />}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>✉️</Text>
              <Text style={s.emptyTitle}>Aucune demande</Text>
              <Text style={s.emptySubtitle}>Les visiteurs peuvent vous contacter depuis votre profil public</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.md },

  tabs: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  tabTextActive: { color: colors.text.inverse, fontWeight: '700' },

  list:      { paddingBottom: spacing.xxl },
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

  // Inquiry styles
  inquiryCard: { marginHorizontal: spacing.xl, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  inquiryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  repliedBadge: { backgroundColor: colors.secondary + '20', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  repliedText: { ...typography.caption, color: colors.secondary, fontWeight: '700' },
  pendingBadge: { backgroundColor: colors.primary + '20', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  pendingText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  inquiryMsg: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.sm, borderLeftWidth: 2, borderColor: colors.border, marginBottom: spacing.sm },
  inquiryMsgText: { ...typography.body, color: colors.text.primary },
  inquiryReply: { backgroundColor: colors.secondary + '10', borderRadius: radius.md, padding: spacing.sm, borderLeftWidth: 2, borderColor: colors.secondary },
  inquiryReplyLabel: { ...typography.caption, color: colors.secondary, fontWeight: '700', marginBottom: 2 },
  inquiryReplyText: { ...typography.caption, color: colors.text.primary },
  replyBtn: { alignSelf: 'flex-end', marginTop: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  replyBtnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
  replyForm: { marginTop: spacing.sm },
  replyInput: { backgroundColor: colors.background, color: colors.text.primary, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 80, textAlignVertical: 'top', marginBottom: spacing.sm },
  replyActions: { flexDirection: 'row', gap: spacing.sm },
  cancelBtn: { flex: 1, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelText: { ...typography.label, color: colors.text.secondary },
  sendBtn: { flex: 2, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  sendText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyIcon: { fontSize: 40, marginBottom: spacing.lg },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
  emptySubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
});
