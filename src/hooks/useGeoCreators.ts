import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { haversineKm } from '../utils/geocode';

export interface GeoCreator {
  id: string;
  full_name: string;
  avatar_url: string | null;
  disciplines: string[];
  city: string | null;
  lat: number;
  lng: number;
  distanceKm?: number;
}

export function useGeoCreators(opts: {
  centerLat?: number;
  centerLng?: number;
  radiusKm?: number;
  discipline?: string;
}) {
  const [creators, setCreators] = useState<GeoCreator[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('creator_profiles')
      .select('user_id, disciplines, city, lat, lng, profile:profiles!user_id(id, full_name, avatar_url)')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .limit(300);

    let results: GeoCreator[] = (data ?? []).map((c: any) => {
      const p = Array.isArray(c.profile) ? c.profile[0] : c.profile;
      return {
        id:          p?.id ?? c.user_id,
        full_name:   p?.full_name ?? '—',
        avatar_url:  p?.avatar_url ?? null,
        disciplines: c.disciplines ?? [],
        city:        c.city,
        lat:         c.lat,
        lng:         c.lng,
      };
    });

    if (opts.discipline) {
      results = results.filter(c => c.disciplines.includes(opts.discipline!));
    }

    if (opts.centerLat && opts.centerLng && opts.radiusKm) {
      results = results
        .map(c => ({ ...c, distanceKm: Math.round(haversineKm(opts.centerLat!, opts.centerLng!, c.lat, c.lng)) }))
        .filter(c => (c.distanceKm ?? 999) <= opts.radiusKm!);
      results.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    setCreators(results);
    setLoading(false);
  }, [opts.centerLat, opts.centerLng, opts.radiusKm, opts.discipline]);

  useEffect(() => { fetch(); }, [fetch]);

  return { creators, loading };
}
