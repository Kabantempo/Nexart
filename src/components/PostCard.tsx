import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Post, PostType, usePostLike } from '../hooks/usePosts';
import { useAuth } from '../stores/auth';
import { colors, spacing, typography, radius } from '../constants/theme';

export const POST_TYPE_CONFIG: Record<PostType, { label: string; color: string }> = {
  guest_appearance: { label: '🎨 Guest',      color: '#A855F7' },
  call_for_collab:  { label: '🤝 Collab',     color: '#10B981' },
  tip:              { label: '💡 Conseil',     color: '#F59E0B' },
  experience:       { label: '⭐ Expérience',  color: '#3B82F6' },
  general:          { label: '📝 Post',        color: colors.text.secondary },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "à l'instant";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function renderContent(content: string) {
  const parts = content.split(/(#[\wÀ-ÿ]+)/gi);
  return parts.map((part, i) =>
    part.startsWith('#')
      ? <Text key={i} style={s.hashtag}>{part}</Text>
      : <Text key={i}>{part}</Text>
  );
}

export default function PostCard({ post, showCreator = true }: { post: Post; showCreator?: boolean }) {
  const { profile } = useAuth();
  const nav = useNavigation<any>();
  const { liked, count, toggle } = usePostLike(profile?.id, post.id, post.likes_count);
  const cfg = POST_TYPE_CONFIG[post.post_type] ?? POST_TYPE_CONFIG.general;
  const creator = post.creator as any;

  return (
    <View style={s.card}>
      {/* Header */}
      {showCreator && creator && (
        <TouchableOpacity
          style={s.header}
          onPress={() => nav.navigate('PublicCreatorProfile', { creatorId: creator.id })}
          activeOpacity={0.7}
        >
          <View style={s.avatar}>
            {creator.avatar_url
              ? <Image source={{ uri: creator.avatar_url }} style={s.avatarImg} />
              : <Text style={s.avatarText}>{creator.full_name?.[0]?.toUpperCase()}</Text>
            }
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.creatorName}>{creator.full_name}</Text>
            <Text style={s.time}>{timeAgo(post.created_at)}</Text>
          </View>
          <View style={[s.typeBadge, { backgroundColor: cfg.color + '20', borderColor: cfg.color + '40' }]}>
            <Text style={[s.typeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Event ref */}
      {post.event_ref && (
        <View style={s.eventRef}>
          <Text style={s.eventRefText}>📍 {post.event_ref}</Text>
        </View>
      )}

      {/* Content */}
      <Text style={s.content}>{renderContent(post.content)}</Text>

      {/* Images */}
      {post.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.imageRow}>
          {post.images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={[s.image, post.images.length === 1 && s.imageFull]} />
          ))}
        </ScrollView>
      )}

      {/* Location */}
      {post.location_name && (
        <Text style={s.location}>📍 {post.location_name}</Text>
      )}

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity style={s.likeBtn} onPress={toggle}>
          <Text style={[s.likeIcon, liked && s.likeIconActive]}>{liked ? '♥' : '♡'}</Text>
          <Text style={[s.likeCount, liked && s.likeCountActive]}>{count}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card:       { backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  header:     { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '25', alignItems: 'center', justifyContent: 'center' },
  avatarImg:  { width: 40, height: 40, borderRadius: 20 },
  avatarText: { ...typography.label, color: colors.primary, fontWeight: '700' },
  creatorName:{ ...typography.label, color: colors.text.primary, fontWeight: '700' },
  time:       { ...typography.caption, color: colors.text.secondary },
  typeBadge:  { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, borderWidth: 1 },
  typeText:   { ...typography.caption, fontWeight: '700', fontSize: 10 },
  eventRef:   { backgroundColor: colors.primary + '10', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: spacing.sm },
  eventRefText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  content:    { ...typography.body, color: colors.text.primary, lineHeight: 22, marginBottom: spacing.sm },
  hashtag:    { color: colors.primary, fontWeight: '600' },
  imageRow:   { marginHorizontal: -spacing.xl, marginBottom: spacing.sm },
  image:      { width: 200, height: 200, borderRadius: radius.md, marginLeft: spacing.xl, marginRight: spacing.xs },
  imageFull:  { width: undefined, flex: 1, marginHorizontal: 0, borderRadius: 0, height: 240 },
  location:   { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm },
  footer:     { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  likeBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeIcon:   { fontSize: 22, color: colors.border },
  likeIconActive: { color: colors.error },
  likeCount:  { ...typography.label, color: colors.text.secondary },
  likeCountActive: { color: colors.error },
});
