"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAdoptPet } from "@/hooks/use-pet";
import { SKINS, SKIN_EMOJI, type Skin } from "@/lib/pets";
import { celebrate } from "@/lib/confetti";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tapScale, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function PetAdopt() {
  const t = useTranslations("pet");
  const adopt = useAdoptPet();

  const [name, setName] = useState("");
  const [skin, setSkin] = useState<Skin>("classic");

  function submit() {
    if (!name.trim() || adopt.isPending) return;
    adopt.mutate(
      { name: name.trim(), skin },
      {
        onSuccess: () => celebrate(),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  }

  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl"
      >
        {SKIN_EMOJI[skin]}
      </motion.div>
      <div>
        <CardTitle>{t("adoptTitle")}</CardTitle>
        <CardDescription>{t("adoptSubtitle")}</CardDescription>
      </div>

      <div className="flex gap-2">
        {SKINS.map((s) => (
          <motion.button
            key={s}
            whileTap={tapScale}
            transition={springBouncy}
            onClick={() => setSkin(s)}
            className={cn(
              "flex size-11 items-center justify-center rounded-cute bg-surface-muted text-2xl",
              skin === s && "ring-2 ring-primary",
            )}
          >
            {SKIN_EMOJI[s]}
          </motion.button>
        ))}
      </div>

      <input
        value={name}
        maxLength={24}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("namePlaceholder")}
        className="h-12 w-full rounded-cute bg-surface-muted px-4 text-center outline-none placeholder:text-muted/60"
      />

      <Button
        onClick={submit}
        disabled={!name.trim()}
        loading={adopt.isPending}
        className="w-full"
      >
        {t("adoptCta")}
      </Button>
    </Card>
  );
}
