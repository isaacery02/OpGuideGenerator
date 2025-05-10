export interface AzureResource {
  id: string;
  name: string;
  type: string;
  resourceGroup: string;
  location: string;
  configuration: string; // JSON string or descriptive text
  usage: string; // JSON string or descriptive text
  summary?: string;
  isSummarizing?: boolean;
  summarizationError?: string | null;
}

// Add other types as needed
