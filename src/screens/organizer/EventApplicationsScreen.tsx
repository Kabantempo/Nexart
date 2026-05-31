import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, ScrollView, Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { OrganizerEventStackParams } from '../../navigation/OrganizerEventStack';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../stores/auth';
import { getOrCreateConversation } from '../../hooks/useConversations';
import { submitReview, useHasReviewed } from '../../hooks/useReviews';
import { ApplicationStatus, ORGANIZER_REVIEW_TAGS } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<OrganizerEventStackParams, 'EventApplications'>;
  route: RouteProp<OrganizerEventStackParams, 'EventApplications'>;
};

interface ApplicationItem {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  created_at: string;
  creator: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    creator_profile: { disciplines: string[]; city: string | null } | null;
  };
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'En attente', color: colors.text.secondary, bg: colors.border },
  accepted: { label: 'Acceptée',   color: colors.secondary,      bg: colors.secondary + '25' },
  refused:  { label: 'Refusée',    color: colors.error,          bg: colors.error + '20' },
};

const FILTERS: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'Toutes',     value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'Acceptées',  value: 'accepted' },
  { label: 'Refusées',   value: 'refused' },
];

// ─── Review modal ─────────────────────────────────────────────────────────────

function ReviewModal({
  visible,
  creatorName,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  creatorName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, tags: string[]) => Promise<void>;
}) {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags]       = useState<string[]>([]);
  const [saving, setSaving]   = useState(false);

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Note requise', 'Donnez une note entre 1 et 5.'); return; }
    setSaving(true);
    await onSubmit(rating, comment, tags);
    setSaving(false);
    setRating(0); setComment(''); setTags([]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.panel}>
          <Text style={modal.title}>Évaluer {creatorName}</Text>

          <Text style={modal.label}>Note</Text>
          <View style={modal.stars}>
            {[1,2,3,4,5].map(n => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Text style={[modal.star, n <= rating && modal.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modal.label}>Tags</Text>
          <View style={modal.tagWrap}>
            {ORGANIZER_REVIEW_TAGS.map(t => (
              <TouchableOpacity
                key={t}
                style={[modal.tag, tags.includes(t) && modal.tagActive]}
                onPress={() => toggleTag(t)}
              >
                <Text style={[modal.tagText, tags.includes(t) && modal.tagTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modal.label}>Commentaire <Text style={modal.hint}>(100 max, optionnel)</Text></Text>
          <TextInput
            style={modal.input}
            value={comment}
            onChangeText={setComment}
            placeholder="Votre avis…"
            placeholderTextColor={colors.text.secondary}
            maxLength={100}
          />
          <Text style={modal.charCount}>{comment.length}/100</Text>

          <View style={modal.actions}>
            <TouchableOpacity style={modal.btnCancel} onPress={onClose}>
              <Text style={modal.btnCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[modal.btnSubmit, saving && { opacity: 0.6 }]} onPress={handleSubmit} disabled={saving}>
              <Text style={modal.btnSubmitText}>{saving ? 'Envoi…' : 'Envoyer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Application card ─────────────────────────────────────────────────────────

function ApplicationCard({
  item, eventId, organizerId, eventTitle,
  onDecide, onOpenConversation,
}: {
  item: ApplicationItem;
  eventId: string;
  organizerId: string;
  eventTitle: string;
  onDecide: (id: string, status: ApplicationStatus) => void;
  onOpenConversation: (creatorId: string, creatorName: string) => void;
}) {
  const cfg = STATUS_CONFIG[item.status];
  const disciplines = item.creator?.creator_profile?.disciplines ?? [];
  const city = item.creator?.creator_profile?.city;
  const hasReviewed = useHasReviewed(eventId, organizerId);
  const [showReview, setShowReview] = useState(false);

  const handleReview = async (rating: number, comment: string, tags: string[]) => {
    const { error } = await submitReview({
      eventId, reviewerId: organizerId, reviewedId: item.creator.id,
      reviewerRole: 'organizer', rating, comment, tags,
    });
    if (error) Alert.alert('Erreur', error);
    else { setShowReview(false); Alert.alert('Avis envoyé', 'Merci pour votre évaluation.'); }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.creator?.full_name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.creatorName}>{item.creator?.full_name ?? '—'}</Text>
          {city && <Text style={styles.creatorCity}>📍 {city}</Text>}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {disciplines.length > 0 && (
        <View style={styles.tagRow}>
          {disciplines.slice(0, 4).map(d => (
            <View key={d} style={styles.tag}><Text style={styles.tagText}>{d}</Text></View>
          ))}
          {disciplines.length > 4 && <Text style={styles.tagMore}>+{disciplines.length - 4}</Text>}
        </View>
      )}

      {item.message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText} numberOfLines={3}>{item.message}</Text>
        </View>
      )}

      <Text style={styles.date}>
        Candidature le {new Date(item.created_at).toLocaleDateString('fr-FR')}
      </Text>

      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnRefuse} onPress={() => onDecide(item.id, 'refused')}>
            <Text style={styles.btnRefuseText}>✕ Refuser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAccept} onPress={() => onDecide(item.id, 'accepted')}>
            <Text style={styles.btnAcceptText}>✓ Accepter</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'accepted' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnMsg} onPress={() => onOpenConversation(item.creator.id, item.creator.full_name)}>
            <Text style={styles.btnMsgText}>💬 Message</Text>
          </TouchableOpacity>
          {hasReviewed === false && (
            <TouchableOpacity style={styles.btnReview} onPress={() => setShowReview(true)}>
              <Text style={styles.btnReviewText}>★ Évaluer</Text>
            </TouchableOpacity>
          )}
          {hasReviewed === true && (
            <View style={styles.reviewedBadge}><Text style={styles.reviewedText}>✓ Évalué</Text></View>
          )}
        </View>
      )}

      <ReviewModal
        visible={showReview}
        creatorName={item.creator?.full_name ?? ''}
        onClose={() => setShowReview(false)}
        onSubmit={handleReview}
      />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EventApplicationsScreen({ navigation, route }: Props) {
  const { eventId, eventTitle } = route.params;
  const { profile } = useAuth();
  const rootNav = useNavigation<any>();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<ApplicationStatus | 'all'>('all');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('applications')
      .select(`
        id, status, message, created_at,
        creator:profiles!creator_id (
          id, full_name, avatar_url,
          creator_profile:creator_profiles (disciplines, city)
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    setApplications((data as unknown as ApplicationItem[]) ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleDecide = (applicationId: string, newStatus: ApplicationStatus) => {
    const label = newStatus === 'accepted' ? 'Accepter' : 'Refuser';
    const msg = newStatus === 'accepted'
      ? "L'artisan sera notifié de votre acceptation."
      : "L'artisan sera notifié du refus.";
    Alert.alert(`${label} cette candidature ?`, msg, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: label,
        style: newStatus === 'refused' ? 'destructive' : 'default',
        onPress: async () => {
          await supabase.from('applications').update({ status: newStatus }).eq('id', applicationId);
          fetchApplications();
        },
      },
    ]);
  };

  const handleOpenConversation = async (creatorId: string, creatorName: string) => {
    if (!profile?.id) return;
    const convId = await getOrCreateConversation(eventId, creatorId, profile.id);
    if (!convId) { Alert.alert('Erreur', 'Impossible d\'ouvrir la conversation.'); return; }
    rootNav.navigate('Messages', {
      screen: 'Conversation',
      params: { conversationId: convId, eventTitle, otherPartyName: creatorName },
    });
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);
  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    refused:  applications.filter(a => a.status === 'refused').length,
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Mes marchés</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={2}>{eventTitle}</Text>
      <Text style={styles.subtitle}>{counts.all} candidature{counts.all !== 1 ? 's' : ''}</Text>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterTab, filter === f.value && styles.filterTabActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterTabText, filter === f.value && styles.filterTabTextActive]}>
              {f.label} ({counts[f.value]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <ApplicationCard
              item={item}
              eventId={eventId}
              organizerId={profile?.id ?? ''}
              eventTitle={eventTitle}
              onDecide={handleDecide}
              onOpenConversation={handleOpenConversation}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucune candidature</Text>
              {filter !== 'all' && <Text style={styles.emptySubtitle}>dans cette catégorie</Text>}
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  backText: { color: colors.text.secondary },
  title: { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.text.secondary, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.xs, marginBottom: spacing.lg },
  filterTab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  filterTabTextActive: { color: colors.text.inverse, fontWeight: '700' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '25', alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h3, color: colors.primary },
  creatorName: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  creatorCity: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  statusBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  statusText: { ...typography.caption, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  tagText: { ...typography.caption, color: colors.text.secondary },
  tagMore: { ...typography.caption, color: colors.text.secondary, alignSelf: 'center' },
  messageBox: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, borderLeftWidth: 2, borderColor: colors.primary + '60' },
  messageText: { ...typography.caption, color: colors.text.primary, lineHeight: 18 },
  date: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btnRefuse: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.error, alignItems: 'center' },
  btnRefuseText: { ...typography.label, color: colors.error, fontWeight: '600' },
  btnAccept: { flex: 2, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.secondary, alignItems: 'center' },
  btnAcceptText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
  btnMsg: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  btnMsgText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  btnReview: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.secondary, alignItems: 'center' },
  btnReviewText: { ...typography.caption, color: colors.secondary, fontWeight: '600' },
  reviewedBadge: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  reviewedText: { ...typography.caption, color: colors.text.secondary },
  empty: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.text.secondary },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  panel: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl },
  title: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11, marginBottom: spacing.sm, marginTop: spacing.md },
  hint: { textTransform: 'none', letterSpacing: 0, color: colors.text.secondary + '99' },
  stars: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  star: { fontSize: 32, color: colors.border },
  starActive: { color: colors.primary },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  tagActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  tagText: { ...typography.caption, color: colors.text.secondary },
  tagTextActive: { color: colors.text.inverse, fontWeight: '600' },
  input: { backgroundColor: colors.background, color: colors.text.primary, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  charCount: { ...typography.caption, color: colors.text.secondary, textAlign: 'right', marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  btnCancel: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  btnCancelText: { ...typography.label, color: colors.text.secondary },
  btnSubmit: { flex: 2, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' },
  btnSubmitText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
