import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ size = "default", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" className="text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function FullPageLoader({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" className="text-primary" />
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}

export function CardLoadingSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

export function TableLoadingSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-10 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}
