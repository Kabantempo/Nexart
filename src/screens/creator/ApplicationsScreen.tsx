import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../stores/auth';
import { useCreatorApplications } from '../../hooks/useApplications';
import { ApplicationStatus } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

const FILTERS: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'Toutes',     value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'Acceptées',  value: 'accepted' },
  { label: 'Refusées',   value: 'refused' },
];

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'En attente', color: colors.text.secondary, bg: colors.border },
  accepted: { label: 'Acceptée',   color: colors.secondary,      bg: colors.secondary + '25' },
  refused:  { label: 'Refusée',    color: colors.error,          bg: colors.error + '20' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const e = new Date(end).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  return start === end ? s : `${s} → ${e}`;
}

function ApplicationCard({ item }: { item: any }) {
  const cfg = STATUS_CONFIG[item.status as ApplicationStatus];
  const event = item.event;

  return (
    <View style={styles.card}>
      {/* Status banner pour les acceptées */}
      {item.status === 'accepted' && (
        <View style={styles.acceptedBanner}>
          <Text style={styles.acceptedBannerText}>🎉 Candidature acceptée — contactez l'organisateur</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        {/* Date badge */}
        {event?.start_date && (
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeDay}>
              {new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit' })}
            </Text>
            <Text style={styles.dateBadgeMonth}>
              {new Date(event.start_date).toLocaleDateString('fr-FR', { month: 'short' })}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event?.title ?? '—'}
          </Text>
          {event?.city && (
            <Text style={styles.eventMeta}>
              📍 {event.city}
              {event.start_date ? `  ·  ${formatDateRange(event.start_date, event.end_date ?? event.start_date)}` : ''}
            </Text>
          )}
          <Text style={styles.appliedDate}>Candidaté le {formatDate(item.created_at)}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {item.message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageLabel}>Votre message</Text>
          <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
        </View>
      )}
    </View>
  );
}

export default function ApplicationsScreen() {
  const { profile } = useAuth();
  const { applications, loading, refetch } = useCreatorApplications(profile?.id);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter);

  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    refused:  applications.filter(a => a.status === 'refused').length,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes candidatures</Text>

      {/* Stats rapides */}
      {applications.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{counts.pending}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={[styles.statNum, { color: colors.secondary }]}>{counts.accepted}</Text>
            <Text style={styles.statLabel}>Acceptées</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.error }]}>{counts.refused}</Text>
            <Text style={styles.statLabel}>Refusées</Text>
          </View>
        </View>
      )}

      {/* Filtres */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterTab, filter === f.value && styles.filterTabActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterTabText, filter === f.value && styles.filterTabTextActive]}>
              {f.label}
              {counts[f.value] > 0 ? ` (${counts[f.value]})` : ''}
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
          renderItem={({ item }) => <ApplicationCard item={item} />}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.empty}>
              {applications.length === 0 ? (
                <>
                  <Text style={styles.emptyTitle}>Aucune candidature</Text>
                  <Text style={styles.emptySubtitle}>
                    Parcourez les marchés disponibles et candidatez en 1 clic
                  </Text>
                </>
              ) : (
                <Text style={styles.emptyTitle}>Aucune candidature dans cette catégorie</Text>
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

  title: {
    ...typography.h2, color: colors.text.primary,
    paddingHorizontal: spacing.xl, marginBottom: spacing.lg,
  },

  statsRow: {
    flexDirection: 'row', marginHorizontal: spacing.xl,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  statNum: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },

  filterRow: {
    flexDirection: 'row', paddingHorizontal: spacing.xl,
    gap: spacing.xs, marginBottom: spacing.md,
  },
  filterTab: {
    flex: 1, paddingVertical: 7, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  filterTabTextActive: { color: colors.text.inverse, fontWeight: '700' },

  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },

  acceptedBanner: {
    backgroundColor: colors.secondary + '20',
    borderBottomWidth: 1, borderColor: colors.secondary + '40',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  acceptedBannerText: { ...typography.caption, color: colors.secondary, fontWeight: '600' },

  cardHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: spacing.md, padding: spacing.lg,
  },
  dateBadge: {
    width: 44, alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: radius.sm, padding: spacing.xs,
  },
  dateBadgeDay:   { ...typography.h3, color: colors.primary, lineHeight: 22 },
  dateBadgeMonth: { ...typography.caption, color: colors.primary, textTransform: 'uppercase' },

  eventTitle: { ...typography.label, color: colors.text.primary, fontWeight: '700', marginBottom: 3 },
  eventMeta:  { ...typography.caption, color: colors.text.secondary, marginBottom: 2 },
  appliedDate:{ ...typography.caption, color: colors.text.secondary + '99' },

  statusBadge: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText:  { ...typography.caption, fontWeight: '700' },

  messageBox: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.background, borderRadius: radius.md,
    padding: spacing.sm, borderLeftWidth: 2, borderColor: colors.primary + '50',
  },
  messageLabel: { ...typography.caption, color: colors.text.secondary, marginBottom: 2 },
  messageText:  { ...typography.caption, color: colors.text.primary, lineHeight: 18 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl },

  empty: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyTitle:    { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
  emptySubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
});
