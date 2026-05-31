// Supabase Edge Function — send transactional emails via Resend
// Deploy: supabase functions deploy send-email
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxxx

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM = 'Nexart <noreply@nexart.fr>';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { to, subject, html }: EmailPayload = await req.json();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
});

// Templates (call this function from your app or Supabase triggers)
export const templates = {
  applicationAccepted: (eventTitle: string) => ({
    subject: `🎉 Candidature acceptée — ${eventTitle}`,
    html: `<h2>Votre candidature a été acceptée !</h2><p>Vous avez été sélectionné pour participer à <strong>${eventTitle}</strong>.</p><p>Connectez-vous à Nexart pour contacter l'organisateur.</p>`,
  }),
  applicationRefused: (eventTitle: string) => ({
    subject: `Candidature non retenue — ${eventTitle}`,
    html: `<h2>Candidature non retenue</h2><p>Votre candidature pour <strong>${eventTitle}</strong> n'a pas été retenue cette fois.</p><p>D'autres marchés vous attendent sur Nexart !</p>`,
  }),
  newMessage: (senderName: string) => ({
    subject: `💬 Nouveau message de ${senderName}`,
    html: `<h2>Vous avez un nouveau message</h2><p><strong>${senderName}</strong> vous a envoyé un message sur Nexart.</p><p>Connectez-vous pour répondre.</p>`,
  }),
};
