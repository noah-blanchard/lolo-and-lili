"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, type Variants } from "motion/react";
import { celebrateBig } from "@/lib/confetti";
import { vibrate } from "@/lib/feedback";
import { springBouncy, staggerContainer } from "@/lib/motion";
import { questionByKey, questionText } from "@/lib/questions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCouple } from "@/components/providers/couple-provider";
import { useQuestion, useSubmitAnswer } from "@/hooks/use-question";

// The two answers flip in from opposite sides on reveal.
const revealLeft: Variants = {
  hidden: { opacity: 0, x: -44, rotate: -4 },
  visible: { opacity: 1, x: 0, rotate: 0, transition: springBouncy },
};
const revealRight: Variants = {
  hidden: { opacity: 0, x: 44, rotate: 4 },
  visible: { opacity: 1, x: 0, rotate: 0, transition: springBouncy },
};

function AnswerBubble({
  name,
  answer,
  accent,
}: {
  name: string | null;
  answer: string;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "bg-secondary/15" : undefined}>
      <span className="text-sm font-semibold text-muted">{name ?? "💕"}</span>
      <p className="whitespace-pre-wrap pt-1">{answer}</p>
    </Card>
  );
}

export function QuestionBoard() {
  const t = useTranslations("question");
  const locale = useLocale();
  const { me, partner } = useCouple();
  const { data: view, isLoading } = useQuestion();
  const submit = useSubmitAnswer();
  const [draft, setDraft] = useState("");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-cute bg-surface p-5 shadow-soft bg-primary/10">
          <Skeleton className="mb-2 size-8 rounded-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="rounded-cute bg-surface p-5 shadow-soft">
          <Skeleton className="mb-3 h-24 w-full rounded-cute" />
          <Skeleton className="h-10 w-full rounded-cute" />
        </div>
      </div>
    );
  }

  if (!view) return null;

  const q = questionByKey(view.questionKey);
  const prompt = q ? questionText(q, locale) : "";

  function send() {
    const text = draft.trim();
    if (!text || submit.isPending) return;
    submit.mutate(
      { answer: text },
      {
        onSuccess: (v) => {
          if (v.revealed) {
            celebrateBig();
            vibrate(30);
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col gap-2 bg-primary/10">
        <span className="text-2xl">❓</span>
        <p className="font-display text-xl font-semibold leading-snug">{prompt}</p>
      </Card>

      {!view.myAnswer ? (
        <Card className="flex flex-col gap-3">
          <textarea
            value={draft}
            maxLength={500}
            rows={4}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full resize-none rounded-cute bg-surface-muted p-3 outline-none placeholder:text-muted/60"
          />
          <Button
            onClick={send}
            disabled={!draft.trim()}
            loading={submit.isPending}
            className="w-full"
          >
            {t("submit")}
          </Button>
        </Card>
      ) : !view.revealed ? (
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
        >
          <Card className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted">{t("yourAnswer")}</span>
            <p className="whitespace-pre-wrap">{view.myAnswer}</p>
            <p className="pt-2 text-sm text-muted">
              {t("waiting", { name: partner?.display_name ?? "" })}
            </p>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          <motion.div variants={revealLeft}>
            <AnswerBubble name={me.display_name} answer={view.myAnswer ?? ""} />
          </motion.div>
          <motion.div variants={revealRight}>
            <AnswerBubble
              name={partner?.display_name ?? null}
              answer={view.partnerAnswer ?? ""}
              accent
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
