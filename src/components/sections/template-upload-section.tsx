"use client";

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FeatureCard } from "@/components/common/feature-card";
import { FileUp, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplateUploadSectionProps {
  onTemplateUpload: (file: File) => void;
  uploadedTemplateName: string | null;
}

export function TemplateUploadSection({ onTemplateUpload, uploadedTemplateName }: TemplateUploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.name.endsWith('.docx')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .docx file.",
          variant: "destructive",
        });
        setSelectedFile(null);
        event.target.value = ""; // Reset file input
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onTemplateUpload(selectedFile);
      toast({
        title: "Template Selected",
        description: `"${selectedFile.name}" has been selected as the base template.`,
      });
    } else {
      toast({
        title: "No File Selected",
        description: "Please select a .docx template file first.",
        variant: "destructive",
      });
    }
  };

  return (
    <FeatureCard
      stepNumber={1}
      title="Upload Word Template"
      description="Select your branded .docx template for the Operational Guide."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-file">Template File (.docx)</Label>
          <Input
            id="template-file"
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            className="file:text-sm file:font-medium file:text-primary file:bg-primary-foreground hover:file:bg-accent hover:file:text-accent-foreground"
          />
        </div>
        {selectedFile && !uploadedTemplateName && (
          <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
        )}
        {uploadedTemplateName && (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">Template ready: {uploadedTemplateName}</p>
          </div>
        )}
        <Button onClick={handleUpload} disabled={!selectedFile || !!uploadedTemplateName}>
          <FileUp className="mr-2 h-4 w-4" /> Use This Template
        </Button>
      </div>
    </FeatureCard>
  );
}
