"use client";

import { useLocale } from "next-intl";
import { MEAL_SLOTS } from "@/lib/schemas/meal";
import { useMeals } from "@/hooks/use-meals";
import { Card } from "@/components/ui/card";
import { MealSlot } from "./meal-slot";

function weekDates(): string[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i));
    return d.toISOString().slice(0, 10);
  });
}

export function WeekPlanner() {
  const locale = useLocale();
  const { data } = useMeals();
  const days = weekDates();
  const mealFor = (date: string, slot: string) =>
    (data ?? []).find((m) => m.date === date && m.slot === slot) ?? null;

  return (
    <div className="flex flex-col gap-4">
      {days.map((date) => {
        const label = new Date(`${date}T00:00:00Z`).toLocaleDateString(
          locale === "zh" ? "zh-CN" : "fr-FR",
          { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" },
        );
        return (
          <Card key={date} className="flex flex-col gap-2">
            <h2 className="font-display font-semibold capitalize">{label}</h2>
            <div className="flex flex-col gap-1.5">
              {MEAL_SLOTS.map((slot) => (
                <MealSlot key={slot} date={date} slot={slot} meal={mealFor(date, slot)} />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
