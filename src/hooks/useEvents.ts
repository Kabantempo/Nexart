import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Event } from '../types';
import { DEMO_MODE, DEMO_EVENTS } from '../lib/demoData';

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
    else {
      const real = data ?? [];
      if (DEMO_MODE && real.length === 0) {
        const demo = organizerId
          ? DEMO_EVENTS.filter(e => e.organizer_id === organizerId)
          : DEMO_EVENTS;
        setEvents(demo.slice(0, limit) as unknown as Event[]);
      } else {
        setEvents(real);
      }
    }
    setLoading(false);
  }, [limit, region, disciplineTags, organizerId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { events, loading, error, refetch: fetch };
}
