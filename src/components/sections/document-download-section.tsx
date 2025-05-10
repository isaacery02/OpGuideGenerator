
"use client";

import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/common/feature-card";
import { FileText, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';

interface DocumentDownloadSectionProps {
  isReadyToGenerate: boolean;
  groupedSummaries: Record<string, { summary?: string, error?: string, count: number }> | null;
}

export function DocumentDownloadSection({ isReadyToGenerate, groupedSummaries }: DocumentDownloadSectionProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocBlob, setGeneratedDocBlob] = useState<Blob | null>(null);
  const [generatedDocFileName, setGeneratedDocFileName] = useState<string | null>(null);

  const canGenerate = isReadyToGenerate && !!groupedSummaries && Object.keys(groupedSummaries).length > 0;

  const handleGenerateDocument = async () => {
    if (!groupedSummaries) return;

    setIsGenerating(true);
    setGeneratedDocBlob(null);
    setGeneratedDocFileName(null);

    const date = new Date().toISOString().split('T')[0];
    const defaultFileName = `Azure_OpGuide_${date}.docx`;

    // ** TODO: Implement server-side document generation API call **
    /*
    try {
      const formData = new FormData();
      formData.append('summaries', JSON.stringify(groupedSummaries));
      const response = await fetch('/api/generate-opguide', { 
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const docBlob = await response.blob();
      let filename = defaultFileName;
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) filename = filenameMatch[1];
      }
      setGeneratedDocBlob(docBlob);
      setGeneratedDocFileName(filename);
      toast({ title: "Document Generated", description: "The OpGuide has been successfully generated." });
    } catch (error) {
      console.error("Document generation failed:", error);
      toast({
        title: "Generation Error",
        description: `Failed to generate document: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
    */

    // --- SIMULATION CODE --- 
    console.log("Simulating document generation...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    let dummyContent = `Azure Operational Guide
Generated: ${new Date().toLocaleString()}

`;
    if (groupedSummaries) {
      dummyContent += "Azure Resource Summaries by Type:\n\n";
      for (const type in groupedSummaries) {
        const summaryInfo = groupedSummaries[type];
        dummyContent += `--- ${type} (${summaryInfo.count}) ---\n`;
        if (summaryInfo.summary) {
          dummyContent += `${summaryInfo.summary}\n`;
        }
        else if (summaryInfo.error) {
          dummyContent += `Error summarizing: ${summaryInfo.error}\n`;
        }
        dummyContent += '\n\n'; // Add two newlines after each resource type summary
      }
    }

    const blob = new Blob([dummyContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    setGeneratedDocBlob(blob);
    setGeneratedDocFileName(defaultFileName);

    toast({
      title: "Document Generated",
      description: "The OpGuide has been successfully generated (simulated).",
    });
    setIsGenerating(false);
    // --- END OF SIMULATION CODE ---
  };

  const handleDownload = () => {
    if (!generatedDocBlob || !generatedDocFileName) {
      toast({
        title: "Download Error",
        description: "The document is not available for download.",
        variant: "destructive",
      });
      return;
    }

    const downloadUrl = URL.createObjectURL(generatedDocBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = generatedDocFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);

    toast({
      title: "Download Started",
      description: `Downloading "${generatedDocFileName}".`,
    });
  };

  return (
    <FeatureCard
      stepNumber={3}
      title="Generate & Download OpGuide"
      description="Generate the operational guide based on the summarized resources."
    >
      <div className="space-y-4">
        {!canGenerate && (
          <div className="flex items-center text-amber-600 dark:text-amber-400 p-3 border border-amber-500/50 bg-amber-500/10 rounded-md">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
            <p className="text-sm">Please fetch and summarize Azure resources first.</p>
          </div>
        )}
        <Button
          onClick={handleGenerateDocument}
          disabled={!canGenerate || isGenerating}
        >
          <FileText className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate OpGuide"}
        </Button>

        {generatedDocBlob && generatedDocFileName && (
          <Button
            onClick={handleDownload}
            variant="outline"
            disabled={isGenerating}
          >
            <Download className="mr-2 h-4 w-4" />
            Download OpGuide ({generatedDocFileName})
          </Button>
        )}
      </div>
    </FeatureCard>
  );
}
