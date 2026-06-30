import { z } from 'zod';

const responseItemSchema = z.object({
  question_id: z.string().min(1),
  answer: z.union([z.string(), z.array(z.string())]),
});

export const onboardingSurveySchema = z.object({
  responses: z.array(responseItemSchema),
});

export type OnboardingSurveyInput = z.infer<typeof onboardingSurveySchema>;
