import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { OrganizerEventStackParams } from '../../navigation/OrganizerEventStack';
import { supabase } from '../../lib/supabase';
import { ApplicationStatus } from '../../types';
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
  { label: 'Toutes',      value: 'all' },
  { label: 'En attente',  value: 'pending' },
  { label: 'Acceptées',   value: 'accepted' },
  { label: 'Refusées',    value: 'refused' },
];

function ApplicationCard({
  item,
  onDecide,
}: {
  item: ApplicationItem;
  onDecide: (id: string, status: ApplicationStatus) => void;
}) {
  const cfg = STATUS_CONFIG[item.status];
  const disciplines = item.creator?.creator_profile?.disciplines ?? [];
  const city = item.creator?.creator_profile?.city;

  return (
    <View style={styles.card}>
      {/* Header */}
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

      {/* Disciplines */}
      {disciplines.length > 0 && (
        <View style={styles.tagRow}>
          {disciplines.slice(0, 4).map(d => (
            <View key={d} style={styles.tag}>
              <Text style={styles.tagText}>{d}</Text>
            </View>
          ))}
          {disciplines.length > 4 && (
            <Text style={styles.tagMore}>+{disciplines.length - 4}</Text>
          )}
        </View>
      )}

      {/* Message */}
      {item.message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText} numberOfLines={3}>{item.message}</Text>
        </View>
      )}

      <Text style={styles.date}>
        Candidature le {new Date(item.created_at).toLocaleDateString('fr-FR')}
      </Text>

      {/* Actions (uniquement si en attente) */}
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnRefuse}
            onPress={() => onDecide(item.id, 'refused')}
          >
            <Text style={styles.btnRefuseText}>✕ Refuser</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnAccept}
            onPress={() => onDecide(item.id, 'accepted')}
          >
            <Text style={styles.btnAcceptText}>✓ Accepter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function EventApplicationsScreen({ navigation, route }: Props) {
  const { eventId, eventTitle } = route.params;
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

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

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);
  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    refused:  applications.filter(a => a.status === 'refused').length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Mes marchés</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={2}>{eventTitle}</Text>
      <Text style={styles.subtitle}>{counts.all} candidature{counts.all !== 1 ? 's' : ''}</Text>

      {/* Filter tabs */}
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
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <ApplicationCard item={item} onDecide={handleDecide} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Aucune candidature</Text>
              {filter !== 'all' && (
                <Text style={styles.emptySubtitle}>dans cette catégorie</Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  back: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  backText: { color: colors.text.secondary },
  title: { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.text.secondary, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },

  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.xs, marginBottom: spacing.lg },
  filterTab: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  filterTabTextActive: { color: colors.text.inverse, fontWeight: '700' },

  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary + '25', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...typography.h3, color: colors.primary },
  creatorName: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  creatorCity: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  statusBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  statusText: { ...typography.caption, fontWeight: '700' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  tagText: { ...typography.caption, color: colors.text.secondary },
  tagMore: { ...typography.caption, color: colors.text.secondary, alignSelf: 'center' },

  messageBox: {
    backgroundColor: colors.background, borderRadius: radius.md,
    padding: spacing.sm, marginBottom: spacing.sm,
    borderLeftWidth: 2, borderColor: colors.primary + '60',
  },
  messageText: { ...typography.caption, color: colors.text.primary, lineHeight: 18 },

  date: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.md },

  actions: { flexDirection: 'row', gap: spacing.sm },
  btnRefuse: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.error, alignItems: 'center',
  },
  btnRefuseText: { ...typography.label, color: colors.error, fontWeight: '600' },
  btnAccept: {
    flex: 2, paddingVertical: spacing.sm, borderRadius: radius.md,
    backgroundColor: colors.secondary, alignItems: 'center',
  },
  btnAcceptText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.text.secondary },
});
