import { z } from 'zod';
export const queueUpdateSchema=z.object({body:z.object({peopleWaiting:z.number().int().min(0),peopleBeingServed:z.number().int().min(0),averageServiceTime:z.number().int().min(1).max(240)}),params:z.object({locationId:z.string().min(1)}),query:z.object({})});
