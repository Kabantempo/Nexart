import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CreatorProfile } from '../types';
import { geocodeCity } from '../utils/geocode';
import { DEMO_MODE, DEMO_CREATOR_PROFILE } from '../lib/demoData';

export function useCreatorProfile(userId: string | undefined) {
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    if (DEMO_MODE) {
      setCreatorProfile({ ...DEMO_CREATOR_PROFILE, user_id: userId } as unknown as CreatorProfile);
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (err) setError(err.message);
    else setCreatorProfile(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const upsert = async (fields: Partial<Omit<CreatorProfile, 'id' | 'user_id' | 'siret_verified' | 'insurance_verified'>>) => {
    if (!userId) return { error: 'Non connecté' };
    setSaving(true);
    let geoFields: { lat?: number; lng?: number } = {};
    if (fields.city) {
      const geo = await geocodeCity(fields.city, (fields as any).region);
      if (geo) geoFields = { lat: geo.lat, lng: geo.lng };
    }
    const payload = { user_id: userId, ...fields, ...geoFields };
    const { data, error: err } = await supabase
      .from('creator_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();
    setSaving(false);
    if (err) return { error: err.message };
    setCreatorProfile(data);
    return { error: null };
  };

  const updateBio = async (bio: string) => {
    if (!userId) return;
    await supabase.from('profiles').update({ bio }).eq('id', userId);
  };

  return { creatorProfile, loading, saving, error, upsert, updateBio, refetch: fetch };
}
