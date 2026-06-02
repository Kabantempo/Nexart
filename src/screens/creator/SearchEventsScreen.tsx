import React, { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MarketStackParams } from '../../navigation/MarketStack';
import { supabase } from '../../lib/supabase';
import { Event, EventType, DISCIPLINE_TAGS } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = { navigation: StackNavigationProp<MarketStackParams, 'EventList'> };

type BudgetPreset = 'all' | 'free' | 'under50' | '50to150' | 'over150';
type DatePreset   = 'all' | 'weekend' | 'month' | 'soon';

const FRENCH_REGIONS = [
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne',
  'Centre-Val de Loire', 'Corse', 'Grand Est', 'Hauts-de-France',
  'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie',
  'Pays de la Loire', "Provence-Alpes-Côte d'Azur",
];

const BUDGET_OPTIONS: { label: string; short: string; value: BudgetPreset }[] = [
  { label: 'Tous les budgets', short: 'Budget', value: 'all' },
  { label: 'Gratuit',          short: 'Gratuit', value: 'free' },
  { label: 'Moins de 50 €',   short: '< 50 €',  value: 'under50' },
  { label: '50 – 150 €',       short: '50-150 €', value: '50to150' },
  { label: 'Plus de 150 €',   short: '> 150 €', value: 'over150' },
];

const DATE_OPTIONS: { label: string; short: string; value: DatePreset }[] = [
  { label: 'Toutes les dates', short: 'Date',          value: 'all' },
  { label: 'Ce week-end',      short: 'Ce week-end',   value: 'weekend' },
  { label: 'Ce mois-ci',       short: 'Ce mois',       value: 'month' },
  { label: 'Prochainement',    short: 'Prochainement', value: 'soon' },
];

const EVENT_TYPES: { label: string; value: EventType | 'all' }[] = [
  { label: 'Tous',       value: 'all' },
  { label: 'Pop-up',     value: 'popup' },
  { label: 'Salon',      value: 'salon' },
  { label: 'Foire',      value: 'fair' },
  { label: 'Permanent',  value: 'permanent' },
  { label: 'Saisonnier', value: 'seasonal' },
];

const TYPE_COLORS: Record<string, string> = {
  permanent: '#3B82F6', seasonal: '#F59E0B',
  popup: '#A855F7', salon: '#10B981', fair: '#EF4444',
};

// ─── Helpers date ─────────────────────────────────────────────────────────────

function toIso(d: Date) { return d.toISOString().split('T')[0]; }

function getDateRange(preset: DatePreset): { from: string; to: string } | null {
  if (preset === 'all') return null;
  const today = new Date();
  if (preset === 'weekend') {
    const day = today.getDay();
    const daysToSat = day === 6 ? 0 : (6 - day + 7) % 7 || 7;
    const sat = new Date(today); sat.setDate(today.getDate() + daysToSat);
    const sun = new Date(sat);   sun.setDate(sat.getDate() + 1);
    return { from: toIso(sat), to: toIso(sun) };
  }
  if (preset === 'month') {
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from: toIso(today), to: toIso(last) };
  }
  // soon = 30 jours
  const in30 = new Date(today); in30.setDate(today.getDate() + 30);
  return { from: toIso(today), to: toIso(in30) };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── Event card ───────────────────────────────────────────────────────────────

