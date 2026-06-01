import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { useFeed, FeedItem } from '../../hooks/useFeed';
import { useFollowedCreators } from '../../hooks/useFollow';
import PostCard from '../../components/PostCard';
import { SwipeCard, CardStat } from '../../components/ui/SwipeCard';
import { colors, spacing, typography, radius } from '../../constants/theme';

const TYPE_COLORS: Record<string, string> = {
  permanent: '#3B82F6', seasonal: '#F59E0B',
  popup: '#A855F7', salon: '#10B981', fair: '#EF4444',
};

function EventFeedCard({ event }: { event: any }) {
  const nav = useNavigation<any>();
  const accent = TYPE_COLORS[event.event_type] ?? colors.secondary;
  const stats: CardStat[] = [
    { icon: 'location-outline', label: event.city ?? '—' },
    { icon: 'calendar-outline', label: new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) },
    { icon: 'grid-outline', label: `${event.stand_count} stands` },
  ];
  if (event.stand_price != null) stats.push({ icon: 'pricetag-outline', label: event.stand_price === 0 ? 'Gratuit' : `${event.stand_price} €` });
  const images = event.cover_image ? [event.cover_image, ...(event.media ?? []).slice(0, 2)] : (event.media ?? []).slice(0, 3);

  return (
    <View style={s.eventWrap}>
      <View style={s.eventLabel}>
        <Text style={s.eventLabelText}>Marché à venir</Text>
      </View>
      <SwipeCard
        title={event.title}
        subtitle={event.event_type}
        images={images.length ? images : ['', '', '']}
        stats={stats}
        description={event.description ?? event.discipline_tags?.slice(0, 4).join(', ') ?? ''}
        accent={accent}
        onPress={() => nav.navigate('Découvrir', { screen: 'PublicEventDetail', params: { eventId: event.id } })}
      />
    </View>
  );
}

function renderItem({ item }: { item: FeedItem }) {
  if (item.type === 'post')  return <PostCard post={item.data} />;
  if (item.type === 'event') return <EventFeedCard event={item.data} />;
  return null;
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const nav = useNavigation<any>();
  const followedIds = useFollowedCreators(profile?.id);
  const { items, loading, refetch } = useFeed({ userId: profile?.id, followedIds });
  const isCreator = profile?.role === 'creator';

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={s.logo}>Nexart</Text>
        {isCreator && (
          <TouchableOpacity style={s.createBtn} onPress={() => nav.navigate('CreatePost')}>
            <Text style={s.createBtnText}>+ Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => `${item.type}-${item.data.id}-${i}`}
          renderItem={renderItem}
          onRefresh={refetch}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIcon}><Text style={s.emptyIconText}>✦</Text></View>
              <Text style={s.emptyTitle}>Votre fil est vide</Text>
              <Text style={s.emptySubtitle}>
                {isCreator
                  ? 'Suivez des créateurs pour voir leurs posts ici.'
                  : 'Suivez des créateurs depuis leur profil pour voir leur actualité ici.'}
              </Text>
              <TouchableOpacity
                style={s.discoverBtn}
                onPress={() => nav.navigate('Découvrir', { screen: 'CreatorsList', params: {} })}
              >
                <Text style={s.discoverBtnText}>Découvrir des créateurs →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  logo:          { ...typography.h2, color: colors.primary, fontWeight: '700' },
  createBtn:     { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 7 },
  createBtnText: { ...typography.caption, color: colors.text.inverse, fontWeight: '700' },

  list: { paddingVertical: spacing.md, paddingBottom: spacing.xxl },

  eventWrap:     { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  eventLabel:    { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  eventLabelText:{ ...typography.caption, color: colors.secondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  empty:         { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyIcon:     { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyIconText: { fontSize: 22, color: colors.primary },
  emptyTitle:    { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs, textAlign: 'center' },
  emptySubtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  discoverBtn:   { backgroundColor: colors.primary, borderRadius: radius.xl, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  discoverBtnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
