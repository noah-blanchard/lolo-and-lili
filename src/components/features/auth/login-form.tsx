"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Mail, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { springBouncy } from "@/lib/motion";

export function LoginForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      toast.error(tc("error"));
      return;
    }
    setSent(true);
  }

  return (
    <Card className="w-full">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springBouncy}
            className="flex flex-col items-center gap-3 py-4 text-center"
          >
            <MailCheck className="size-12 text-secondary-foreground" />
            <p className="font-display text-lg font-semibold">
              {t("checkEmail")}
            </p>
            <p className="text-sm text-muted">{email}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-1.5">
              <span className="px-1 text-sm font-semibold text-muted">
                {t("emailLabel")}
              </span>
              <div className="flex items-center gap-2 rounded-cute bg-surface-muted px-4">
                <Mail className="size-5 shrink-0 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lolo@lili.love"
                  className="h-12 w-full bg-transparent outline-none placeholder:text-muted/60"
                />
              </div>
            </label>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? tc("loading") : t("sendLink")}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </Card>
  );
}
