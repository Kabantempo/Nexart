import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { VisitorInquiry } from '../types';

export function useVisitorInquiry(visitorId: string | undefined, creatorId: string) {
  const [inquiry, setInquiry] = useState<VisitorInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const fetch = useCallback(async () => {
    if (!visitorId) { setLoading(false); return; }
    const { data } = await supabase
      .from('visitor_inquiries')
      .select('*')
      .eq('visitor_id', visitorId)
      .eq('creator_id', creatorId)
      .maybeSingle();
    setInquiry(data as VisitorInquiry | null);
    setLoading(false);
  }, [visitorId, creatorId]);

  useEffect(() => { fetch(); }, [fetch]);

  const send = async (message: string): Promise<{ error: string | null }> => {
    if (!visitorId) return { error: 'Non connecté' };
    setSaving(true);
    const { data, error } = await supabase
      .from('visitor_inquiries')
      .insert({ visitor_id: visitorId, creator_id: creatorId, message })
      .select().single();
    setSaving(false);
    if (error) return { error: error.message };
    setInquiry(data as VisitorInquiry);
    return { error: null };
  };

  const edit = async (message: string): Promise<{ error: string | null }> => {
    if (!inquiry) return { error: 'Aucun message' };
    setSaving(true);
    const { error } = await supabase
      .from('visitor_inquiries')
      .update({ message })
      .eq('id', inquiry.id);
    setSaving(false);
    if (error) return { error: error.message };
    setInquiry(prev => prev ? { ...prev, message } : prev);
    return { error: null };
  };

  return { inquiry, loading, saving, send, edit, refetch: fetch };
}

// For creator: list all inquiries they've received
export function useCreatorInquiries(creatorId: string | undefined) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  const fetch = useCallback(async () => {
    if (!creatorId) { setLoading(false); return; }
    const { data } = await supabase
      .from('visitor_inquiries')
      .select('*, visitor:profiles!visitor_id(id, full_name, avatar_url)')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });
    setInquiries(data ?? []);
    setLoading(false);
  }, [creatorId]);

  useEffect(() => { fetch(); }, [fetch]);

  const reply = async (inquiryId: string, replyText: string) => {
    const { error } = await supabase
      .from('visitor_inquiries')
      .update({ reply: replyText, replied_at: new Date().toISOString() })
      .eq('id', inquiryId);
    if (!error) fetch();
    return error;
  };

  return { inquiries, loading, reply, refetch: fetch };
}
