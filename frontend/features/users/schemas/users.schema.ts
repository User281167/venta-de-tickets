import { z } from "zod";

export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(150),
  phone: z.string().min(10).max(20).nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
