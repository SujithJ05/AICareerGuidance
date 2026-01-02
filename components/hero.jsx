import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="w-full pt-32 md:pt-40 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="space-y-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI-Powered Career Development
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              Your AI Career Coach for
              <br />
              Professional Success
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Unlock your potential with expert guidance, interview prep,
              skill-building resources, and AI-driven tools designed to
              accelerate your career growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="px-8 text-lg h-12 group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8 text-lg h-12">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
