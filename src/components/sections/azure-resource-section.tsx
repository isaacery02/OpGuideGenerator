"use client";

import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/common/feature-card";
import { CloudCog, CheckCircle } from "lucide-react";
import type { AzureResource } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const MOCK_AZURE_RESOURCES: AzureResource[] = [
  { id: 'appsvc1', name: 'WebApp-Prod-Backend', type: 'App Service', resourceGroup: 'RG-Prod-Services', location: 'East US', configuration: '{"tier": "P2V2", "runtime": "Node.js 18 LTS", "httpsEnabled": true}', usage: '{"avgCpu": "75%", "avgMemory": "60%", "requests": 1200000}' },
  { id: 'appsvc2', name: 'WebApp-Dev-Frontend', type: 'App Service', resourceGroup: 'RG-Dev-Services', location: 'West Europe', configuration: '{"tier": "S1", "runtime": "React SPA", "customDomains": 1}', usage: '{"avgCpu": "30%", "avgMemory": "40%", "requests": 50000}' },
  { id: 'vnet1', name: 'VNet-Hub-EastUS', type: 'Virtual Network', resourceGroup: 'RG-Networking', location: 'East US', configuration: '{"addressSpace": "10.0.0.0/16", "subnets": 5, "peerings": 2}', usage: '{"connectedDevices": 25, "dataProcessed": "1.2TB"}' },
  { id: 'storage1', name: 'stgprodlogs', type: 'Storage Account', resourceGroup: 'RG-Prod-Storage', location: 'East US', configuration: '{"kind": "StorageV2", "tier": "Standard", "replication": "GRS"}', usage: '{"capacityUsed": "500GB", "transactions": 2500000}' },
  { id: 'fw1', name: 'AzureFirewall-Prod', type: 'Firewall', resourceGroup: 'RG-Security', location: 'East US', configuration: '{"sku": "Standard", "rulesCollections": 15, "threatIntelMode": "Alert"}', usage: '{"threatsBlocked": 1200, "processedData": "800GB"}' },
  { id: 'ag1', name: 'AppGateway-External', type: 'Application Gateway', resourceGroup: 'RG-Prod-Services', location: 'East US', configuration: '{"sku": "WAF_v2", "instanceCount": 2, "listeners": 3}', usage: '{"healthyHosts": "100%", "throughput": "500Mbps"}' },
  { id: 'nsg1', name: 'NSG-WebServers', type: 'Network Security Group', resourceGroup: 'RG-Security', location: 'East US', configuration: '{"inboundRules": 10, "outboundRules": 5, "associatedSubnets": 2}', usage: '{"rulesApplied": 15000, "deniedConnections": 300}' },
  { id: 'bkp1', name: 'BackupVault-Primary', type: 'Backup Vault', resourceGroup: 'RG-Backup', location: 'East US', configuration: '{"storageRedundancy": "GRS", "protectedItems": 15}', usage: '{"totalBackupStorage": "2TB", "successfulJobs": "99%"}' },
];

interface AzureResourceSectionProps {
  onResourcesFetched: (resources: AzureResource[]) => void;
  resourcesCount: number;
}

export function AzureResourceSection({ onResourcesFetched, resourcesCount }: AzureResourceSectionProps) {
  const { toast } = useToast();

  const handleFetchResources = () => {
    // Simulate API call
    setTimeout(() => {
      onResourcesFetched(MOCK_AZURE_RESOURCES.map(r => ({...r, isSummarizing: false, summary: undefined, summarizationError: null })));
      toast({
        title: "Azure Resources Fetched",
        description: `${MOCK_AZURE_RESOURCES.length} mock resources have been loaded.`,
      });
    }, 500);
  };

  return (
    <FeatureCard
      stepNumber={2}
      title="Gather Azure Resources"
      description="Connect to your Azure subscription to gather resource information (simulated)."
    >
      {resourcesCount > 0 ? (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <CheckCircle className="h-5 w-5 mr-2" />
          <p className="text-sm font-medium">{resourcesCount} resources loaded. Proceed to summarization.</p>
        </div>
      ) : (
        <Button onClick={handleFetchResources}>
          <CloudCog className="mr-2 h-4 w-4" /> Fetch Azure Resources (Mock)
        </Button>
      )}
    </FeatureCard>
  );
}
