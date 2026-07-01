import { z } from "zod";

// Schema for a single response item
const responseItemSchema = z.object({
  question_id: z.string().min(1),
  answer: z.union([z.string(), z.array(z.string())]),
});

// Schema for the onboarding survey submission
export const onboardingSurveySchema = z.object({
  responses: z.array(responseItemSchema),
});

export type OnboardingSurveyInput = z.infer<typeof onboardingSurveySchema>;

// Response schema for the API
export type SubmitOnboardingSurveyResponse = {
  status: string;
  survey_type: string;
  response_count: number;
};
