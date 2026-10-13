import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpymsolehyodfyamnpqn.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1weW1zb2xlaHlvZGZ5YW1ucHFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTg5NzUyMywiZXhwIjoyMTA3NDczNTIzfQ.7ohG02WpapB75mVcFUBDXEI-KBZqDrV3DAC7UWUbYag';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER || 'mygovtaihub@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || 'krxoucripoqlocaw';
const SENDER_EMAIL = process.env.SMTP_SENDER_EMAIL || 'mygovtaihub@gmail.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

console.log('[MAIL-DISPATCHER] Starting Infrapulse AI Mail Dispatcher...');
console.log(`[MAIL-DISPATCHER] Target SMTP: ${SMTP_HOST}:${SMTP_PORT} (${SMTP_USER})`);

async function processEmail(item) {
  if (!item || !item.id || !item.to_email) return;

  // Atomically claim the job to prevent duplicate sends
  const { data: claimed } = await supabase
    .from('mail_queue')
    .update({ status: 'processing' })
    .eq('id', item.id)
    .eq('status', 'pending')
    .select();

  if (!claimed || claimed.length === 0) {
    // Already claimed or processed by another cycle
    return;
  }

  console.log(`[MAIL-DISPATCHER] Processing claimed mail #${item.id} -> ${item.to_email} ("${item.subject}")`);

  try {
    const info = await transporter.sendMail({
      from: `"MyGovt AI Hub" <${SENDER_EMAIL}>`,
      sender: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: item.to_email,
      subject: item.subject,
      text: item.text || undefined,
      html: item.html
    });

    console.log(`[MAIL-DISPATCHER] Mail #${item.id} sent successfully! ID: ${info.messageId}`);

    await supabase
      .from('mail_queue')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', item.id);
  } catch (err) {
    console.error(`[MAIL-DISPATCHER] Failed to send mail #${item.id}:`, err?.message || err);

    await supabase
      .from('mail_queue')
      .update({ status: 'failed', error: err?.message || String(err) })
      .eq('id', item.id);
  }
}

async function drainQueue() {
  try {
    const { data, error } = await supabase
      .from('mail_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.warn('[MAIL-DISPATCHER] Error reading queue:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log(`[MAIL-DISPATCHER] Found ${data.length} pending email(s) in queue.`);
      for (const item of data) {
        await processEmail(item);
      }
    }
  } catch (err) {
    console.error('[MAIL-DISPATCHER] Drain queue error:', err);
  }
}

// 1. Initial drain of pending emails
await drainQueue();

// 2. Subscribe to Realtime new pending emails
const channel = supabase
  .channel('mail-queue-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'mail_queue'
    },
    async (payload) => {
      console.log('[MAIL-DISPATCHER] Realtime INSERT event received for mail_queue');
      if (payload.new && payload.new.status === 'pending') {
        await processEmail(payload.new);
      }
    }
  )
  .subscribe((status) => {
    console.log(`[MAIL-DISPATCHER] Realtime subscription status: ${status}`);
  });

// 3. Fallback polling every 5 seconds
setInterval(drainQueue, 5000);

console.log('[MAIL-DISPATCHER] Worker running and listening for emails...');
