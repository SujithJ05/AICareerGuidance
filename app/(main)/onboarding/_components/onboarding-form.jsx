"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/app/lib/schema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { updateUser } from "@/actions/user";

const OnboardingForm = ({ industries }) => {


  const router = useRouter();

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
  } = useFetch(updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  const selectedIndustryIds = watch("industry") || [];
  const availableSubIndustries = Array.from(new Set(
    selectedIndustryIds.flatMap(id => {
      const industry = industries.find(i => i.id === id);
      return industry ? industry.subIndustries : [];
    })
  ));



  const onSubmit = async (values) => {
    console.log(values);
    try {
      await updateUserFn({
        ...values,
      });
    } catch (error) {
      console.log("onboarding error", error);
    }
  };

  useEffect(() => {
    if (updateResult?.success && !updateLoading) {
      toast.success("Profile completed successfully!");
      router.push("/dashboard");
      router.refresh();
    }
  }, [updateResult, updateLoading]);

  return (
    <div className="flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardHeader>
          <CardTitle className=" text-4xl">Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className=" space-y-2 p-2 ">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                {...register("name")}
              />

              {errors.name && (
                <p className="text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2 p-2">
              <Label htmlFor="industry">Industry</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    <div className="flex flex-wrap gap-1">
                      {watch("industry")?.length > 0 ? (
                        watch("industry").map((indId) => {
                          const ind = industries.find((i) => i.id === indId);
                          return ind ? (
                            <Badge key={ind.id} variant="secondary">
                              {ind.name}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newIndustries = watch("industry").filter(
                                    (id) => id !== ind.id
                                  );
                                  setValue("industry", newIndustries);
                                  setValue("subIndustry", []); // Clear subIndustries if main industry is removed
                                }}
                              />
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        "Select industry(s)"
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Search industry..." />
                    <CommandEmpty>No industry found.</CommandEmpty>
                    <CommandGroup>
                      {industries.map((industry) => (
                        <CommandItem
                          key={industry.id}
                          onSelect={() => {
                            const currentSelection = watch("industry") || [];
                            const newSelection = currentSelection.includes(industry.id)
                              ? currentSelection.filter((id) => id !== industry.id)
                              : [...currentSelection, industry.id];
                            setValue("industry", newSelection);
                            setValue("subIndustry", []); // Clear subIndustries on industry change
                          }}
                        >
                          <Checkbox
                            checked={watch("industry")?.includes(industry.id)}
                            onCheckedChange={(checked) => {
                              const currentSelection = watch("industry") || [];
                              const newSelection = checked
                                ? [...currentSelection, industry.id]
                                : currentSelection.filter((id) => id !== industry.id);
                              setValue("industry", newSelection);
                              setValue("subIndustry", []); // Clear subIndustries on industry change
                            }}
                            className="mr-2"
                          />
                          {industry.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.industry && (
                <p className="text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {watch("industry")?.length > 0 && (
              <div className="space-y-2 p-2">
                <Label htmlFor="subIndustry">Specialization</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={availableSubIndustries.length === 0}
                    >
                      <div className="flex flex-wrap gap-1">
                        {watch("subIndustry")?.length > 0 ? (
                          watch("subIndustry").map((sub) => (
                            <Badge key={sub} variant="secondary">
                              {sub}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newSubIndustries = watch("subIndustry").filter(
                                    (s) => s !== sub
                                  );
                                  setValue("subIndustry", newSubIndustries);
                                }}
                              />
                            </Badge>
                          ))
                        ) : (
                          "Select specialization(s)"
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Search specialization..." />
                      <CommandEmpty>No specialization found.</CommandEmpty>
                      <CommandGroup>
                        {availableSubIndustries.map((sub) => (
                          <CommandItem
                            key={sub}
                            onSelect={() => {
                              const currentSelection = watch("subIndustry") || [];
                              const newSelection = currentSelection.includes(sub)
                                ? currentSelection.filter((s) => s !== sub)
                                : [...currentSelection, sub];
                              setValue("subIndustry", newSelection);
                            }}
                          >
                            <Checkbox
                              checked={watch("subIndustry")?.includes(sub)}
                              onCheckedChange={(checked) => {
                                const currentSelection = watch("subIndustry") || [];
                                const newSelection = checked
                                  ? [...currentSelection, sub]
                                  : currentSelection.filter((s) => s !== sub);
                                setValue("subIndustry", newSelection);
                              }}
                              className="mr-2"
                            />
                            {sub}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.subIndustry && (
                  <p className="text-sm text-red-500">
                    {errors.subIndustry.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 p-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                suppressHydrationWarning
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                {...register("experience")}
              />

              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2 p-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g java, python,sql"
                {...register("skills")}
              />

              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            <div className="space-y-2 p-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                className="h-32"
                {...register("bio")}
              />

              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <Button suppressHydrationWarning type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
