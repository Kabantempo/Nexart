import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Event, CreatorProfile } from '../types';
import { haversineKm } from '../utils/geocode';
import { DEMO_MODE, DEMO_EVENTS, DEMO_APPLICATIONS } from '../lib/demoData';

// ─── For creators: score events ───────────────────────────────────────────────

function scoreEvent(event: Event, profile: CreatorProfile, appliedIds: string[]): number {
  if (appliedIds.includes(event.id)) return -1; // already applied
  let score = 0;

  // Discipline match (main signal — 50%)
  const overlap = event.discipline_tags.filter(t => profile.disciplines.includes(t)).length;
  score += overlap * 25;

  // Location (30%)
  if (event.region === profile.region) score += 20;
  if (event.city   === profile.city)   score += 10;

  // Price (free = bonus)
  if (event.stand_price === 0)                           score += 15;
  else if (event.stand_price !== null && event.stand_price <= 80) score += 8;

  // Upcoming soon (urgency)
  const days = Math.floor((new Date(event.start_date).getTime() - Date.now()) / 86400000);
  if (days <= 14)  score += 15;
  else if (days <= 30) score += 8;
  else if (days <= 60) score += 3;

  return score;
}

export function useEventRecommendations(creatorProfile: CreatorProfile | null, limit = 5) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!creatorProfile) { setLoading(false); return; }

    if (DEMO_MODE) {
      const appliedIds = DEMO_APPLICATIONS.map(a => a.event_id);
      const scored = (DEMO_EVENTS as unknown as Event[])
        .map(e => ({ e, score: scoreEvent(e, creatorProfile, appliedIds) }))
        .filter(x => x.score >= 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(x => x.e);
      setEvents(scored);
      setLoading(false);
      return;
    }

    Promise.all([
      supabase.from('events').select('*').eq('status', 'published')
        .gte('start_date', new Date().toISOString().slice(0, 10)).limit(100),
      supabase.from('applications').select('event_id').eq('creator_id', creatorProfile.user_id),
    ]).then(([{ data: evs }, { data: apps }]) => {
      const appliedIds = (apps ?? []).map((a: any) => a.event_id);
      const scored = (evs as Event[] ?? [])
        .map(e => ({ e, score: scoreEvent(e, creatorProfile, appliedIds) }))
        .filter(x => x.score >= 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(x => x.e);
      setEvents(scored);
      setLoading(false);
    });
  }, [creatorProfile?.user_id, limit]);

  return { events, loading };
}

// ─── For organizers: score creators ──────────────────────────────────────────

interface ScoredCreator {
  id: string;
  full_name: string;
  avatar_url: string | null;
  disciplines: string[];
  city: string | null;
  region: string | null;
  portfolio_images: string[];
  avg_rating: number;
  score: number;
}

function scoreCreator(creator: any, event: Event): number {
  let score = 0;
  const disciplines: string[] = creator.disciplines ?? [];
  const overlap = disciplines.filter((d: string) => event.discipline_tags.includes(d)).length;
  score += overlap * 30;
  if (creator.region === event.region) score += 20;
  if (creator.city   === event.city)   score += 10;
  score += (creator.avg_rating ?? 0) * 8;
  if (creator.siret_verified)     score += 10;
  if (creator.insurance_verified) score += 5;
  return score;
}

export function useCreatorRecommendations(event: Event | null, limit = 10) {
  const [creators, setCreators] = useState<ScoredCreator[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!event) { setLoading(false); return; }

    Promise.all([
      supabase.from('creator_profiles').select(`
        user_id, disciplines, city, region, portfolio_images,
        siret_verified, insurance_verified,
        profile:profiles!user_id(id, full_name, avatar_url)
      `).limit(200),
      supabase.from('reviews').select('reviewed_id, rating'),
    ]).then(([{ data: crs }, { data: revs }]) => {
      // Compute avg rating per creator
      const ratingMap: Record<string, { sum: number; count: number }> = {};
      for (const r of (revs as any[] ?? [])) {
        if (!ratingMap[r.reviewed_id]) ratingMap[r.reviewed_id] = { sum: 0, count: 0 };
        ratingMap[r.reviewed_id].sum += r.rating;
        ratingMap[r.reviewed_id].count++;
      }

      const scored = (crs as any[] ?? []).map(c => {
        const p = Array.isArray(c.profile) ? c.profile[0] : c.profile;
        const rData = ratingMap[p?.id] ?? { sum: 0, count: 0 };
        const avg_rating = rData.count > 0 ? rData.sum / rData.count : 0;
        return {
          id: p?.id ?? c.user_id,
          full_name: p?.full_name ?? '—',
          avatar_url: p?.avatar_url ?? null,
          disciplines: c.disciplines ?? [],
          city: c.city,
          region: c.region,
          portfolio_images: c.portfolio_images ?? [],
          avg_rating,
          siret_verified: c.siret_verified,
          insurance_verified: c.insurance_verified,
          score: scoreCreator({ ...c, avg_rating, id: p?.id, region: c.region, city: c.city }, event),
        };
      }).sort((a, b) => b.score - a.score).slice(0, limit);

      setCreators(scored);
      setLoading(false);
    });
  }, [event?.id, limit]);

  return { creators, loading };
}
