import { z } from "zod";

import { COUPLE_GOALS, HOW_MET_OPTIONS, RELATIONSHIP_DURATIONS } from "./types";

export const personNameSchema = z
  .string()
  .trim()
  .min(1, "Напишите имя")
  .max(24, "Имя длиннее 24 символов")
  .regex(/^[\p{L}][\p{L}\s'-]*$/u, "В имени нужны только буквы");

export const ageSchema = z.number().int("Возраст — целое число").min(16, "Возраст от 16").max(99, "Возраст до 99");

export const coupleProfileSchema = z
  .object({
    player1: z.object({ name: personNameSchema, age: ageSchema }),
    player2: z.object({ name: personNameSchema, age: ageSchema }),
    relationshipDuration: z.enum(RELATIONSHIP_DURATIONS),
    customDuration: z
      .object({
        years: z.number().int().min(0).max(80),
        months: z.number().int().min(0).max(11),
      })
      .optional(),
    howMet: z.enum(HOW_MET_OPTIONS),
    howMetDetails: z.string().trim().max(180).optional(),
    goals: z.array(z.enum(COUPLE_GOALS)).min(1),
    goalsOther: z.string().trim().max(80).optional(),
  })
  .superRefine((profile, context) => {
    if (profile.relationshipDuration === "custom") {
      const years = profile.customDuration?.years ?? 0;
      const months = profile.customDuration?.months ?? 0;
      if (years === 0 && months === 0) {
        context.addIssue({
          code: "custom",
          path: ["customDuration"],
          message: "Укажите годы или месяцы",
        });
      }
    }
    if (profile.goals.includes("other") && (profile.goalsOther ?? "").length < 2) {
      context.addIssue({
        code: "custom",
        path: ["goalsOther"],
        message: "Коротко напишите, что именно",
      });
    }
  });

export const coupleDraftSchema = z.object({
  player1Name: z.string(),
  player1Age: z.string(),
  player2Name: z.string(),
  player2Age: z.string(),
  relationshipDuration: z.union([z.enum(RELATIONSHIP_DURATIONS), z.literal("")]),
  customYears: z.string(),
  customMonths: z.string(),
  howMet: z.union([z.enum(HOW_MET_OPTIONS), z.literal("")]),
  howMetDetails: z.string(),
  goals: z.array(z.enum(COUPLE_GOALS)),
  goalsOther: z.string(),
});
