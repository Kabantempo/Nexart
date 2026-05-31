import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, FlatList, Image, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEvents } from '../../hooks/useEvents';
import { usePublicCreators } from '../../hooks/usePublicCreators';
import { DISCIPLINE_TAGS, Event, PublicCreatorProfile } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.eventCard} onPress={onPress} activeOpacity={0.8}>
      <View style={s.eventDateBadge}>
        <Text style={s.eventDateDay}>{new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit' })}</Text>
        <Text style={s.eventDateMonth}>{new Date(event.start_date).toLocaleDateString('fr-FR', { month: 'short' })}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.eventTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={s.eventMeta}>📍 {event.city ?? '—'}</Text>
        {event.discipline_tags.length > 0 && (
          <Text style={s.eventTags} numberOfLines={1}>{event.discipline_tags.slice(0, 3).join(' · ')}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function CreatorCard({ creator, onPress }: { creator: PublicCreatorProfile; onPress: () => void }) {
  const cover = creator.portfolio_images[0];
  return (
    <TouchableOpacity style={s.creatorCard} onPress={onPress} activeOpacity={0.85}>
      {cover
        ? <Image source={{ uri: cover }} style={s.creatorCover} />
        : <View style={[s.creatorCover, s.creatorCoverPlaceholder]} />
      }
      <View style={s.creatorInfo}>
        <View style={s.creatorAvatarSmall}>
          {creator.avatar_url
            ? <Image source={{ uri: creator.avatar_url }} style={s.creatorAvatarImg} />
            : <Text style={s.creatorAvatarText}>{creator.full_name[0]?.toUpperCase()}</Text>
          }
        </View>
        <Text style={s.creatorName} numberOfLines={1}>{creator.full_name}</Text>
        <Text style={s.creatorDisciplines} numberOfLines={1}>{creator.disciplines.slice(0, 2).join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DiscoverHomeScreen() {
  const nav = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [discipline, setDiscipline] = useState('');

  const { events, loading: evLoading } = useEvents({ limit: 8 });
  const { creators, loading: crLoading } = usePublicCreators({ limit: 10 });

  const filteredEvents = search
    ? events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.city ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : events;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Text style={s.logo}>Nexart</Text>
      <Text style={s.subtitle}>Marchés artisanaux & créateurs indépendants</Text>

      {/* Search */}
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Ville, marché, discipline…"
          placeholderTextColor={colors.text.secondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {/* Discipline chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
        {DISCIPLINE_TAGS.slice(0, 12).map(tag => (
          <TouchableOpacity
            key={tag}
            style={[s.chip, discipline === tag && s.chipActive]}
            onPress={() => {
              setDiscipline(prev => prev === tag ? '' : tag);
              nav.navigate('CreatorsList', { discipline: tag });
            }}
          >
            <Text style={[s.chipText, discipline === tag && s.chipTextActive]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events section */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Prochains marchés</Text>
        <TouchableOpacity onPress={() => nav.navigate('Marchés')}>
          <Text style={s.sectionLink}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {evLoading ? <ActivityIndicator color={colors.primary} style={{ marginBottom: spacing.xl }} /> : (
        filteredEvents.map(e => (
          <EventCard key={e.id} event={e} onPress={() => nav.navigate('PublicEventDetail', { eventId: e.id })} />
        ))
      )}

      {/* Creators section */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Créateurs à découvrir</Text>
        <TouchableOpacity onPress={() => nav.navigate('CreatorsList', {})}>
          <Text style={s.sectionLink}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {crLoading ? <ActivityIndicator color={colors.primary} /> : (
        <View style={s.creatorGrid}>
          {creators.map(c => (
            <CreatorCard key={c.id} creator={c} onPress={() => nav.navigate('PublicCreatorProfile', { creatorId: c.id })} />
          ))}
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl },
  logo: { ...typography.h1, color: colors.primary, fontSize: 36 },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.body, color: colors.text.primary, paddingVertical: spacing.md },
  chipRow: { gap: spacing.sm, paddingBottom: spacing.lg },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text.secondary },
  chipTextActive: { color: colors.text.inverse, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text.primary },
  sectionLink: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  eventCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: spacing.md },
  eventDateBadge: { width: 44, alignItems: 'center', backgroundColor: colors.primary + '15', borderRadius: radius.sm, padding: spacing.xs },
  eventDateDay: { ...typography.h3, color: colors.primary, lineHeight: 22 },
  eventDateMonth: { ...typography.caption, color: colors.primary, textTransform: 'uppercase' },
  eventTitle: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  eventMeta: { ...typography.caption, color: colors.text.secondary },
  eventTags: { ...typography.caption, color: colors.primary, marginTop: 2 },
  creatorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  creatorCard: { width: '47%', backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  creatorCover: { width: '100%', height: 120, backgroundColor: colors.border },
  creatorCoverPlaceholder: { backgroundColor: colors.primary + '15' },
  creatorInfo: { padding: spacing.sm },
  creatorAvatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '25', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  creatorAvatarImg: { width: 32, height: 32, borderRadius: 16 },
  creatorAvatarText: { ...typography.label, color: colors.primary },
  creatorName: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  creatorDisciplines: { ...typography.caption, color: colors.text.secondary },
});
