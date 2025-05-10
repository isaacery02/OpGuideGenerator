# **App Name**: Azure OpGuide Generator

## Core Features:

- Template Upload: Allow users to upload a base Word template (.docx) for branding and layout.
- Azure Resource Gathering: Connect to Azure and gather data on resources like App Services, Virtual Networks, Backup Vaults, Storage Accounts, Firewalls, App Gateways and NSGs (requires appropriate Azure credentials). Gather PaaS services at the root level, firewall settings, app gateways, and NSGs.
- AI Resource Summarization: Use AI to generate concise summaries of each Azure resource based on its configuration, usage and other metadata using an AI "tool".
- Table Generation: Generate tables summarizing key details like names, resource groups and locations for each resource category.
- Document Generation & Download: Populate the Word template with the collected resource data, AI summaries, and generated tables to create the final Operational Guide document, then allow user to download the OpGuide document (.docx).

## Style Guidelines:

- Primary color: Azure Blue (#0078D4) to align with the Azure brand.
- Secondary color: Light gray (#F2F2F2) for background elements and contrast.
- Accent: Teal (#00A8C6) for interactive elements and highlights.
- Clear and professional fonts for readability (default browser fonts).
- Use standard Azure icons where appropriate.
- Clean and organized layout with clear section headings.