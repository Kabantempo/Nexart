import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getPushTokenForUser, sendPushNotification } from './usePushNotifications';

export function useFollow(followerId: string | undefined, followedId: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [counts, setCounts]           = useState({ followers: 0, following: 0 });

  useEffect(() => {
    if (!followedId) return;
    Promise.all([
      supabase.from('follows').select('follower_id', { count: 'exact' }).eq('followed_id', followedId),
      followerId
        ? supabase.from('follows').select('follower_id').eq('follower_id', followerId).eq('followed_id', followedId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]).then(([{ count }, { data }]) => {
      setCounts(c => ({ ...c, followers: count ?? 0 }));
      setIsFollowing(!!data);
    });
  }, [followerId, followedId]);

  const toggle = async () => {
    if (!followerId) return;
    setLoading(true);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', followerId).eq('followed_id', followedId);
      setIsFollowing(false);
      setCounts(c => ({ ...c, followers: Math.max(0, c.followers - 1) }));
    } else {
      await supabase.from('follows').insert({ follower_id: followerId, followed_id: followedId });
      setIsFollowing(true);
      setCounts(c => ({ ...c, followers: c.followers + 1 }));
      // Push notif to followed user
      getPushTokenForUser(followedId).then(token => {
        if (token) sendPushNotification(token, '🎨 Nouveau follower', 'Quelqu\'un suit maintenant votre profil Nexart.');
      });
    }
    setLoading(false);
  };

  return { isFollowing, toggle, loading, followers: counts.followers };
}

export function useFollowCounts(userId: string | undefined) {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ]).then(([{ count: flrs }, { count: flwg }]) => {
      setFollowers(flrs ?? 0);
      setFollowing(flwg ?? 0);
    });
  }, [userId]);

  return { followers, following };
}

export function useFollowedCreators(userId: string | undefined) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase.from('follows').select('followed_id').eq('follower_id', userId)
      .then(({ data }) => setIds((data ?? []).map((r: any) => r.followed_id)));
  }, [userId]);

  return ids;
}
