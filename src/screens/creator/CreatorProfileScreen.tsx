import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreatorProfileData {
  username:       string;
  displayName:    string;
  avatarUrl:      string | null;
  bio:            string;
  followersCount: number;
  followingCount: number;
  postsCount:     number;
  links:          { label: string; url: string }[];
  posts:          { id: string; imageUrl: string | null }[];
}

type RootStackParams = {
  CreatorProfile: { creator?: Partial<CreatorProfileData> };
};

type Props = {
  navigation: StackNavigationProp<RootStackParams, 'CreatorProfile'>;
  route:      RouteProp<RootStackParams, 'CreatorProfile'>;
};

// ─── Defaults (tous à zéro / vide — prêt à connecter Supabase) ───────────────

const DEFAULT_CREATOR: CreatorProfileData = {
  username:       '',
  displayName:    '',
  avatarUrl:      null,
  bio:            '',
  followersCount: 0,
  followingCount: 0,
  postsCount:     0,
  links:          [],
  posts:          Array.from({ length: 6 }, (_, i) => ({ id: `placeholder-${i}`, imageUrl: null })),
};

const { width: W } = Dimensions.get('window');
const GRID_CELL    = (W - 4) / 3; // 3 colonnes séparées par 2px

// ─── Composants internes ──────────────────────────────────────────────────────

// SECTION : STAT ITEM
function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statValue}>{value.toLocaleString('fr-FR')}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// SECTION : SOCIAL PILL
function SocialPill({ label }: { label: string }) {
  return (
    <View style={s.pill}>
      <Ionicons name="link-outline" size={12} color="#A8A8A8" style={{ marginRight: 4 }} />
      <Text style={s.pillText} numberOfLines={1}>{label || 'Lien'}</Text>
    </View>
  );
}

