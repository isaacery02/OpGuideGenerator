"use client";

import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/common/feature-card";
import { FileText, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from 'react';

interface DocumentDownloadSectionProps {
  isReadyToGenerate: boolean;
  templateName: string | null;
  resourceCount: number;
}

export function DocumentDownloadSection({ isReadyToGenerate, templateName, resourceCount }: DocumentDownloadSectionProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocName, setGeneratedDocName] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    // Create a dummy DOCX file blob for download simulation
    // In a real app, this would come from a server-side generation process
    const date = new Date().toISOString().split('T')[0];
    const docName = `Azure_OpGuide_${date}.docx`;
    setGeneratedDocName(docName);

    // Simple text content for the dummy DOCX
    const dummyContent = `Azure Operational Guide\nGenerated: ${new Date().toLocaleString()}\nTemplate: ${templateName || 'N/A'}\nResources: ${resourceCount}\n\nThis is a placeholder document.`;
    const blob = new Blob([dummyContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [templateName, resourceCount]);


  const handleGenerateDocument = () => {
    setIsGenerating(true);
    // Simulate document generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Document Generation Started",
        description: "The OpGuide is being prepared (simulated). You can download it once ready.",
      });
    }, 1500);
  };

  const handleDownload = () => {
    if (!downloadUrl || !generatedDocName) {
      toast({
        title: "Download Error",
        description: "The document is not available for download.",
        variant: "destructive",
      });
      return;
    }
    // This part is tricky with blobs directly; linking to public is easier.
    // For this simulation, we'll use the blob URL.
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = generatedDocName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: `Downloading "${generatedDocName}".`,
    });
  };

  return (
    <FeatureCard
      stepNumber={4}
      title="Generate & Download OpGuide"
      description="Combine all information into the final Word document."
    >
      <div className="space-y-4">
        {!isReadyToGenerate && (
          <div className="flex items-center text-amber-600 dark:text-amber-400 p-3 border border-amber-500/50 bg-amber-500/10 rounded-md">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
            <p className="text-sm">Please upload a template and fetch Azure resources first.</p>
          </div>
        )}
        <Button
          onClick={handleGenerateDocument}
          disabled={!isReadyToGenerate || isGenerating}
        >
          <FileText className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate OpGuide (Simulated)"}
        </Button>

        {generatedDocName && downloadUrl && (
          <Button
            onClick={handleDownload}
            variant="outline"
            disabled={!isReadyToGenerate}
          >
            <Download className="mr-2 h-4 w-4" />
            Download OpGuide ({generatedDocName})
          </Button>
        )}
      </div>
    </FeatureCard>
  );
}
