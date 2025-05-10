"use client";

import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/common/feature-card";
import { CloudCog, CheckCircle, Loader2 } from "lucide-react";
import type { AzureResource } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox component
import { Label } from "@/components/ui/label"; // Import Label component

// NOTE: The mock data below is replaced by actual fetching logic.
// const MOCK_AZURE_RESOURCES: AzureResource[] = [...];

// Updated interface to pass fetched resources and selected types to parent
interface AzureResourceSectionProps {
  onResourcesFetched: (resources: AzureResource[]) => void; // Pass raw resources
  onSelectedTypesChange: (selectedTypes: string[]) => void; // Pass selected types
  fetchedResourceCount: number; // Prop to show the count of fetched resources
  isSummarizing: boolean; // Prop to indicate if summarization is in progress (controlled by parent)
}

import { InteractiveBrowserCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";

async function fetchAzureResources(subscriptionId: string, clientId: string, addLog: (message: string) => void): Promise<AzureResource[]> {
  addLog(`Attempting to fetch resources for subscription: ${subscriptionId}`);

  try {
    addLog("Attempting to get Azure credentials...");
    const credential = new InteractiveBrowserCredential({ clientId });
    addLog("Credentials obtained. Creating Resource Management client...");
    const client = new ResourceManagementClient(credential, subscriptionId);
    addLog("Fetching resources...");
    const resources = [];
    for await (const item of client.resources.listBySubscription()) {
      // Filter out types that are likely not useful for summarization or cause issues
       if (item.type && !item.type.startsWith("microsoft.insights/") && !item.type.startsWith("microsoft.aadiam/")){
          addLog(`Fetched resource: ${item.name} (${item.type})`);
          resources.push({
            id: item.id || '',
            name: item.name || '',
            type: item.type || '',
            resourceGroup: item.resourceGroup || '',
            location: item.location || '',
            configuration: JSON.stringify(item.properties || {}), // Example: Stringify properties
            usage: '', // You might need to fetch usage data separately or omit
            isSummarizing: false,
            summary: undefined,
            summarizationError: null,
          });
       }
    }
    addLog(`Successfully fetched ${resources.length} resources.`);
    return resources;
  } catch (error) {
    addLog(`Error fetching resources: ${error instanceof Error ? error.message : String(error)}`);
    console.error("Detailed fetch error:", error);
    throw error; // Re-throw the error to be caught by handleFetchResources
  }
}

const MAX_LOG_LINES = 10; // Limit the number of log lines displayed

export function AzureResourceSection({
  onResourcesFetched,
  onSelectedTypesChange,
  fetchedResourceCount,
  isSummarizing,
}: AzureResourceSectionProps) {
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [availableResourceTypes, setAvailableResourceTypes] = useState<string[]>([]);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState<Set<string>>(new Set());

  const addLog = (message: string) => {
    setLogs(prevLogs => {
      const newLogs = [...prevLogs, message];
      return newLogs.slice(-MAX_LOG_LINES);
    });
  };

  const handleFetchResources = async () => {
    addLog("Fetch resources button clicked.");
    setIsFetching(true);
    setAvailableResourceTypes([]); // Clear previous types
    setSelectedResourceTypes(new Set()); // Clear previous selections

    const subscriptionId = process.env.NEXT_PUBLIC_AZURE_SUBSCRIPTION_ID;
    const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;

    if (!subscriptionId) {
      const errorMessage = "Azure Subscription ID is not set. Please add NEXT_PUBLIC_AZURE_SUBSCRIPTION_ID to your .env.local file.";
      addLog(`Error: ${errorMessage}`);
      toast({
        title: "Configuration Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsFetching(false);
      return;
    }

    if (!clientId) {
      const errorMessage = "Azure Client ID is not set. Please add NEXT_PUBLIC_AZURE_CLIENT_ID to your .env.local file.";
      addLog(`Error: ${errorMessage}`);
      toast({
        title: "Configuration Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsFetching(false);
      return;
    }

    try {
      const resources = await fetchAzureResources(subscriptionId, clientId, addLog);
      onResourcesFetched(resources); // Pass fetched resources to parent

      // Extract unique resource types
      const uniqueTypes = Array.from(new Set(resources.map(r => r.type))).sort();
      setAvailableResourceTypes(uniqueTypes);

      const successMessage = `Successfully fetched ${resources.length} resources of ${uniqueTypes.length} types. Select types to summarize.`;
      addLog(successMessage);
      toast({
        title: "Azure Resources Fetched",
        description: successMessage,
      });

    } catch (error) {
      const errorMessage = `Failed to fetch Azure resources: ${error instanceof Error ? error.message : String(error)}`;
      addLog(`Error: ${errorMessage}`);
      console.error("Error fetching Azure resources:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      addLog("Fetching finished.");
      setIsFetching(false);
    }
  };

  const handleTypeSelect = (type: string, isChecked: boolean) => {
    setSelectedResourceTypes(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isChecked) {
        newSelected.add(type);
      } else {
        newSelected.delete(type);
      }
      onSelectedTypesChange(Array.from(newSelected)); // Notify parent of changes
      return newSelected;
    });
  };

  return (
    <FeatureCard
      stepNumber={2}
      title="Gather and Select Azure Resources for Summarization"
      description="Connect to your Azure subscription to gather resource information, then select which types to summarize."
    >
      <div className="space-y-4">
        {fetchedResourceCount === 0 ? (
          // Initial state: Show Fetch button
          <Button onClick={handleFetchResources} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CloudCog className="mr-2 h-4 w-4" />
            )}
            {isFetching ? "Fetching Resources..." : "Fetch Azure Resources"}
          </Button>
        ) : (
          // Resources fetched: Show count and type selection
          <div className="flex flex-col space-y-4">
             <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p className="text-sm font-medium">{fetchedResourceCount} resources fetched across {availableResourceTypes.length} types.</p>
            </div>

            <p className="text-sm font-semibold">Select resource types to summarize:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {availableResourceTypes.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={selectedResourceTypes.has(type)}
                    onCheckedChange={(checked) => handleTypeSelect(type, !!checked)}
                    disabled={isSummarizing}
                  />
                  <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                    {type.replace("Microsoft.", "").replace("/", " ")}
                  </Label>
                </div>
              ))}
            </div>
             {/* The Summarize button will be in the parent component */}
          </div>
        )}
      </div>

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
