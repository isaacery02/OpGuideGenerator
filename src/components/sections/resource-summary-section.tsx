"use client";

import type { AzureResource } from "@/lib/types";
import { FeatureCard } from "@/components/common/feature-card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BrainCircuit, AlertTriangle, Info } from "lucide-react";
import { summarizeResourceAction } from "@/app/actions/summarize-resource-action";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResourceSummarySectionProps {
  resources: AzureResource[];
  onResourceUpdate: (updatedResource: AzureResource) => void;
}

export function ResourceSummarySection({ resources, onResourceUpdate }: ResourceSummarySectionProps) {
  const { toast } = useToast();

  const handleSummarize = async (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    onResourceUpdate({ ...resource, isSummarizing: true, summarizationError: null });

    const result = await summarizeResourceAction(resource);

    if (result.summary) {
      onResourceUpdate({ ...resource, summary: result.summary, isSummarizing: false });
      toast({
        title: "Summarization Successful",
        description: `Summary generated for ${resource.name}.`,
      });
    } else {
      onResourceUpdate({ ...resource, isSummarizing: false, summarizationError: result.error || "Failed to summarize." });
      toast({
        title: "Summarization Failed",
        description: result.error || `Could not generate summary for ${resource.name}.`,
        variant: "destructive",
      });
    }
  };
  
  if (resources.length === 0) {
    return (
       <FeatureCard
        stepNumber={3}
        title="Review & Summarize Resources"
        description="AI-powered summarization of your Azure resources."
      >
        <div className="flex items-center text-muted-foreground p-4 border border-dashed rounded-md">
            <Info className="h-5 w-5 mr-2 shrink-0" />
            <p className="text-sm">Please fetch Azure resources first to enable summarization.</p>
        </div>
      </FeatureCard>
    );
  }

  return (
    <FeatureCard
      stepNumber={3}
      title="Review & Summarize Resources"
      description="AI-powered summarization of your Azure resources. Click 'Summarize with AI' for each resource."
    >
      <ScrollArea className="h-[500px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Resource Group</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <Accordion type="single" collapsible className="w-full" key={resource.id}>
                <AccordionItem value={resource.id} className="border-b-0">
                   <TableRow>
                    <TableCell>{resource.name}</TableCell>
                    <TableCell><Badge variant="secondary">{resource.type}</Badge></TableCell>
                    <TableCell>{resource.resourceGroup}</TableCell>
                    <TableCell>{resource.location}</TableCell>
                    <TableCell className="text-right">
                       <AccordionTrigger className="py-2 px-3 hover:no-underline [&[data-state=open]>svg]:text-accent data-[state=open]:text-accent">
                         {resource.summary ? "View Summary" : "Details"}
                       </AccordionTrigger>
                    </TableCell>
                  </TableRow>
                  <AccordionContent asChild>
                    <tr>
                      <TableCell colSpan={5} className="p-0">
                        <div className="bg-muted/50 p-4 space-y-3">
                          <div>
                            <h4 className="font-medium text-sm mb-1">Configuration:</h4>
                            <p className="text-xs text-muted-foreground bg-background p-2 rounded-md whitespace-pre-wrap">{resource.configuration}</p>
                          </div>
                           <div>
                            <h4 className="font-medium text-sm mb-1">Usage:</h4>
                            <p className="text-xs text-muted-foreground bg-background p-2 rounded-md whitespace-pre-wrap">{resource.usage}</p>
                          </div>

                          {resource.summary && (
                            <div>
                              <h4 className="font-medium text-sm mb-1">AI Summary:</h4>
                              <p className="text-sm bg-accent/10 text-accent-foreground p-3 rounded-md border border-accent/30">{resource.summary}</p>
                            </div>
                          )}
                          {resource.summarizationError && (
                             <div className="flex items-start text-destructive p-2 bg-destructive/10 border border-destructive/30 rounded-md">
                                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                                <p className="text-xs ">{resource.summarizationError}</p>
                             </div>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleSummarize(resource.id)}
                            disabled={resource.isSummarizing}
                            variant={resource.summary ? "outline" : "default"}
                            className="mt-2"
                          >
                            {resource.isSummarizing ? (
                              <LoadingSpinner size={16} className="mr-2" />
                            ) : (
                              <BrainCircuit className="mr-2 h-4 w-4" />
                            )}
                            {resource.isSummarizing ? "Summarizing..." : (resource.summary ? "Re-Summarize" : "Summarize with AI")}
                          </Button>
                        </div>
                      </TableCell>
                    </tr>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </TableBody>
        </Table>
         {resources.length === 0 && (
          <TableCaption>No Azure resources loaded yet. Fetch resources in Step 2.</TableCaption>
        )}
      </ScrollArea>
    </FeatureCard>
  );
}
