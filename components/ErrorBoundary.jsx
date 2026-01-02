"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-2xl font-bold">Something went wrong</h2>
                <p className="text-muted-foreground">
                  {this.state.error?.message || "An unexpected error occurred"}
                </p>
                <Button
                  onClick={() =>
                    this.setState({ hasError: false, error: null })
                  }
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorDisplay({
  title = "Error",
  message,
  onRetry,
  showRetry = true,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4 p-6">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
