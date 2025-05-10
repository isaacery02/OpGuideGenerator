// @ts-nocheck : This is a workaround for a Genkit issue with Zod types.
// TODO: Remove @ts-nocheck when the issue is resolved.
"use server";

import { aiResourceSummarization, type AiResourceSummarizationInput } from '@/ai/flows/azure-resource-summarizer';
import type { AzureResource } from '@/lib/types';

export async function summarizeResourceTypesAction(resources: AzureResource[]): Promise<Record<string, { summary?: string, error?: string, count: number }>> {
  const groupedResources: Record<string, AzureResource[]> = {};

  // Group resources by type
  for (const resource of resources) {
    if (!groupedResources[resource.type]) {
      groupedResources[resource.type] = [];
    }
    groupedResources[resource.type].push(resource);
  }

  const groupedSummaries: Record<string, { summary?: string, error?: string, count: number }> = {};

  // Summarize each group
  for (const resourceType in groupedResources) {
    const resourcesOfType = groupedResources[resourceType];
    const count = resourcesOfType.length;

    if (count === 0) continue;

    // Prepare combined input for the AI
    let combinedConfiguration = `Summarize the following Azure resources of type ${resourceType}:

`;
    for (const resource of resourcesOfType) {
      combinedConfiguration += `Resource Name: ${resource.name}
`;
      combinedConfiguration += `Resource ID: ${resource.id}
`;
      combinedConfiguration += `Location: ${resource.location}
`;
      combinedConfiguration += `Resource Group: ${resource.resourceGroup}
`;
      combinedConfiguration += `Configuration: ${resource.configuration}
`;
       if (resource.usage) {
         combinedConfiguration += `Usage: ${resource.usage}
`;
       }
      combinedConfiguration += `---
`; // Separator for readability in AI input
    }

    try {
      console.log(`Attempting to summarize resources of type: ${resourceType} (${count} resources)`);
      
      // Call the existing AI summarization flow with combined input
      const input: AiResourceSummarizationInput = {
        resourceType: `Batch Summary for ${resourceType}`, // Indicate it's a batch
        resourceName: `${resourceType} Summary`, 
        resourceConfiguration: combinedConfiguration,
        resourceUsage: '', // Usage per type is not directly available, can be left empty or aggregated if possible
      };
      
      const result = await aiResourceSummarization(input);
      
      groupedSummaries[resourceType] = { 
        summary: result.summary, 
        count: count
      };
      console.log(`Successfully summarized type: ${resourceType}`);

    } catch (error) {
      console.error(`Error summarizing resources of type ${resourceType}:`, error);
      groupedSummaries[resourceType] = { 
        error: error instanceof Error ? error.message : "An unknown error occurred during summarization.",
        count: count
      };
    }
  }

  return groupedSummaries;
}
