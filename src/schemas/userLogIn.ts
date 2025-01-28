import { z } from "zod";

// Allow either email or username, but require one of them
export const userLogInSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(20).optional(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
}).refine((data) => data.email || data.username, {
  message: "Either email or username must be provided",
});

export type UserLogInInput = z.infer<typeof userLogInSchema>;