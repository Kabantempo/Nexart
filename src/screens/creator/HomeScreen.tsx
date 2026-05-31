import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../stores/auth';
import { useEvents } from '../../hooks/useEvents';
import { useCreatorApplications } from '../../hooks/useApplications';
import { useCreatorProfile } from '../../hooks/useCreatorProfile';
import { useEventRecommendations } from '../../hooks/useRecommendations';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { Event, Application } from '../../types';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:  { label: 'En attente', color: colors.text.secondary },
  accepted: { label: 'Acceptée',   color: colors.secondary },
  refused:  { label: 'Refusée',    color: colors.error },
};

function EventCard({ event }: { event: Event }) {
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDateDay}>
          {new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit' })}
        </Text>
        <Text style={styles.eventDateMonth}>
          {new Date(event.start_date).toLocaleDateString('fr-FR', { month: 'short' })}
        </Text>
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.eventCity} numberOfLines={1}>{event.city ?? '—'}</Text>
        {event.stand_price != null && (
          <Text style={styles.eventPrice}>{event.stand_price === 0 ? 'Gratuit' : `${event.stand_price} €`}</Text>
        )}
      </View>
    </View>
  );
}

function ApplicationItem({ application }: { application: any }) {
  const s = STATUS_LABEL[application.status] ?? STATUS_LABEL.pending;
  return (
    <View style={styles.appItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.appTitle} numberOfLines={1}>{application.event?.title ?? '—'}</Text>
        <Text style={styles.appCity}>{application.event?.city ?? ''}</Text>
      </View>
      <Text style={[styles.appStatus, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

export default function CreatorHomeScreen() {
  const { profile } = useAuth();
  const { creatorProfile } = useCreatorProfile(profile?.id);
  const { events, loading: evLoading } = useEvents({ limit: 5 });
  const { applications, loading: appLoading } = useCreatorApplications(profile?.id);
  const { events: recommended, loading: recLoading } = useEventRecommendations(creatorProfile, 3);

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Bonjour, {profile?.full_name?.split(' ')[0] ?? 'artisan'}</Text>
      <Text style={styles.subtitle}>Trouvez vos prochains marchés</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{pendingCount}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>
        <View style={[styles.statCard, styles.statCardAlt]}>
          <Text style={[styles.statNum, { color: colors.secondary }]}>{acceptedCount}</Text>
          <Text style={styles.statLabel}>Acceptées</Text>
        </View>
      </View>

      {recommended.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>✨ Recommandés pour vous</Text>
          {recommended.map(e => <EventCard key={e.id} event={e} />)}
        </>
      )}

      <Text style={styles.sectionTitle}>Prochains marchés</Text>
      {evLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : events.length === 0 ? (
        <Text style={styles.empty}>Aucun marché disponible pour l'instant</Text>
      ) : (
        events.map(e => <EventCard key={e.id} event={e} />)
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Mes candidatures</Text>
      {appLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
      ) : applications.length === 0 ? (
        <Text style={styles.empty}>Aucune candidature pour l'instant</Text>
      ) : (
        applications.slice(0, 5).map(a => <ApplicationItem key={a.id} application={a} />)
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
  statCardAlt: { borderColor: colors.secondary + '40' },
  statNum: { ...typography.h1, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  sectionTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
  eventCard: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  eventDateBadge: {
    width: 44, alignItems: 'center', marginRight: spacing.md,
    backgroundColor: colors.primary + '20', borderRadius: radius.sm, padding: spacing.xs,
  },
  eventDateDay: { ...typography.h3, color: colors.primary, lineHeight: 20 },
  eventDateMonth: { ...typography.caption, color: colors.primary, textTransform: 'uppercase' },
  eventInfo: { flex: 1 },
  eventTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600', marginBottom: 2 },
  eventCity: { ...typography.caption, color: colors.text.secondary },
  eventPrice: { ...typography.caption, color: colors.primary, marginTop: 2 },
  appItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  appTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  appCity: { ...typography.caption, color: colors.text.secondary },
  appStatus: { ...typography.caption, fontWeight: '600' },
  empty: { ...typography.body, color: colors.text.secondary, fontStyle: 'italic' },
});
