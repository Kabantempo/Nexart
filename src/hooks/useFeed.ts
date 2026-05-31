import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from './usePosts';

export type FeedItem =
  | { type: 'post'; data: Post }
  | { type: 'event'; data: any };

export function useFeed(opts: {
  userId?: string;
  followedIds?: string[];
  region?: string | null;
  discipline?: string[];
}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);

    const postsQuery = supabase
      .from('posts')
      .select('*, creator:profiles!creator_id(id, full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(40);

    // Show posts from followed creators first, then all recent
    const eventsQuery = supabase
      .from('events')
      .select('id, title, city, region, start_date, discipline_tags, stand_price, event_type')
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString().slice(0, 10))
      .order('start_date', { ascending: true })
      .limit(10);

    const [{ data: posts }, { data: events }] = await Promise.all([postsQuery, eventsQuery]);

    let feedPosts = (posts as Post[]) ?? [];
    let feedEvents = (events ?? []) as any[];

    // Sort: followed creators first, then by date
    if (opts.followedIds?.length) {
      feedPosts = [
        ...feedPosts.filter(p => opts.followedIds!.includes(p.creator_id)),
        ...feedPosts.filter(p => !opts.followedIds!.includes(p.creator_id)),
      ];
    }

    // Filter events by region
    if (opts.region) {
      feedEvents = feedEvents.filter(e => e.region === opts.region);
    }

    // Interleave: 3 posts, 1 event, 3 posts, 1 event…
    const result: FeedItem[] = [];
    let pi = 0, ei = 0;
    while (pi < feedPosts.length || ei < feedEvents.length) {
      for (let i = 0; i < 3 && pi < feedPosts.length; i++, pi++) {
        result.push({ type: 'post', data: feedPosts[pi] });
      }
      if (ei < feedEvents.length) {
        result.push({ type: 'event', data: feedEvents[ei++] });
      }
    }

    setItems(result);
    setLoading(false);
  }, [opts.userId, opts.followedIds?.join(','), opts.region, opts.discipline?.join(',')]);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, refetch: fetch };
}
