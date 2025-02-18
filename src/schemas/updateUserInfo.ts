import { z } from "zod";

export const updateUserInfoSchema = z.object({

  username: z.string().min(1).max(20),
  name: z.string().min(1),
  attributes : z.array(z.string().min(1)).length(3)
});

export type updateUserInfoSchema = z.infer<typeof updateUserInfoSchema>;