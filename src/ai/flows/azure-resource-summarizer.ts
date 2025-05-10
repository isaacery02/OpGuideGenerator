'use server';

/**
 * @fileOverview Summarizes the configuration and usage of each Azure resource.
 *
 * - aiResourceSummarization - A function that summarizes Azure resources.
 * - AiResourceSummarizationInput - The input type for the aiResourceSummarization function.
 * - AiResourceSummarizationOutput - The return type for the aiResourceSummarization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiResourceSummarizationInputSchema = z.object({
  resourceType: z.string().describe('The type of Azure resource, e.g., App Service, Virtual Network.'),
  resourceName: z.string().describe('The name of the Azure resource.'),
  resourceConfiguration: z.string().describe('The configuration details of the Azure resource as a string.'),
  resourceUsage: z.string().describe('Usage metrics and other relevant data for the Azure resource as a string.'),
});
export type AiResourceSummarizationInput = z.infer<typeof AiResourceSummarizationInputSchema>;

const AiResourceSummarizationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the Azure resource configuration and usage.'),
});
export type AiResourceSummarizationOutput = z.infer<typeof AiResourceSummarizationOutputSchema>;

export async function aiResourceSummarization(input: AiResourceSummarizationInput): Promise<AiResourceSummarizationOutput> {
  return aiResourceSummarizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiResourceSummarizationPrompt',
  input: {schema: AiResourceSummarizationInputSchema},
  output: {schema: AiResourceSummarizationOutputSchema},
  prompt: `You are an expert Azure cloud engineer.

You will generate a concise summary of an Azure resource based on its configuration and usage.

Resource Type: {{{resourceType}}}
Resource Name: {{{resourceName}}}
Configuration Details: {{{resourceConfiguration}}}
Usage Metrics: {{{resourceUsage}}}

Summary:`,
});

const aiResourceSummarizationFlow = ai.defineFlow(
  {
    name: 'aiResourceSummarizationFlow',
    inputSchema: AiResourceSummarizationInputSchema,
    outputSchema: AiResourceSummarizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
