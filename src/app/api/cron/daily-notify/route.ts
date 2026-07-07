import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyCouple } from "@/lib/services/notifications";
import { daysUntil, nextOccurrence } from "@/lib/countdowns";

export const runtime = "nodejs";

/**
 * Daily countdown reminders. Guard with `Authorization: Bearer $CRON_SECRET`.
 * Wire to Vercel Cron (see vercel.json) or Supabase pg_cron. Sends "today 🎉"
 * on the day and a "one week to go" nudge exactly 7 days before.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: dates } = await admin.from("special_dates").select("*");
  const now = new Date();
  let sent = 0;

  for (const d of dates ?? []) {
    const days = daysUntil(nextOccurrence(d.date, d.recurring, now), now);
    const message = days === 0 ? "date_today" : days === 7 ? "date_soon" : null;
    if (!message) continue;
    await notifyCouple({
      coupleId: d.couple_id,
      message,
      extra: `${d.emoji} ${d.title}`,
    });
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
