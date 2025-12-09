"use client";
import React, { useEffect, useCallback, useMemo } from "react";
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

const IndustryBadge = ({ ind, indId, onRemove }) => {
  const handleRemoveIndustry = useCallback(
    (e) => {
      e.stopPropagation();
      onRemove(indId);
    },
    [onRemove, indId]
  );

  return (
    <Badge key={`${ind.id}-${ind.name}`} variant="secondary">
      {ind.name}
      <X
        className="ml-1 h-3 w-3 cursor-pointer"
        onClick={handleRemoveIndustry}
      />
    </Badge>
  );
};

const IndustryCommandItem = ({ industry, selectedIds, onToggle }) => {
  const isChecked = useMemo(() => {
    return selectedIds?.includes(industry.id) || false;
  }, [selectedIds, industry.id]);

  const handleCheckedChange = useCallback(
    (checked) => {
      onToggle(industry.id, checked);
    },
    [onToggle, industry.id]
  );

  return (
    <CommandItem
      key={industry.id}
      onSelect={() => onToggle(industry.id, !isChecked)}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        className="mr-2"
      />
      {industry.name}
    </CommandItem>
  );
};

const SubIndustryBadge = ({ sub, onRemove }) => {
  const handleRemoveSubIndustry = useCallback(
    (e) => {
      e.stopPropagation();
      onRemove(sub);
    },
    [onRemove, sub]
  );

  return (
    <Badge key={`${sub}-${sub.length}`} variant="secondary">
      {sub}
      <X
        className="ml-1 h-3 w-3 cursor-pointer"
        onClick={handleRemoveSubIndustry}
      />
    </Badge>
  );
};

const SubIndustryCommandItem = ({ sub, selectedValues, onToggle }) => {
  const isChecked = useMemo(() => {
    return selectedValues?.includes(sub) || false;
  }, [selectedValues, sub]);

  const handleCheckedChange = useCallback(
    (checked) => {
      onToggle(sub, checked);
    },
    [onToggle, sub]
  );

  return (
    <CommandItem key={sub} onSelect={() => onToggle(sub, !isChecked)}>
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        className="mr-2"
      />
      {sub}
    </CommandItem>
  );
};

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
    defaultValues: {
      name: "",
      industry: [],
      subIndustry: [],
      experience: 0,
      skills: "",
      bio: "",
    },
  });

  const selectedIndustryIds = watch("industry") || [];
  const selectedSubIndustryValues = watch("subIndustry") || [];

  const onIndustryToggle = useCallback(
    (industryId, checked) => {
      const currentSelection = watch("industry") || [];
      let newSelection;
      if (checked) {
        // Only add if not already present
        newSelection = currentSelection.includes(industryId)
          ? currentSelection
          : [...currentSelection, industryId];
      } else {
        newSelection = currentSelection.filter((id) => id !== industryId);
      }
      setValue("industry", newSelection);
      setValue("subIndustry", []); // Clear subIndustries on industry change
    },
    [watch, setValue]
  );

  const onRemoveIndustry = useCallback(
    (indIdToRemove) => {
      const currentSelection = watch("industry") || [];
      const newSelection = currentSelection.filter(
        (id) => id !== indIdToRemove
      );
      setValue("industry", newSelection);
      setValue("subIndustry", []); // Clear subIndustries if main industry is removed
    },
    [watch, setValue]
  );

  const onSubIndustryToggle = useCallback(
    (subValue, checked) => {
      const currentSelection = watch("subIndustry") || [];
      let newSelection;
      if (checked) {
        // Only add if not already present
        newSelection = currentSelection.includes(subValue)
          ? currentSelection
          : [...currentSelection, subValue];
      } else {
        newSelection = currentSelection.filter((s) => s !== subValue);
      }
      setValue("subIndustry", newSelection);
    },
    [watch, setValue]
  );

  const onRemoveSubIndustry = useCallback(
    (subToRemove) => {
      const currentSelection = watch("subIndustry") || [];
      const newSelection = currentSelection.filter((s) => s !== subToRemove);
      setValue("subIndustry", newSelection);
    },
    [watch, setValue]
  );

  const currentSubIndustriesRef = React.useRef([]);
  const availableSubIndustries = useMemo(() => {
    const newlyComputedSubIndustries = Array.from(
      new Set(
        selectedIndustryIds.flatMap((id) => {
          const industry = industries.find((i) => i.id === id);
          return industry ? industry.subIndustries : [];
        })
      )
    );

    // Compare content to maintain reference equality if content is the same
    if (
      JSON.stringify(newlyComputedSubIndustries) ===
      JSON.stringify(currentSubIndustriesRef.current)
    ) {
      return currentSubIndustriesRef.current;
    } else {
      currentSubIndustriesRef.current = newlyComputedSubIndustries;
      return newlyComputedSubIndustries;
    }
  }, [selectedIndustryIds, industries]);

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
                <p className="text-sm text-red-500">{errors.name.message}</p>
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
                      {selectedIndustryIds?.length > 0
                        ? selectedIndustryIds.map((indId, index) => {
                            const ind = industries.find((i) => i.id === indId);
                            return ind ? (
                              <IndustryBadge
                                key={ind.id}
                                ind={ind}
                                indId={indId}
                                onRemove={onRemoveIndustry}
                              />
                            ) : null;
                          })
                        : "Select industry(s)"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0">
                  <Command>
                    <CommandInput placeholder="Search industry..." />
                    <CommandEmpty>No industry found.</CommandEmpty>
                    <CommandGroup>
                      {industries.map((industry) => (
                        <IndustryCommandItem
                          key={industry.id}
                          industry={industry}
                          selectedIds={selectedIndustryIds}
                          onToggle={onIndustryToggle}
                        />
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

            {selectedIndustryIds?.length > 0 && (
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
                        {selectedSubIndustryValues?.length > 0
                          ? selectedSubIndustryValues.map((sub) => (
                              <SubIndustryBadge
                                key={`${sub}-${sub.length}`}
                                sub={sub}
                                onRemove={onRemoveSubIndustry}
                              />
                            ))
                          : "Select specialization(s)"}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0">
                    <Command>
                      <CommandInput placeholder="Search specialization..." />
                      <CommandEmpty>No specialization found.</CommandEmpty>
                      <CommandGroup>
                        {availableSubIndustries.map((sub) => (
                          <SubIndustryCommandItem
                            key={sub}
                            sub={sub}
                            selectedValues={selectedSubIndustryValues}
                            onToggle={onSubIndustryToggle}
                          />
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
