import { Cloud } from 'lucide-react'; // Using Cloud as a generic Azure representation

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <Cloud className="h-8 w-8 mr-3" />
        <h1 className="text-2xl font-semibold tracking-tight">Azure OpGuide Generator</h1>
      </div>
    </header>
  );
}
