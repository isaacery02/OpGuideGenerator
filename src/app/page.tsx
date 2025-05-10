"use client";

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { PageWrapper } from '@/components/layout/page-wrapper';
// Removed import of TemplateUploadSection
import { AzureResourceSection } from '@/components/sections/azure-resource-section';
// Commented out import of ResourceSummarySection as it might be removed or refactored
// import { ResourceSummarySection } from '@/components/sections/resource-summary-section';
import { DocumentDownloadSection } from '@/components/sections/document-download-section';
import type { AzureResource } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button'; // Import Button
import { processSelectedResourcesAction } from '@/app/actions/process-selected-resources-action'; // Import the new action
import { Loader2 } from 'lucide-react'; // Import Loader2
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function AzureOpGuidePage() {
  const { toast } = useToast();
  // Removed state for uploadedTemplate
  const [fetchedResources, setFetchedResources] = useState<AzureResource[]>([]);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState<string[]>([]);
  const [groupedSummaries, setGroupedSummaries] = useState<Record<string, { summary?: string, error?: string, count: number }> | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Removed handleTemplateUpload function

  const handleResourcesFetched = (resources: AzureResource[]) => {
    setFetchedResources(resources);
    // Clear previous summaries and selections when new resources are fetched
    setGroupedSummaries(null);
    setSelectedResourceTypes([]);
  };

  const handleSelectedTypesChange = (selectedTypes: string[]) => {
    setSelectedResourceTypes(selectedTypes);
     // Clear summaries when selection changes, as they are no longer valid
    setGroupedSummaries(null);
  };

  const handleSummarizeSelected = async () => {
    if (selectedResourceTypes.length === 0 || fetchedResources.length === 0) {
      toast({
        title: "No Resources Selected",
        description: "Please fetch resources and select at least one resource type to summarize.",
        variant: "destructive",
      });
      return;
    }

    setIsSummarizing(true);
    setGroupedSummaries(null); // Clear previous summaries

    try {
      const summaries = await processSelectedResourcesAction(fetchedResources, selectedResourceTypes);
      setGroupedSummaries(summaries);
       toast({
         title: "Summarization Complete",
         description: `Summaries generated for ${Object.keys(summaries).length} selected resource types.`,
       });
    } catch (error) {
       console.error("Error summarizing selected resources:", error);
        toast({
          title: "Summarization Error",
          description: `Failed to summarize resources: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        });
    } finally {
      setIsSummarizing(false);
    }
  };

  // ResourceSummarySection might need significant rework or removal if we only display grouped summaries
  // This handleResourceUpdate is likely not needed in the new flow focusing on grouped summaries.
  // Keeping it commented out for now.
  /*
  const handleResourceUpdate = (updatedResource: AzureResource) => {
    setAzureResources(prevResources =>
      prevResources.map(r => (r.id === updatedResource.id ? updatedResource : r))
    );
  };
  */

  // isReadyToGenerateDocument now depends on having grouped summaries
  const isReadyToGenerateDocument = !!groupedSummaries && Object.keys(groupedSummaries).length > 0;


  return (
    <MainLayout>
      <PageWrapper>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Create Your Azure Operational Guide
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Follow the steps below to automatically generate a comprehensive operational guide for your Azure environment.
          </p>
        </div>

        <div className="space-y-10">

          <AzureResourceSection
            onResourcesFetched={handleResourcesFetched}
            onSelectedTypesChange={handleSelectedTypesChange}
            fetchedResourceCount={fetchedResources.length}
            isSummarizing={isSummarizing}
          />

          {fetchedResources.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={handleSummarizeSelected}
                disabled={selectedResourceTypes.length === 0 || isSummarizing}
              >
                 {isSummarizing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSummarizing ? "Summarizing Selected Types..." : "Summarize Selected Types"}
              </Button>
            </div>
          )}

          <Separator />

           {/* Conditional rendering for ResourceSummarySection or a display for grouped summaries */}
           {groupedSummaries ? (
              // Display Grouped Summaries here or in a new component
              <div className="space-y-4">
                 <h3 className="text-xl font-semibold">Summarization Results</h3>
                 {Object.keys(groupedSummaries).length > 0 ? (
                   Object.entries(groupedSummaries).map(([type, summaryInfo]) => (
                     <div key={type} className="border rounded-md p-4">
                        <h4 className="font-semibold">{type} ({summaryInfo.count})</h4>
                        {summaryInfo.summary ? (
                          <p className="text-muted-foreground whitespace-pre-wrap mt-2">{summaryInfo.summary}</p>
                        ) : (summaryInfo.error ? (
                           <p className="text-red-500 dark:text-red-400 mt-2">Error: {summaryInfo.error}</p>
                        ) : (
                           <p className="text-muted-foreground mt-2">No summary available.</p>
                        ))}
                     </div>
                   ))
                 ) : (
                   <p>No resource types were selected for summarization or no summaries were generated.</p>
                 )}
              </div>
           ) : fetchedResources.length > 0 ? (
              // Prompt user to select types after fetching
              <div className="p-4 border rounded-md bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200">
                 <p className="font-semibold">Select Resource Types:</p>
                 <p>Please select the resource types you wish to summarize from the list above and click "Summarize Selected Types".</p>
              </div>
           ) : null // Nothing to show before fetching
           }

          <Separator />

          <DocumentDownloadSection
            isReadyToGenerate={isReadyToGenerateDocument}
            groupedSummaries={groupedSummaries}
             templateFile={null} // No template file upload anymore
          />
        </div>
      </PageWrapper>
    </MainLayout>
  );
}
