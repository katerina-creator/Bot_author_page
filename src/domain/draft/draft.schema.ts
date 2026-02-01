import { z } from "zod";

const IsoDateString = z.string().datetime();

const DraftMetaSchema = z.object({
  draftId: z.string().uuid(),
  userId: z.string().min(1),
  lang: z.enum(["en", "ru"]),
  status: z.literal("draft"),
  createdAt: IsoDateString,
  updatedAt: IsoDateString,
});

const DraftContentSchema = z.object({
  about: z.record(z.any()),
  experience: z.array(z.any()),
  skills: z.array(z.any()),
  contacts: z.record(z.any()),
});

const DraftPresentationSchema = z.object({
  template: z.literal("minimal"),
  colorScheme: z.literal("light"),
  font: z.literal("default"),
});

export const DraftSchema = z.object({
  meta: DraftMetaSchema,
  content: DraftContentSchema,
  presentation: DraftPresentationSchema,
});

export type Draft = z.infer<typeof DraftSchema>;
