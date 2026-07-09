"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCouple } from "@/components/providers/couple-provider";
import { useOnlineUsers } from "@/components/providers/realtime-provider";
import { useSetStatus, useStatuses } from "@/hooks/use-statuses";
import { useMoods } from "@/hooks/use-moods";
import { Card, CardTitle } from "@/components/ui/card";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { MoodDrawer } from "@/components/features/moods/mood-drawer";
import { moodEmoji } from "@/lib/moods";
import { cn } from "@/lib/utils";
import { accentHex } from "@/lib/avatars";
import type { Profile } from "@/lib/supabase/types";

type State = "free" | "busy" | "sieste";

export function StatusCard() {
  const t = useTranslations("status");
  const { me, partner } = useCouple();
  const online = useOnlineUsers();
  const { data: statuses } = useStatuses();
  const { data: moods } = useMoods();
  const setStatus = useSetStatus();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const stateOf = (userId: string): State =>
    (statuses?.find((s) => s.user_id === userId)?.state as State) ?? "free";

  const myState = stateOf(me.id);

  const currentMoodOf = (userId: string): string | null => {
    if (!moods || moods.length === 0) return null;
    const userMoods = moods.filter((m) => m.user_id === userId);
    if (userMoods.length === 0) return null;
    return userMoods[0]?.mood ?? null;
  };

  return (
    <>
      <Card className="flex flex-col gap-4">
        <CardTitle>{t("title")}</CardTitle>

        <div className="flex flex-col gap-3">
          <PersonRow
            profile={me}
            fallbackName={t("me")}
            state={myState}
            online={online.has(me.id)}
            onlineLabel={t("online")}
            offlineLabel={t("offline")}
            stateLabel={t(myState)}
            currentMood={currentMoodOf(me.id)}
            onMoodClick={() => setDrawerOpen(true)}
          />
          {partner && (
            <PersonRow
              profile={partner}
              fallbackName={t("partner")}
              state={stateOf(partner.id)}
              online={online.has(partner.id)}
              onlineLabel={t("online")}
              offlineLabel={t("offline")}
              stateLabel={t(stateOf(partner.id))}
              currentMood={currentMoodOf(partner.id)}
            />
          )}
        </div>

        <SegmentedToggle<State>
          value={myState}
          onChange={(state) => setStatus.mutate({ state })}
          options={[
            { value: "free", label: <>🌿 {t("free")}</>, activeClassName: "bg-free/25" },
            { value: "busy", label: <>⏳ {t("busy")}</>, activeClassName: "bg-busy/25" },
            { value: "sieste", label: <>😴 {t("sieste")}</>, activeClassName: "bg-sieste/25" },
          ]}
        />
      </Card>

      <MoodDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}

function PersonRow({
  profile,
  fallbackName,
  state,
  online,
  onlineLabel,
  offlineLabel,
  stateLabel,
  currentMood,
  onMoodClick,
}: {
  profile: Profile;
  fallbackName: string;
  state: State;
  online: boolean;
  onlineLabel: string;
  offlineLabel: string;
  stateLabel: string;
  currentMood: string | null;
  onMoodClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        role={onMoodClick ? "button" : undefined}
        tabIndex={onMoodClick ? 0 : undefined}
        onClick={onMoodClick}
        onKeyDown={onMoodClick ? (e) => { if (e.key === "Enter" || e.key === " ") onMoodClick(); } : undefined}
        className={cn(
          "relative flex size-12 items-center justify-center rounded-full bg-surface-muted text-2xl",
          onMoodClick && "cursor-pointer transition-transform active:scale-95",
        )}
        style={{ boxShadow: `0 0 0 2px ${accentHex(profile.accent_color)}` }}
      >
        {profile.avatar_emoji ?? "🐣"}
        {currentMood && (
          <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-surface text-sm shadow-sm ring-1 ring-border">
            {moodEmoji(currentMood)}
          </span>
        )}
        {online && (
          <span className="absolute -bottom-0.5 -left-0.5 size-3.5 rounded-full bg-free ring-2 ring-surface" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {profile.display_name ?? fallbackName}
        </p>
        <p className="text-sm text-muted">{online ? onlineLabel : offlineLabel}</p>
      </div>
      <span
        className={cn(
          "rounded-full px-3 py-1 text-sm font-semibold",
          state === "busy" && "bg-busy/15 text-busy",
          state === "sieste" && "bg-sieste/15 text-sieste",
          state === "free" && "bg-free/15 text-free",
        )}
      >
        {stateLabel}
      </span>
    </div>
  );
}
