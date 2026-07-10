"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { springBouncy } from "@/lib/motion";

const RESEND_COOLDOWN = 60;

export function LoginForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Tick the resend cooldown down to zero. Keyed on whether a countdown is
  // active so a single interval runs per countdown (not one recreated each
  // second); the functional decrement clears itself when it hits zero.
  const cooldownActive = cooldown > 0;
  useEffect(() => {
    if (!cooldownActive) return;
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownActive]);

  async function sendCode() {
    if (!email || loading) return;
    setLoading(true);
    const supabase = createClient();
    // No emailRedirectTo → Supabase sends a 6-digit code, not a magic link.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      toast.error(tc("error"));
      return;
    }
    setCode("");
    setInvalid(false);
    setCooldown(RESEND_COOLDOWN);
    setStep("code");
  }

  async function verify(token: string) {
    if (loading) return;
    setLoading(true);
    setInvalid(false);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) {
      setLoading(false);
      setInvalid(true);
      setCode("");
      return;
    }
    // Session cookies are now set; send the user into the app and let the
    // server re-read them (the (app) layout auth gate takes over from here).
    router.replace("/");
    router.refresh();
  }

  function onCodeChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (invalid) setInvalid(false);
    if (digits.length === 6) void verify(digits);
  }

  return (
    <Card className="w-full">
      <AnimatePresence mode="wait">
        {step === "email" ? (
          <motion.form
            key="email"
            onSubmit={(e) => {
              e.preventDefault();
              void sendCode();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lolo@lili.love"
                  className="h-12 w-full bg-transparent outline-none placeholder:text-muted/60"
                />
              </div>
            </label>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? tc("loading") : t("sendCode")}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={springBouncy}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <KeyRound className="size-10 text-secondary-foreground" />
              <p className="font-display text-lg font-semibold">
                {t("codeSentTitle")}
              </p>
              <p className="text-sm text-muted">{t("codeSentHint", { email })}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (code.length === 6) void verify(code);
              }}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col gap-1.5">
                <span className="px-1 text-sm font-semibold text-muted">
                  {t("codeLabel")}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  placeholder="••••••"
                  aria-invalid={invalid}
                  className="h-14 w-full rounded-cute bg-surface-muted text-center font-display text-2xl font-bold tracking-[0.5em] outline-none placeholder:tracking-[0.5em] placeholder:text-muted/40 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-400"
                />
              </label>
              {invalid && (
                <p className="px-1 text-center text-sm font-medium text-red-500">
                  {t("invalidCode")}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full"
              >
                {loading ? tc("loading") : t("verify")}
              </Button>
            </form>

            <div className="flex items-center justify-between px-1 text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setInvalid(false);
                }}
                className="flex items-center gap-1 text-muted transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                {t("changeEmail")}
              </button>
              <button
                type="button"
                disabled={cooldown > 0 || loading}
                onClick={() => void sendCode()}
                className="font-semibold text-secondary-foreground transition-opacity disabled:opacity-40"
              >
                {cooldown > 0 ? t("resendIn", { seconds: cooldown }) : t("resend")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
