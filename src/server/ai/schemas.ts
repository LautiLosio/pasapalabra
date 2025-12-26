import { z } from 'zod';

export const QuestionSchema = z.object({
  letter: z.string(),
  answer: z.string(),
  description: z.string(),
  condition: z.string(),
});

export const RoscoSchema = z.array(QuestionSchema).length(27);

export const GenerateRoscosResponseSchema = z.object({
  roscos: z.array(RoscoSchema).min(2).max(10),
});

export type GenerateRoscosResponse = z.infer<typeof GenerateRoscosResponseSchema>;

