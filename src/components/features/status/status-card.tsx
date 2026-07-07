"use client";

import { useTranslations } from "next-intl";
import { useCouple } from "@/components/providers/couple-provider";
import { useOnlineUsers } from "@/components/providers/realtime-provider";
import { useSetStatus, useStatuses } from "@/hooks/use-statuses";
import { Card, CardTitle } from "@/components/ui/card";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { cn } from "@/lib/utils";
import { accentHex } from "@/lib/avatars";
import type { Profile } from "@/lib/supabase/types";

type State = "free" | "busy";

export function StatusCard() {
  const t = useTranslations("status");
  const { me, partner } = useCouple();
  const online = useOnlineUsers();
  const { data: statuses } = useStatuses();
  const setStatus = useSetStatus();

  const stateOf = (userId: string): State =>
    (statuses?.find((s) => s.user_id === userId)?.state as State) ?? "free";

  const myState = stateOf(me.id);

  return (
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
          />
        )}
      </div>

      <SegmentedToggle<State>
        value={myState}
        onChange={(state) => setStatus.mutate({ state })}
        options={[
          { value: "free", label: <>🌿 {t("free")}</>, activeClassName: "bg-free/25" },
          { value: "busy", label: <>⏳ {t("busy")}</>, activeClassName: "bg-busy/25" },
        ]}
      />
    </Card>
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
}: {
  profile: Profile;
  fallbackName: string;
  state: State;
  online: boolean;
  onlineLabel: string;
  offlineLabel: string;
  stateLabel: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div
          className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-2xl"
          style={{ boxShadow: `0 0 0 2px ${accentHex(profile.accent_color)}` }}
        >
          {profile.avatar_emoji ?? "🐣"}
        </div>
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-free ring-2 ring-surface" />
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
          state === "busy"
            ? "bg-busy/15 text-busy"
            : "bg-free/15 text-free",
        )}
      >
        {stateLabel}
      </span>
    </div>
  );
}
