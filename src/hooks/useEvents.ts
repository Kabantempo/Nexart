import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Event } from '../types';

interface UseEventsOptions {
  limit?: number;
  region?: string;
  disciplineTags?: string[];
  organizerId?: string;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { limit = 20, region, disciplineTags, organizerId } = options;

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (organizerId) {
      query = query.eq('organizer_id', organizerId);
    } else {
      query = query.eq('status', 'published');
    }

    if (region) query = query.eq('region', region);
    if (disciplineTags?.length) query = query.overlaps('discipline_tags', disciplineTags);

    query = query.limit(limit);

    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setEvents(data ?? []);
    setLoading(false);
  }, [limit, region, disciplineTags, organizerId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { events, loading, error, refetch: fetch };
}
