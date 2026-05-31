import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type PostType = 'guest_appearance' | 'call_for_collab' | 'tip' | 'experience' | 'general';

export interface Post {
  id: string;
  creator_id: string;
  content: string;
  images: string[];
  hashtags: string[];
  post_type: PostType;
  event_ref: string | null;
  location_name: string | null;
  lat: number | null;
  lng: number | null;
  likes_count: number;
  created_at: string;
  creator?: { id: string; full_name: string; avatar_url: string | null };
}

export function extractHashtags(text: string): string[] {
  return [...new Set((text.match(/#[\wÀ-ÿ]+/gi) ?? []).map(t => t.slice(1).toLowerCase()))];
}

export function usePosts(opts: { creatorId?: string; hashtag?: string; limit?: number } = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, creator:profiles!creator_id(id, full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(opts.limit ?? 30);

    if (opts.creatorId) query = query.eq('creator_id', opts.creatorId);
    if (opts.hashtag)   query = query.contains('hashtags', [opts.hashtag.toLowerCase()]);

    const { data } = await query;
    setPosts((data as Post[]) ?? []);
    setLoading(false);
  }, [opts.creatorId, opts.hashtag, opts.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { posts, loading, refetch: fetch };
}

export function usePostLike(userId: string | undefined, postId: string, initialCount: number) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!userId) return;
    supabase.from('post_likes').select('user_id').eq('user_id', userId).eq('post_id', postId).maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [userId, postId]);

  const toggle = async () => {
    if (!userId) return;
    if (liked) {
      await supabase.from('post_likes').delete().eq('user_id', userId).eq('post_id', postId);
      setLiked(false); setCount(c => Math.max(0, c - 1));
    } else {
      await supabase.from('post_likes').insert({ user_id: userId, post_id: postId });
      setLiked(true); setCount(c => c + 1);
    }
  };

  return { liked, count, toggle };
}

export async function createPost(data: {
  creatorId: string;
  content: string;
  images: string[];
  postType: PostType;
  eventRef?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
}): Promise<{ error: string | null }> {
  const hashtags = extractHashtags(data.content);
  const { error } = await supabase.from('posts').insert({
    creator_id:    data.creatorId,
    content:       data.content.trim(),
    images:        data.images,
    hashtags,
    post_type:     data.postType,
    event_ref:     data.eventRef ?? null,
    location_name: data.locationName ?? null,
    lat:           data.lat ?? null,
    lng:           data.lng ?? null,
  });
  return { error: error?.message ?? null };
}
