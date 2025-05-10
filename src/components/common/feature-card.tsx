import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  stepNumber?: number;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FeatureCard({ stepNumber, title, description, children, className }: FeatureCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {stepNumber && <span className="text-primary mr-2">{stepNumber}.</span>}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