function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  const accent = TYPE_COLORS[event.event_type] ?? colors.primary;
  return (
    <TouchableOpacity style={[s.card, { borderLeftColor: accent }]} onPress={onPress} activeOpacity={0.8}>
      <View style={s.cardTop}>
        <View style={[s.typePill, { backgroundColor: accent + '18' }]}>
          <Text style={[s.typePillText, { color: accent }]}>{event.event_type}</Text>
        </View>
        {event.stand_price != null && (
          <Text style={s.price}>
            {event.stand_price === 0 ? 'Gratuit' : `${event.stand_price} €`}
          </Text>
        )}
      </View>

      <Text style={s.cardTitle} numberOfLines={2}>{event.title}</Text>

      <Text style={s.cardMeta}>
        {event.city ?? '—'}  ·  {formatDate(event.start_date)}
        {event.start_date !== event.end_date ? ` → ${formatDate(event.end_date)}` : ''}
      </Text>

      {event.discipline_tags.length > 0 && (
        <View style={s.tagRow}>
          {event.discipline_tags.slice(0, 3).map(t => (
            <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>
          ))}
          {event.discipline_tags.length > 3 && (
            <Text style={s.tagMore}>+{event.discipline_tags.length - 3}</Text>
          )}
        </View>
      )}

      <View style={s.cardFooter}>
        <Text style={s.stands}>{event.stand_count} stands disponibles</Text>
        <View style={[s.ctaPill, { backgroundColor: accent + '18' }]}>
          <Text style={[s.ctaText, { color: accent }]}>Voir →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Discipline sheet ─────────────────────────────────────────────────────────

function DisciplineFilterSheet({ selected, onChange, onClose }: {
  selected: string[]; onChange: (v: string[]) => void; onClose: () => void;
}) {
  const [local, setLocal] = useState(selected);
  const toggle = (tag: string) => setLocal(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);

  return (
    <View style={sheet.overlay}>
      <View style={sheet.panel}>
        <View style={sheet.handle} />
        <Text style={sheet.title}>Filtrer par discipline</Text>
        <ScrollView contentContainerStyle={sheet.tagWrap}>
          {DISCIPLINE_TAGS.map(t => {
            const active = local.includes(t);
            return (
              <TouchableOpacity key={t} style={[sheet.tag, active && sheet.tagActive]} onPress={() => toggle(t)}>
                <Text style={[sheet.tagText, active && sheet.tagTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={sheet.actions}>
          <TouchableOpacity style={sheet.btnReset} onPress={() => { setLocal([]); onChange([]); onClose(); }}>
            <Text style={sheet.btnResetText}>Réinitialiser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sheet.btnApply} onPress={() => { onChange(local); onClose(); }}>
            <Text style={sheet.btnApplyText}>Appliquer {local.length > 0 ? `(${local.length})` : ''}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Région sheet ─────────────────────────────────────────────────────────────

function RegionFilterSheet({ selected, onChange, onClose }: {
  selected: string | null; onChange: (v: string | null) => void; onClose: () => void;
}) {
  return (
    <View style={sheet.overlay}>
      <View style={sheet.panel}>
        <View style={sheet.handle} />
        <Text style={sheet.title}>Filtrer par région</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={sheet.radioRow} onPress={() => { onChange(null); onClose(); }}>
            <Text style={[sheet.radioLabel, selected === null && sheet.radioLabelActive]}>Toutes les régions</Text>
            {selected === null && <Ionicons name="checkmark" size={16} color={colors.primary} />}
          </TouchableOpacity>
          {FRENCH_REGIONS.map(r => (
            <TouchableOpacity key={r} style={sheet.radioRow} onPress={() => { onChange(r); onClose(); }}>
              <Text style={[sheet.radioLabel, selected === r && sheet.radioLabelActive]}>{r}</Text>
              {selected === r && <Ionicons name="checkmark" size={16} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Budget sheet ─────────────────────────────────────────────────────────────

function BudgetFilterSheet({ selected, onChange, onClose }: {
  selected: BudgetPreset; onChange: (v: BudgetPreset) => void; onClose: () => void;
}) {
  return (
    <View style={sheet.overlay}>
      <View style={[sheet.panel, { maxHeight: '50%' }]}>
        <View style={sheet.handle} />
        <Text style={sheet.title}>Filtrer par budget</Text>
        {BUDGET_OPTIONS.map(opt => (
          <TouchableOpacity key={opt.value} style={sheet.radioRow} onPress={() => { onChange(opt.value); onClose(); }}>
            <Text style={[sheet.radioLabel, selected === opt.value && sheet.radioLabelActive]}>{opt.label}</Text>
            {selected === opt.value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Date sheet ───────────────────────────────────────────────────────────────

function DateFilterSheet({ selected, onChange, onClose }: {
  selected: DatePreset; onChange: (v: DatePreset) => void; onClose: () => void;
}) {
  return (
    <View style={sheet.overlay}>
      <View style={[sheet.panel, { maxHeight: '45%' }]}>
        <View style={sheet.handle} />
        <Text style={sheet.title}>Filtrer par date</Text>
        {DATE_OPTIONS.map(opt => (
          <TouchableOpacity key={opt.value} style={sheet.radioRow} onPress={() => { onChange(opt.value); onClose(); }}>
            <Text style={[sheet.radioLabel, selected === opt.value && sheet.radioLabelActive]}>{opt.label}</Text>
            {selected === opt.value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SearchEventsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [search, setSearch]             = useState('');
  const [eventType, setEventType]       = useState<EventType | 'all'>('all');
  const [disciplines, setDisciplines]   = useState<string[]>([]);
  const [region, setRegion]             = useState<string | null>(null);
  const [budget, setBudget]             = useState<BudgetPreset>('all');
  const [datePreset, setDatePreset]     = useState<DatePreset>('all');

  const [showDisciplines, setShowDisciplines] = useState(false);
  const [showRegion, setShowRegion]           = useState(false);
  const [showBudget, setShowBudget]           = useState(false);
  const [showDate, setShowDate]               = useState(false);

  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const activeFilterCount = [
    disciplines.length > 0,
    region !== null,
    budget !== 'all',
    datePreset !== 'all',
  ].filter(Boolean).length;

  const fetchEvents = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('start_date', { ascending: true })
      .limit(100);

    if (search.trim()) {
      query = query.or(`title.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%`);
    }
    if (eventType !== 'all') {
      query = query.eq('event_type', eventType);
    }
    if (disciplines.length > 0) {
      query = query.overlaps('discipline_tags', disciplines);
    }
    if (region) {
      query = query.eq('region', region);
    }

    // Budget
    if (budget === 'free') {
      query = query.or('stand_price.is.null,stand_price.eq.0');
    } else if (budget === 'under50') {
      query = query.lte('stand_price', 50).not('stand_price', 'is', null);
    } else if (budget === '50to150') {
      query = query.gte('stand_price', 50).lte('stand_price', 150);
    } else if (budget === 'over150') {
      query = query.gt('stand_price', 150);
    }

    // Date
    const dateRange = getDateRange(datePreset);
    if (dateRange) {
      // événements qui chevauchent la période
      query = query
        .lte('start_date', dateRange.to)
        .gte('end_date', dateRange.from);
    }

    const { data } = await query;
    setEvents(data ?? []);
    setLoading(false);
  }, [search, eventType, disciplines, region, budget, datePreset]);

  useEffect(() => {
    const t = setTimeout(fetchEvents, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchEvents, search]);

  const resetAllFilters = () => {
    setEventType('all');
    setDisciplines([]);
    setRegion(null);
    setBudget('all');
    setDatePreset('all');
  };

  // Labels des chips
  const regionLabel      = region ?? 'Région';
  const budgetLabel      = BUDGET_OPTIONS.find(o => o.value === budget)!.short;
  const dateLabel        = DATE_OPTIONS.find(o => o.value === datePreset)!.short;
  const disciplineLabel  = disciplines.length > 0 ? `Disciplines (${disciplines.length})` : 'Disciplines';

  return (
    <View style={[s.container, { paddingTop: insets.top + spacing.sm }]}>
      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>◎</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Ville, nom du marché…"
            placeholderTextColor={colors.text.secondary + '80'}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={s.clearBtn}>
              <Text style={s.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
        {EVENT_TYPES.map(t => (
          <TouchableOpacity
            key={t.value}
            style={[s.chip, eventType === t.value && s.chipActive]}
            onPress={() => setEventType(t.value)}
          >
            <Text style={[s.chipText, eventType === t.value && s.chipTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Advanced filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
        <TouchableOpacity
          style={[s.chip, disciplines.length > 0 && s.chipActive]}
          onPress={() => setShowDisciplines(true)}
        >
          <Text style={[s.chipText, disciplines.length > 0 && s.chipTextActive]}>{disciplineLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.chip, region !== null && s.chipActive]}
          onPress={() => setShowRegion(true)}
        >
          <Text style={[s.chipText, region !== null && s.chipTextActive]}>{regionLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.chip, budget !== 'all' && s.chipActive]}
          onPress={() => setShowBudget(true)}
        >
          <Text style={[s.chipText, budget !== 'all' && s.chipTextActive]}>{budgetLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.chip, datePreset !== 'all' && s.chipActive]}
          onPress={() => setShowDate(true)}
        >
          <Text style={[s.chipText, datePreset !== 'all' && s.chipTextActive]}>{dateLabel}</Text>
        </TouchableOpacity>

        {activeFilterCount > 0 && (
          <TouchableOpacity style={s.chipReset} onPress={resetAllFilters}>
            <Ionicons name="close" size={12} color={colors.error} />
            <Text style={s.chipResetText}>Réinitialiser</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Results count */}
      {!loading && (
        <View style={s.resultsRow}>
          <Text style={s.resultsCount}>
            {events.length} marché{events.length !== 1 ? 's' : ''} trouvé{events.length !== 1 ? 's' : ''}
          </Text>
          {activeFilterCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
      )}

      {loading ? (
        <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={e => e.id}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })} />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <View style={s.emptyDot} />
              <View>
                <Text style={s.emptyTitle}>Aucun marché trouvé</Text>
                <Text style={s.emptySubtitle}>Essayez d'élargir vos filtres</Text>
              </View>
            </View>
          }
        />
      )}

      {/* Filter sheets */}
      {showDisciplines && (
        <DisciplineFilterSheet
          selected={disciplines}
          onChange={setDisciplines}
          onClose={() => setShowDisciplines(false)}
        />
      )}
      {showRegion && (
        <RegionFilterSheet
          selected={region}
          onChange={setRegion}
          onClose={() => setShowRegion(false)}
        />
      )}
      {showBudget && (
        <BudgetFilterSheet
          selected={budget}
          onChange={setBudget}
          onClose={() => setShowBudget(false)}
        />
      )}
      {showDate && (
        <DateFilterSheet
          selected={datePreset}
          onChange={setDatePreset}
          onClose={() => setShowDate(false)}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  searchWrap: { paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  searchIcon:   { fontSize: 15, color: colors.text.secondary, marginRight: spacing.sm },
  searchInput:  { flex: 1, ...typography.body, color: colors.text.primary, paddingVertical: 14 },
  clearBtn:     { padding: spacing.sm },
  clearBtnText: { color: colors.text.secondary, fontSize: 14 },

  chipRow: { paddingHorizontal: spacing.xl, gap: spacing.xs, paddingBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:       { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  chipTextActive: { color: colors.text.inverse, fontWeight: '700' },
  chipReset: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.error + '60',
    backgroundColor: colors.error + '10',
  },
  chipResetText: { ...typography.caption, color: colors.error, fontWeight: '600' },

  resultsRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  resultsCount:{ ...typography.caption, color: colors.text.secondary },
  filterBadge: { backgroundColor: colors.primary + '20', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  filterBadgeText: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  list:    { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  typePill:     { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  typePillText: { ...typography.caption, fontWeight: '700', textTransform: 'capitalize' },
  price:        { ...typography.label, color: colors.secondary, fontWeight: '700' },
  cardTitle:    { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  cardMeta:     { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm },
  tagRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  tag:          { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  tagText:      { ...typography.caption, color: colors.text.secondary },
  tagMore:      { ...typography.caption, color: colors.text.secondary, alignSelf: 'center' },
  cardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stands:       { ...typography.caption, color: colors.text.secondary },
  ctaPill:      { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.full },
  ctaText:      { ...typography.caption, fontWeight: '700' },

  emptyState: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
    marginTop: spacing.xl,
  },
  emptyDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.text.secondary + '40' },
  emptyTitle:   { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  emptySubtitle:{ ...typography.body, color: colors.text.secondary },
});

const sheet = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', zIndex: 100,
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.xl, maxHeight: '75%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg },
  title:  { ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg, fontWeight: '700' },

  // Discipline tags
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingBottom: spacing.lg },
  tag:     { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  tagActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText:       { ...typography.caption, color: colors.text.secondary },
  tagTextActive: { color: colors.text.inverse, fontWeight: '600' },

  // Radio rows (région, budget, date)
  radioRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border + '60',
  },
  radioLabel:       { ...typography.body, color: colors.text.primary },
  radioLabelActive: { color: colors.primary, fontWeight: '600' },

  // Action buttons (discipline sheet)
  actions:      { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btnReset:     { flex: 1, padding: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  btnResetText: { ...typography.label, color: colors.text.secondary },
  btnApply:     { flex: 2, padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.primary, alignItems: 'center' },
  btnApplyText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
