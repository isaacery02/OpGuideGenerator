"use client";

import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/common/feature-card";
import { CloudCog, CheckCircle, Loader2 } from "lucide-react";
import type { AzureResource } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
// Import the new action for summarizing resource types
import { summarizeResourceTypesAction } from '@/app/actions/summarize-resource-types-action';

// NOTE: The mock data below is replaced by actual fetching logic.
// const MOCK_AZURE_RESOURCES: AzureResource[] = [...];

// Update the interface to reflect the new return type for grouped summaries
interface AzureResourceSectionProps {
  onResourcesFetched: (summaries: Record<string, { summary?: string, error?: string, count: number }>) => void;
  resourcesCount: number; // This might still be useful to show total resources fetched
}

import { InteractiveBrowserCredential } from "@azure/identity"; // Use InteractiveBrowserCredential for browser environments
import { ResourceManagementClient } from "@azure/arm-resources";

async function fetchAzureResources(subscriptionId: string, addLog: (message: string) => void): Promise<AzureResource[]> {
  addLog(`Attempting to fetch resources for subscription: ${subscriptionId}`);

  try {
    addLog("Attempting to get Azure credentials...");
    // Use InteractiveBrowserCredential for authentication in the browser
    const credential = new InteractiveBrowserCredential();
    addLog("Credentials obtained. Creating Resource Management client...");
    const client = new ResourceManagementClient(credential, subscriptionId);
    addLog("Fetching resources...");
    const resources = [];
    // Use a Set to keep track of unique resource types fetched
    const uniqueResourceTypes = new Set<string>();
    for await (const item of client.resources.listBySubscription()) {
      addLog(`Fetched resource: ${item.name} (${item.type})`);
      uniqueResourceTypes.add(item.type || 'unknown');
      // Map the Azure resource object to your AzureResource type
      resources.push({
        id: item.id || '',
        name: item.name || '',
        type: item.type || '',
        resourceGroup: item.resourceGroup || '',
        location: item.location || '',
        configuration: JSON.stringify(item.properties || {}), // Example: Stringify properties
        usage: '', // You might need to fetch usage data separately or omit
        isSummarizing: false, // This field is less relevant for type-based summaries
        summary: undefined, // Summary will be stored per type, not per resource
        summarizationError: null, // Error will be stored per type
      });
    }
    addLog(`Successfully fetched ${resources.length} resources of ${uniqueResourceTypes.size} types.`);
    return resources;
  } catch (error) {
    addLog(`Error fetching resources: ${error instanceof Error ? error.message : String(error)}`);
    console.error("Detailed fetch error:", error);
    throw error; // Re-throw the error to be caught by handleFetchResources
  }
}

const MAX_LOG_LINES = 10; // Limit the number of log lines displayed

export function AzureResourceSection({ onResourcesFetched, resourcesCount }: AzureResourceSectionProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  // State to hold the fetched resources before grouping/summarization
  const [fetchedResources, setFetchedResources] = useState<AzureResource[]>([]);

  const addLog = (message: string) => {
    setLogs(prevLogs => {
      const newLogs = [...prevLogs, message];
      // Keep only the most recent logs
      return newLogs.slice(-MAX_LOG_LINES);
    });
  };

  const handleFetchAndSummarizeResources = async () => {
    addLog("Fetch and Summarize button clicked.");
    setIsLoading(true);
    const subscriptionId = process.env.NEXT_PUBLIC_AZURE_SUBSCRIPTION_ID; // Use NEXT_PUBLIC prefix for client-side access in Next.js

    if (!subscriptionId) {
      const errorMessage = "Azure Subscription ID is not set. Please add NEXT_PUBLIC_AZURE_SUBSCRIPTION_ID to your .env.local file.";
      addLog(`Error: ${errorMessage}`);
      toast({
        title: "Configuration Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Fetch resources
      const resources = await fetchAzureResources(subscriptionId, addLog);
      setFetchedResources(resources);
      addLog(`Fetched ${resources.length} resources. Initiating type-based summarization...`);

      // Step 2: Summarize resources by type using the new action
      const groupedSummaries = await summarizeResourceTypesAction(resources);

      // Step 3: Pass the grouped summaries to the parent component
      onResourcesFetched(groupedSummaries);

      const successMessage = `Summarization initiated for ${Object.keys(groupedSummaries).length} resource types.`;
      addLog(successMessage);
      toast({
        title: "Azure Resources Processed",
        description: successMessage,
      });
    } catch (error) {
      const errorMessage = `Failed to fetch or summarize Azure resources: ${error instanceof Error ? error.message : String(error)}`;
      addLog(`Error: ${errorMessage}`);
      console.error("Error processing Azure resources:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      addLog("Processing finished.");
      setIsLoading(false);
    }
  };

  return (
    <FeatureCard
      stepNumber={2}
      title="Gather and Summarize Azure Resources by Type"
      description="Connect to your Azure subscription to gather resource information and generate AI summaries grouped by resource type."
    >
      {/* Display message based on fetched resources or summaries */}
      {fetchedResources.length > 0 ? (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <CheckCircle className="h-5 w-5 mr-2" />
          <p className="text-sm font-medium">{fetchedResources.length} resources fetched. Summarization by type initiated.</p>
        </div>
      ) : (
        <Button onClick={handleFetchAndSummarizeResources} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CloudCog className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Processing Resources..." : "Gather & Summarize Azure Resources"}
        </Button>
      )}

      {/* Log Display Area */}
      {logs.length > 0 && (
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-32">
          <p className="font-semibold mb-1">Recent Activity:</p>
          {logs.map((log, index) => (
            <p key={index} className="whitespace-pre-wrap">{log}</p>
          ))}
        </div>
      )}
    </FeatureCard>
  );
}
