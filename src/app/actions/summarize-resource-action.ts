// @ts-nocheck : This is a workaround for a Genkit issue with Zod types.
// TODO: Remove @ts-nocheck when the issue is resolved.
"use server";

import { aiResourceSummarization, type AiResourceSummarizationInput } from '@/ai/flows/azure-resource-summarizer';
import type { AzureResource } from '@/lib/types';

export async function summarizeResourceAction(resource: AzureResource): Promise<{ summary?: string, error?: string }> {
  try {
    const input: AiResourceSummarizationInput = {
      resourceType: resource.type,
      resourceName: resource.name,
      resourceConfiguration: resource.configuration,
      resourceUsage: resource.usage,
    };
    const result = await aiResourceSummarization(input);
    return { summary: result.summary };
  } catch (error) {
    console.error("Error summarizing resource:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred during summarization." };
  }
}
