"use client";
import React from "react";
import HeroSection from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { features } from "@/data/features";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import Image from "next/image";

const Page = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />

      <section
        id="features"
        className="w-full py-16 md:py-24 lg:py-32 bg-muted/50"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Powerful Features for Your Career Growth
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to advance your career in one platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              return (
                <Card
                  key={index}
                  className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300 group"
                >
                  <CardContent className="pt-6">
                    <div className="mb-4 text-primary group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-card shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.testimonial}"
                  </p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto rounded-lg text-center flex flex-col items-center justify-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Accelerate Your Career Today
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Join thousands of professionals who are already advancing their
              careers with AI-powered guidance
            </p>
            <Link href="/dashboard" passHref>
              <Button size="lg" className="h-12 px-8 text-lg mt-4 group">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
