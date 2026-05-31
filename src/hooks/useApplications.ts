import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Application, ApplicationStatus } from '../types';

interface ApplicationWithEvent extends Application {
  event: { id: string; title: string; city: string | null; start_date: string; cover_image: string | null };
}

interface ApplicationWithCreator extends Application {
  creator: { id: string; full_name: string; avatar_url: string | null };
}

export function useCreatorApplications(creatorId: string | undefined) {
  const [applications, setApplications] = useState<ApplicationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!creatorId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('applications')
      .select('*, event:events(id, title, city, start_date, cover_image)')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (err) setError(err.message);
    else setApplications((data as ApplicationWithEvent[]) ?? []);
    setLoading(false);
  }, [creatorId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { applications, loading, error, refetch: fetch };
}

export function useOrganizerApplications(eventId?: string) {
  const [applications, setApplications] = useState<ApplicationWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('applications')
      .select('*, creator:profiles(id, full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);

    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setApplications((data as ApplicationWithCreator[]) ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (applicationId: string, status: ApplicationStatus) => {
    const { error: err } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);
    if (!err) await fetch();
    return err;
  };

  return { applications, loading, error, updateStatus, refetch: fetch };
}

export function useApply(eventId: string, creatorId: string | undefined) {
  const [loading, setLoading] = useState(false);

  const apply = async (message?: string) => {
    if (!creatorId) return { error: 'Non connecté' };
    setLoading(true);
    const { error } = await supabase.from('applications').insert({
      event_id: eventId,
      creator_id: creatorId,
      message: message ?? null,
    });
    setLoading(false);
    return { error: error?.message ?? null };
  };

  return { apply, loading };
}
