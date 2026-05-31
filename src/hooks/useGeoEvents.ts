import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Event } from '../types';

export interface GeoEvent extends Event {
  lat: number;
  lng: number;
}

export interface MapFilters {
  disciplines: string[];
  maxPrice: number | null;   // null = tous
  daysAhead: number | null;  // null = tous
  radiusKm: number | null;   // null = toute la France
  userLat?: number;
  userLng?: number;
}

export const DEFAULT_FILTERS: MapFilters = {
  disciplines: [],
  maxPrice:    null,
  daysAhead:   null,
  radiusKm:    null,
};

export function useGeoEvents(filters: MapFilters = DEFAULT_FILTERS) {
  const [events, setEvents] = useState<GeoEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .gte('start_date', new Date().toISOString().slice(0, 10))
      .order('start_date', { ascending: true })
      .limit(200);

    if (filters.disciplines.length) query = query.overlaps('discipline_tags', filters.disciplines);
    if (filters.maxPrice !== null)  query = query.lte('stand_price', filters.maxPrice);
    if (filters.daysAhead !== null) {
      const until = new Date();
      until.setDate(until.getDate() + filters.daysAhead);
      query = query.lte('start_date', until.toISOString().slice(0, 10));
    }

    const { data } = await query;
    let results = (data as GeoEvent[]) ?? [];

    // Client-side radius filter
    if (filters.radiusKm && filters.userLat && filters.userLng) {
      const { haversineKm } = await import('../utils/geocode');
      results = results.filter(e =>
        haversineKm(filters.userLat!, filters.userLng!, e.lat, e.lng) <= filters.radiusKm!,
      );
    }

    setEvents(results);
    setLoading(false);
  }, [filters.disciplines, filters.maxPrice, filters.daysAhead, filters.radiusKm, filters.userLat, filters.userLng]);

  useEffect(() => { fetch(); }, [fetch]);

  return { events, loading, refetch: fetch };
}
