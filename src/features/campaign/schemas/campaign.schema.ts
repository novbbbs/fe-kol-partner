import { z } from 'zod';

export const campaignSchema = z.object({
  campaign_name: z.string().min(3, 'Nama campaign minimal 3 karakter'),
  status: z.union([z.string(), z.number()]).default(1),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;