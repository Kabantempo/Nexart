import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../constants/theme';
import { Post, usePostLike } from '../../hooks/usePosts';
import { useAuth } from '../../stores/auth';

const POST_TYPE_COLORS: Record<string, string> = {
  guest_appearance: '#A855F7',
  call_for_collab:  '#10B981',
  tip:              '#F59E0B',
  experience:       '#3B82F6',
  general:          colors.text.secondary,
};

const POST_TYPE_LABELS: Record<string, string> = {
  guest_appearance: 'Guest',
  call_for_collab:  'Collab',
  tip:              'Conseil',
  experience:       'Expérience',
  general:          'Création',
};

export function CreationCard({ post }: { post: Post }) {
  const { width: W } = useWindowDimensions();
  const CARD_W       = Math.min(W * 0.55, 200);
  const IMG_H        = CARD_W;           // carré

  const nav             = useNavigation<any>();
  const { profile }     = useAuth();
  const { liked, count, toggle } = usePostLike(profile?.id, post.id, post.likes_count);
  const creator         = post.creator as any;
  const cover           = post.images?.[0] ?? null;
  const typeColor       = POST_TYPE_COLORS[post.post_type] ?? colors.text.secondary;
  const typeLabel       = POST_TYPE_LABELS[post.post_type] ?? 'Création';

  // Extrait le texte court : première ligne ou 60 chars
  const shortText = post.content.split('\n')[0].replace(/#[\wÀ-ÿ]+/g, '').trim().slice(0, 60);

  return (
    <TouchableOpacity
      style={[s.card, { width: CARD_W }]}
      onPress={() => creator && nav.navigate('PublicCreatorProfile', { creatorId: creator.id })}
      activeOpacity={0.92}
    >
      {/* Image principale */}
      <View style={[s.imageWrap, { height: IMG_H }]}>
        {cover ? (
          <Image source={{ uri: cover }} style={s.image} resizeMode="cover" />
        ) : (
          <View style={s.imagePlaceholder}>
            <Ionicons name="image-outline" size={28} color={colors.border} />
          </View>
        )}

        {/* Like overlay bas droite */}
        <TouchableOpacity style={s.likeOverlay} onPress={toggle} activeOpacity={0.8}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={liked ? '#ef4444' : '#fff'} />
          {count > 0 && <Text style={s.likeCount}>{count}</Text>}
        </TouchableOpacity>
      </View>

      {/* Infos créateur */}
      <View style={s.body}>
        {creator && (
          <View style={s.creatorRow}>
            {creator.avatar_url ? (
              <Image source={{ uri: creator.avatar_url }} style={s.avatar} />
            ) : (
              <View style={s.avatarFallback}>
                <Ionicons name="person" size={10} color={colors.primary} />
              </View>
            )}
            <Text style={s.creatorName} numberOfLines={1}>{creator.full_name}</Text>
          </View>
        )}
        {shortText ? (
          <Text style={s.caption} numberOfLines={2}>{shortText}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },

  imageWrap:      { position: 'relative' },
  image:          { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: colors.muted,
    alignItems: 'center', justifyContent: 'center',
  },

  typeBadge: {
    position: 'absolute', top: spacing.sm, left: spacing.sm,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: radius.full, borderWidth: 1,
  },
  typeText: { fontSize: 9, fontWeight: '700' },

  likeOverlay: {
    position: 'absolute', bottom: spacing.sm, right: spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  likeCount: { color: '#fff', fontSize: 11, fontWeight: '700' },

  body:       { padding: spacing.sm },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 3 },
  avatar:        { width: 18, height: 18, borderRadius: 9 },
  avatarFallback:{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  creatorName:   { ...typography.caption, color: colors.text.primary, fontWeight: '600', fontSize: 11, flex: 1 },
  caption:       { ...typography.caption, color: colors.text.secondary, fontSize: 10, lineHeight: 14 },
});
