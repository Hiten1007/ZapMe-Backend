import { z } from "zod";

export const userSignupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1).max(20),
  name: z.string().min(1),
  password: z.string().min(4, "Password must be at least 8 characters long"),
});

export type UserSignupInput = z.infer<typeof userSignupSchema>;