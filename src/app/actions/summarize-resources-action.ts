// @ts-nocheck : This is a workaround for a Genkit issue with Zod types.
// TODO: Remove @ts-nocheck when the issue is resolved.
"use server";

import { aiResourceSummarization, type AiResourceSummarizationInput } from '@/ai/flows/azure-resource-summarizer';
import type { AzureResource } from '@/lib/types';

export async function summarizeResourcesAction(resources: AzureResource[]): Promise<AzureResource[]> {
  const summarizedResources: AzureResource[] = [];

  for (const resource of resources) {
    try {
      // Mark resource as summarizing
      summarizedResources.push({ ...resource, isSummarizing: true, summary: undefined, summarizationError: null });
      
      const input: AiResourceSummarizationInput = {
        resourceType: resource.type,
        resourceName: resource.name,
        resourceConfiguration: resource.configuration,
        resourceUsage: resource.usage,
      };
      
      // Call the AI summarization flow
      const result = await aiResourceSummarization(input);
      
      // Update resource with summary
      summarizedResources[summarizedResources.length - 1] = { 
        ...summarizedResources[summarizedResources.length - 1], 
        summary: result.summary, 
        isSummarizing: false, 
        summarizationError: null 
      };
      
    } catch (error) {
      console.error(`Error summarizing resource ${resource.name}:`, error);
      // Update resource with error
       summarizedResources[summarizedResources.length - 1] = { 
        ...summarizedResources[summarizedResources.length - 1], 
        isSummarizing: false, 
        summary: undefined, 
        summarizationError: error instanceof Error ? error.message : "An unknown error occurred during summarization."
      };
    }
  }

  return summarizedResources;
}
