import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../stores/auth';
import { useEvents } from '../../hooks/useEvents';
import { useOrganizerApplications } from '../../hooks/useApplications';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { Event } from '../../types';

function EventCard({ event }: { event: Event }) {
  const start = new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const end = new Date(event.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const statusColor = event.status === 'published' ? colors.secondary : event.status === 'draft' ? colors.text.secondary : colors.error;

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.eventCity}>{event.city ?? '—'} · {start} → {end}</Text>
        <Text style={styles.eventStands}>{event.stand_count} stands</Text>
      </View>
      <View style={[styles.statusBadge, { borderColor: statusColor }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {event.status === 'published' ? 'Publié' : event.status === 'draft' ? 'Brouillon' : 'Fermé'}
        </Text>
      </View>
    </View>
  );
}

function ApplicationRow({ application }: { application: any }) {
  return (
    <View style={styles.appRow}>
      <View style={styles.appAvatar}>
        <Text style={styles.appAvatarText}>{application.creator?.full_name?.[0] ?? '?'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.appName}>{application.creator?.full_name ?? '—'}</Text>
        <Text style={styles.appDate}>
          {new Date(application.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      <View style={styles.pendingBadge}>
        <Text style={styles.pendingText}>En attente</Text>
      </View>
    </View>
  );
}

export default function OrganizerHomeScreen() {
  const { profile } = useAuth();
  const { events, loading: evLoading } = useEvents({ organizerId: profile?.id, limit: 5 });
  const { applications, loading: appLoading } = useOrganizerApplications();

  const publishedCount = events.filter(e => e.status === 'published').length;
  const pendingApps = applications.filter(a => a.status === 'pending');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Bonjour, {profile?.full_name?.split(' ')[0] ?? 'organisateur'}</Text>
      <Text style={styles.subtitle}>Gérez vos marchés artisanaux</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{publishedCount}</Text>
          <Text style={styles.statLabel}>Marchés actifs</Text>
        </View>
        <View style={[styles.statCard, styles.statCardAlt]}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{pendingApps.length}</Text>
          <Text style={styles.statLabel}>Candidatures</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Mes marchés</Text>
      {evLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : events.length === 0 ? (
        <Text style={styles.empty}>Aucun marché créé — utilisez l'onglet "Créer"</Text>
      ) : (
        events.map(e => <EventCard key={e.id} event={e} />)
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Nouvelles candidatures</Text>
      {appLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : pendingApps.length === 0 ? (
        <Text style={styles.empty}>Aucune nouvelle candidature</Text>
      ) : (
        pendingApps.slice(0, 5).map(a => <ApplicationRow key={a.id} application={a} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  greeting: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statCardAlt: { borderColor: colors.primary + '40' },
  statNum: { ...typography.h1, color: colors.secondary },
  statLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  sectionTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
  eventCard: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  eventInfo: { flex: 1 },
  eventTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600', marginBottom: 2 },
  eventCity: { ...typography.caption, color: colors.text.secondary },
  eventStands: { ...typography.caption, color: colors.primary, marginTop: 2 },
  statusBadge: {
    borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  statusText: { ...typography.caption, fontWeight: '600' },
  appRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, gap: spacing.md,
  },
  appAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + '30',
    alignItems: 'center', justifyContent: 'center',
  },
  appAvatarText: { ...typography.label, color: colors.primary, fontWeight: '700' },
  appName: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  appDate: { ...typography.caption, color: colors.text.secondary },
  pendingBadge: {
    backgroundColor: colors.text.secondary + '20', borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  pendingText: { ...typography.caption, color: colors.text.secondary },
  empty: { ...typography.body, color: colors.text.secondary, fontStyle: 'italic' },
});
