import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Message } from '../types';

export function useMessages(conversationId: string | undefined, currentUserId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  }, [conversationId]);

  // Mark incoming messages as read
  const markRead = useCallback(async () => {
    if (!conversationId || !currentUserId) return;
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .is('read_at', null);
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages().then(markRead);

    // Realtime subscription
    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => {
            const incoming = payload.new as Message;
            if (prev.find(m => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
          // Mark as read if from the other party
          if ((payload.new as Message).sender_id !== currentUserId) {
            supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', (payload.new as Message).id);
          }
        },
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, currentUserId, fetchMessages, markRead]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!conversationId || !currentUserId || !content.trim()) return false;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content.trim(),
    });
    setSending(false);
    return !error;
  };

  return { messages, loading, sending, sendMessage };
}
