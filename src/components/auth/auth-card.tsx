import type { JSX } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: AuthCardProps): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="border-orange-200/80 bg-white/95 shadow-[0_22px_60px_rgba(249,115,22,0.12)]">
        <CardHeader className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-600">
            {eyebrow}
          </p>
          <div className="space-y-2">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
