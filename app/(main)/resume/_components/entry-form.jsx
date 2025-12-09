"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { entrySchema } from "@/app/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
//import { PlusCircle } from "lucide-react";
//import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, PlusCircle, X, Pencil, Save, Loader2 } from "lucide-react";
import { improveWithAI } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { parse, format } from "date-fns";





const formatDateForDisplay = (dateString) => {
  if (!dateString || dateString === "Present") return dateString;
  try {
    const date = parse(dateString, "yyyy-MM", new Date());
    return format(date, "MMM yyyy");
  } catch (error) {
    return dateString;
  }
};

export function EntryForm({ type, entries, onChange }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  });
  const current = watch("current");

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  const handleSave = handleValidation((data) => {
    const newEntries = [...entries];
    const entry = {
      ...data,
      endDate: data.current ? "Present" : data.endDate,
    };

    if (editingIndex !== null && editingIndex !== -1) {
      newEntries[editingIndex] = entry;
    } else {
      newEntries.push(entry);
    }
    onChange(newEntries);
    reset();
    setEditingIndex(null);
  });

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    const entry = entries[index];
    reset({
      title: entry.title,
      organization: entry.organization,
      startDate: entry.startDate,
      endDate: entry.endDate === "Present" ? "" : entry.endDate,
      description: entry.description,
      current: entry.endDate === "Present",
    });
  };

  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("description", improvedContent);
      toast.success("Description improved successfully!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve description");
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  const handleImproveDescription = async () => {
    const description = watch("description");
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }

    await improveWithAIFn({
      current: description,
      type: type.toLowerCase(),
    });
  };

  const renderForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingIndex === -1 ? `Add ${type}` : `Edit ${type}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              placeholder="Title/Position"
              {...register("title")}
              error={errors.title}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          {type !== "Project" && (
            <div className="space-y-2">
              <Input
                placeholder="Organization/Company"
                {...register("organization")}
                error={errors.organization}
              />
              {errors.organization && (
                <p className="text-sm text-red-500">
                  {errors.organization.message}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              type="month"
              {...register("startDate")}
              error={errors.startDate}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500">
                {errors.startDate.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="month"
              {...register("endDate")}
              disabled={current}
              error={errors.endDate}
            />
            {errors.endDate && (
              <p className="text-sm text-red-500">{errors.endDate.message}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="current"
            {...register("current")}
            onChange={(e) => {
              setValue("current", e.target.checked);
              if (e.target.checked) {
                setValue("endDate", undefined);
              }
            }}
          />
          <label htmlFor="current">Current {type}</label>
        </div>
        <div className="space-y-2">
          <Textarea
            placeholder={`Description of your ${type.toLowerCase()}`}
            className="h-32"
            {...register("description")}
            error={errors.description}
          />
          {errors.description && (
            <p className="text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImproveDescription}
          disabled={isImproving || !watch("description")}
        >
          {isImproving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Improving...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Improve with AI
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="display-flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            setEditingIndex(null);
          }}
        >
          Cancel
        </Button>
        <Button type="button" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Entry
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {entries.map((item, index) =>
          editingIndex === index ? (
            renderForm()
          ) : (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title} @ {item.organization}
                </CardTitle>
                <div>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => handleEdit(index)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => handleDelete(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {formatDateForDisplay(item.startDate)} - {formatDateForDisplay(item.endDate)}
                </p>
                <p className="mt-2 text-sm whitespace-pre-wrap">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {editingIndex === -1 && renderForm()}

      {editingIndex === null && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => {
            reset();
            setEditingIndex(-1);
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add {type}
        </Button>
      )}
    </div>
  );
};


