import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useFavoriteEvent(userId: string | undefined, eventId: string) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from('favorite_events').select('event_id')
      .eq('user_id', userId).eq('event_id', eventId).maybeSingle()
      .then(({ data }) => setIsFav(!!data));
  }, [userId, eventId]);

  const toggle = async () => {
    if (!userId) return;
    setLoading(true);
    if (isFav) {
      await supabase.from('favorite_events').delete().eq('user_id', userId).eq('event_id', eventId);
      setIsFav(false);
    } else {
      await supabase.from('favorite_events').insert({ user_id: userId, event_id: eventId });
      setIsFav(true);
    }
    setLoading(false);
  };

  return { isFav, toggle, loading };
}

export function useFavoriteCreator(userId: string | undefined, creatorId: string) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from('favorite_creators').select('creator_id')
      .eq('user_id', userId).eq('creator_id', creatorId).maybeSingle()
      .then(({ data }) => setIsFav(!!data));
  }, [userId, creatorId]);

  const toggle = async () => {
    if (!userId) return;
    setLoading(true);
    if (isFav) {
      await supabase.from('favorite_creators').delete().eq('user_id', userId).eq('creator_id', creatorId);
      setIsFav(false);
    } else {
      await supabase.from('favorite_creators').insert({ user_id: userId, creator_id: creatorId });
      setIsFav(true);
    }
    setLoading(false);
  };

  return { isFav, toggle, loading };
}

export function useFavorites(userId: string | undefined) {
  const [favEvents, setFavEvents]     = useState<any[]>([]);
  const [favCreators, setFavCreators] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const [{ data: evs }, { data: crs }] = await Promise.all([
      supabase.from('favorite_events')
        .select('event_id, created_at, event:events(id, title, city, start_date, end_date, cover_image, discipline_tags, stand_price)')
        .eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('favorite_creators')
        .select('creator_id, created_at, creator:profiles!creator_id(id, full_name, avatar_url, creator_profile:creator_profiles(disciplines, city, portfolio_images))')
        .eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    setFavEvents(evs ?? []);
    setFavCreators(crs ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { favEvents, favCreators, loading, refetch: fetch };
}
