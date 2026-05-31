import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEvents } from '../../hooks/useEvents';
import { Event } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

// react-native-maps ne fonctionne pas en web — on affiche une liste sur web
// et la carte sur native
let MapView: any = null;
let Marker: any  = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker  = maps.Marker;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function EventListFallback({ events, onPress }: { events: Event[]; onPress: (e: Event) => void }) {
  return (
    <ScrollView contentContainerStyle={f.list}>
      <Text style={f.note}>Carte disponible sur l'app mobile · Résultats ci-dessous</Text>
      {events.map(e => (
        <TouchableOpacity key={e.id} style={f.card} onPress={() => onPress(e)}>
          <View style={f.dateBadge}>
            <Text style={f.dateDay}>{new Date(e.start_date).toLocaleDateString('fr-FR', { day: '2-digit' })}</Text>
            <Text style={f.dateMon}>{new Date(e.start_date).toLocaleDateString('fr-FR', { month: 'short' })}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={f.title} numberOfLines={1}>{e.title}</Text>
            <Text style={f.meta}>📍 {e.city ?? '—'}  ·  {formatDate(e.start_date)}</Text>
            {e.discipline_tags.length > 0 && <Text style={f.tags}>{e.discipline_tags.slice(0, 3).join(' · ')}</Text>}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function EventMapScreen() {
  const nav = useNavigation<any>();
  const { events, loading } = useEvents({ limit: 50 });
  const [selected, setSelected] = useState<Event | null>(null);

  // Filter only events with coordinates
  const geoEvents = events.filter(e => e.lat && e.lng);

  if (loading) return <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;

  // Web fallback
  if (Platform.OS === 'web' || !MapView) {
    return (
      <View style={s.container}>
        <EventListFallback events={events} onPress={e => nav.navigate('PublicEventDetail', { eventId: e.id })} />
      </View>
    );
  }

  // Native map
  return (
    <View style={s.container}>
      <MapView
        style={s.map}
        initialRegion={{ latitude: 46.6, longitude: 2.3, latitudeDelta: 8, longitudeDelta: 8 }}
      >
        {geoEvents.map(e => (
          <Marker
            key={e.id}
            coordinate={{ latitude: e.lat!, longitude: e.lng! }}
            title={e.title}
            description={`${e.city} · ${formatDate(e.start_date)}`}
            pinColor={colors.primary}
            onPress={() => setSelected(e)}
          />
        ))}
      </MapView>

      {selected && (
        <TouchableOpacity
          style={s.callout}
          onPress={() => nav.navigate('PublicEventDetail', { eventId: selected.id })}
        >
          <Text style={s.calloutTitle} numberOfLines={1}>{selected.title}</Text>
          <Text style={s.calloutMeta}>📍 {selected.city}  ·  {formatDate(selected.start_date)}</Text>
          <Text style={s.calloutCta}>Voir la fiche →</Text>
          <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {geoEvents.length === 0 && (
        <View style={s.noGeo}>
          <Text style={s.noGeoText}>Aucun marché géolocalisé pour l'instant</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  map:       { flex: 1 },
  callout: {
    position: 'absolute', bottom: spacing.xxl, left: spacing.xl, right: spacing.xl,
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  calloutTitle: { ...typography.h3, color: colors.text.primary, marginBottom: 4, paddingRight: spacing.xl },
  calloutMeta:  { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm },
  calloutCta:   { ...typography.label, color: colors.primary, fontWeight: '700' },
  closeBtn:     { position: 'absolute', top: spacing.md, right: spacing.md, padding: 4 },
  closeBtnText: { color: colors.text.secondary, fontSize: 16 },
  noGeo: { position: 'absolute', bottom: spacing.xl, alignSelf: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  noGeoText: { ...typography.caption, color: colors.text.secondary },
});

const f = StyleSheet.create({
  list:    { padding: spacing.xl, paddingBottom: spacing.xxl },
  note:    { ...typography.caption, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.lg, fontStyle: 'italic' },
  card:    { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: spacing.md },
  dateBadge: { width: 44, alignItems: 'center', backgroundColor: colors.primary + '15', borderRadius: radius.sm, padding: spacing.xs },
  dateDay:   { ...typography.h3, color: colors.primary, lineHeight: 22 },
  dateMon:   { ...typography.caption, color: colors.primary, textTransform: 'uppercase' },
  title:     { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  meta:      { ...typography.caption, color: colors.text.secondary },
  tags:      { ...typography.caption, color: colors.primary, marginTop: 2 },
});