// SECTION : GRID CELL
function GridCell({ item }: { item: { id: string; imageUrl: string | null } }) {
  if (item.imageUrl) {
    return <Image source={{ uri: item.imageUrl }} style={s.gridCell} />;
  }
  return <View style={[s.gridCell, s.gridCellEmpty]} />;
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function CreatorProfileScreen({ navigation, route }: Props) {
  // TODO : remplacer par un appel Supabase (useCreatorProfile)
  const creator: CreatorProfileData = {
    ...DEFAULT_CREATOR,
    ...(route.params?.creator ?? {}),
  };

  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* ── SECTION : HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <Ionicons name="chevron-back" size={26} color="#FFF" />
        </TouchableOpacity>

        <Text style={s.headerUsername} numberOfLines={1}>
          {creator.username || 'utilisateur'}
        </Text>

        <View style={s.headerActions}>
          <TouchableOpacity style={s.headerBtn}>
            <Ionicons name="add-circle-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[4]}
      >
        {/* ── SECTION : PROFIL ── */}
        <View style={s.profileRow}>

          {/* Avatar */}
          <View style={s.avatarWrap}>
            {creator.avatarUrl ? (
              <Image source={{ uri: creator.avatarUrl }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarPlaceholder]}>
                <Ionicons name="person" size={38} color="#555" />
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <StatItem value={creator.postsCount}     label="publications" />
            <StatItem value={creator.followersCount} label="abonnés" />
            <StatItem value={creator.followingCount} label="abonnements" />
          </View>
        </View>

        {/* ── SECTION : BIO ── */}
        <View style={s.bioSection}>
          {creator.displayName ? (
            <Text style={s.displayName}>{creator.displayName}</Text>
          ) : (
            <View style={s.bioPlaceholderLine} />
          )}

          {creator.bio ? (
            <Text style={s.bioText}>{creator.bio}</Text>
          ) : (
            <>
              <View style={[s.bioPlaceholderLine, { width: '90%', marginTop: 6 }]} />
              <View style={[s.bioPlaceholderLine, { width: '70%', marginTop: 4 }]} />
            </>
          )}
        </View>

        {/* ── SECTION : LIENS RÉSEAUX SOCIAUX ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.linksRow}
        >
          {creator.links.length > 0
            ? creator.links.map((link, i) => <SocialPill key={i} label={link.label} />)
            : (
              <>
                <SocialPill label="" />
                <SocialPill label="" />
                <SocialPill label="" />
              </>
            )
          }
        </ScrollView>

        {/* ── SECTION : BOUTONS D'ACTION ── */}
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.btnAction}>
            <Text style={s.btnActionText}>Modifier le profil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnAction}>
            <Ionicons name="share-outline" size={16} color="#FFF" />
            <Text style={s.btnActionText}>Partager</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnAction, s.btnActionIcon]}>
            <Ionicons name="person-add-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ── SECTION : ONGLETS (grille / liste) ── */}
        <View style={s.tabBar}>
          <TouchableOpacity
            style={[s.tabItem, activeTab === 'grid' && s.tabItemActive]}
            onPress={() => setActiveTab('grid')}
          >
            <Ionicons
              name="grid-outline"
              size={22}
              color={activeTab === 'grid' ? '#FFF' : '#555'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabItem, activeTab === 'list' && s.tabItemActive]}
            onPress={() => setActiveTab('list')}
          >
            <Ionicons
              name="list-outline"
              size={24}
              color={activeTab === 'list' ? '#FFF' : '#555'}
            />
          </TouchableOpacity>
        </View>

        {/* ── SECTION : GRILLE 3 COLONNES ── */}
        <View style={s.grid}>
          {creator.posts.map(item => (
            <GridCell key={item.id} item={item} />
          ))}
        </View>

        {/* ── SECTION : EMPTY STATE (si aucune publication) ── */}
        {creator.posts.filter(p => p.imageUrl).length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="camera-outline" size={48} color="#333" />
            <Text style={s.emptyTitle}>Aucune publication</Text>
            <Text style={s.emptySubtitle}>Les photos et vidéos apparaîtront ici.</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({

  // SECTION : SAFE AREA & SCROLL
  safe:   { flex: 1, backgroundColor: '#000' },
  scroll: { flex: 1, backgroundColor: '#000' },

  // SECTION : HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#000',
    borderBottomWidth: 0.5,
    borderBottomColor: '#262626',
  },
  headerBtn:      { padding: 8 },
  headerUsername: { flex: 1, textAlign: 'center', color: '#FFF', fontSize: 17, fontWeight: '700', marginHorizontal: 8 },
  headerActions:  { flexDirection: 'row' },

  // SECTION : PROFIL ROW (avatar + stats)
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  avatarWrap: { marginRight: 24 },
  avatar: {
    width: 86, height: 86, borderRadius: 43,
    borderWidth: 2, borderColor: '#333',
  },
  avatarPlaceholder: {
    backgroundColor: '#262626',
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow:  { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statItem:  { alignItems: 'center' },
  statValue: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  statLabel: { color: '#A8A8A8', fontSize: 12, marginTop: 2 },

  // SECTION : BIO
  bioSection: { paddingHorizontal: 16, paddingBottom: 12 },
  displayName: { color: '#FFF', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  bioText:     { color: '#FFF', fontSize: 14, lineHeight: 20 },
  bioPlaceholderLine: {
    height: 12, borderRadius: 6,
    backgroundColor: '#262626',
    width: '60%',
  },

  // SECTION : LIENS RÉSEAUX SOCIAUX
  linksRow:  { paddingHorizontal: 16, paddingBottom: 12, gap: 8, flexDirection: 'row' },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
    minWidth: 80,
  },
  pillText: { color: '#4EA1F3', fontSize: 12, fontWeight: '500', maxWidth: 100 },

  // SECTION : BOUTONS D'ACTION
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  btnAction: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6,
    backgroundColor: '#262626',
    borderRadius: 8,
    paddingVertical: 7,
  },
  btnActionText:  { color: '#FFF', fontSize: 13, fontWeight: '600' },
  btnActionIcon:  { flex: 0, paddingHorizontal: 14 },

  // SECTION : ONGLETS
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderTopWidth: 0.5, borderTopColor: '#262626',
    borderBottomWidth: 0.5, borderBottomColor: '#262626',
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10,
  },
  tabItemActive: {
    borderBottomWidth: 1.5, borderBottomColor: '#FFF',
  },

  // SECTION : GRILLE 3 COLONNES
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridCell: {
    width: GRID_CELL, height: GRID_CELL,
    backgroundColor: '#262626',
  },
  gridCellEmpty: { backgroundColor: '#262626' },

  // SECTION : EMPTY STATE
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  emptyTitle:    { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { color: '#A8A8A8', fontSize: 14, marginTop: 6, textAlign: 'center' },
});
