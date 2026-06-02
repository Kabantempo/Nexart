import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Application, ApplicationStatus } from '../types';
import { getPushTokenForUser, sendPushNotification } from './usePushNotifications';
import { DEMO_MODE, DEMO_APPLICATIONS, DEMO_ORGANIZER_APPLICATIONS } from '../lib/demoData';

interface ApplicationWithEvent extends Application {
  event: { id: string; title: string; city: string | null; start_date: string; end_date: string | null; cover_image: string | null; organizer_id: string };
}

interface ApplicationWithCreator extends Application {
  creator: { id: string; full_name: string; avatar_url: string | null };
  event:   { id: string; title: string };
}

export function useCreatorApplications(creatorId: string | undefined) {
  const [applications, setApplications] = useState<ApplicationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!creatorId) return;
    setLoading(true);

    if (DEMO_MODE) {
      setApplications(DEMO_APPLICATIONS as unknown as ApplicationWithEvent[]);
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from('applications')
      .select('*, event:events(id, title, city, start_date, end_date, cover_image, organizer_id)')
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

    if (DEMO_MODE) {
      const demo = eventId
        ? DEMO_ORGANIZER_APPLICATIONS.filter(a => a.event_id === eventId)
        : DEMO_ORGANIZER_APPLICATIONS;
      setApplications(demo as unknown as ApplicationWithCreator[]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from('applications')
      .select('*, creator:profiles(id, full_name, avatar_url), event:events(id, title)')
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

    if (!err) {
      await fetch();
      const app = applications.find(a => a.id === applicationId);
      if (app?.creator?.id) {
        getPushTokenForUser(app.creator.id).then(token => {
          if (!token) return;
          const eventTitle = app.event?.title ?? 'un marché';
          if (status === 'accepted') {
            sendPushNotification(token, '🎉 Candidature acceptée !', `Votre candidature pour « ${eventTitle} » a été acceptée.`);
          } else if (status === 'refused') {
            sendPushNotification(token, 'Candidature non retenue', `Votre candidature pour « ${eventTitle} » n'a pas été retenue.`);
          }
        });
      }
    }
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

    if (!error) {
      supabase
        .from('events')
        .select('title, organizer_id, profiles:organizer_id(full_name)')
        .eq('id', eventId)
        .single()
        .then(({ data }) => {
          if (!data?.organizer_id) return;
          getPushTokenForUser(data.organizer_id).then(token => {
            if (!token) return;
            const creatorName = (data as any).profiles?.full_name ?? 'Un créateur';
            sendPushNotification(token, '📩 Nouvelle candidature', `${creatorName} a candidaté pour « ${data.title} ».`);
          });
        });
    }

    setLoading(false);
    return { error: error?.message ?? null };
  };

  return { apply, loading };
}
