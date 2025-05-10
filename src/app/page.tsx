"use client";

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { TemplateUploadSection } from '@/components/sections/template-upload-section';
import { AzureResourceSection } from '@/components/sections/azure-resource-section';
import { ResourceSummarySection } from '@/components/sections/resource-summary-section';
import { DocumentDownloadSection } from '@/components/sections/document-download-section';
import type { AzureResource } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

export default function AzureOpGuidePage() {
  const [uploadedTemplate, setUploadedTemplate] = useState<File | null>(null);
  const [azureResources, setAzureResources] = useState<AzureResource[]>([]);

  const handleTemplateUpload = (file: File) => {
    setUploadedTemplate(file);
  };

  const handleResourcesFetched = (resources: AzureResource[]) => {
    setAzureResources(resources);
  };

  const handleResourceUpdate = (updatedResource: AzureResource) => {
    setAzureResources(prevResources =>
      prevResources.map(r => (r.id === updatedResource.id ? updatedResource : r))
    );
  };

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
          <TemplateUploadSection 
            onTemplateUpload={handleTemplateUpload} 
            uploadedTemplateName={uploadedTemplate?.name || null}
          />
          
          <Separator />

          <AzureResourceSection 
            onResourcesFetched={handleResourcesFetched}
            resourcesCount={azureResources.length}
          />
          
          <Separator />

          <ResourceSummarySection
            resources={azureResources}
            onResourceUpdate={handleResourceUpdate}
          />

          <Separator />

          <DocumentDownloadSection 
            isReadyToGenerate={!!uploadedTemplate && azureResources.length > 0}
            templateName={uploadedTemplate?.name || null}
            resourceCount={azureResources.length}
          />
        </div>
      </PageWrapper>
    </MainLayout>
  );
}
