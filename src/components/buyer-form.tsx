"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  cityEnum,
  propertyTypeEnum,
  bhkEnum,
  purposeEnum,
  timelineEnum,
  sourceEnum,
  statusEnum,
} from "@/db/schema";
import { z } from "zod";
import { TagInput } from "@/components/ui/tag-input";
import {
  IndianLocationInput,
  indianStates,
} from "@/components/ui/indian-city-input";

// Create a form schema that doesn't require owner ID
const formSchema = z
  .object({
    id: z.string().uuid().optional(),
    fullName: z.string().min(2).max(80),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(10).max(15).regex(/^\d+$/),
    city: cityEnum,
    propertyType: propertyTypeEnum,
    bhk: bhkEnum.optional(),
    purpose: purposeEnum,
    budgetMin: z.number().int().positive().optional().nullable(),
    budgetMax: z.number().int().positive().optional().nullable(),
    timeline: timelineEnum,
    source: sourceEnum,
    status: statusEnum.default("New"),
    notes: z.string().max(1000).optional().or(z.literal("")),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
    updatedAt: z.date().optional(),
  })
  .refine(
    (data) => {
      // BHK is required for Apartment and Villa property types
      if (["Apartment", "Villa"].includes(data.propertyType) && !data.bhk) {
        return false;
      }
      return true;
    },
    {
      message: "BHK is required for Apartment and Villa property types",
      path: ["bhk"],
    }
  )
  .refine(
    (data) => {
      // budgetMax should be greater than or equal to budgetMin if both are present
      if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
        return false;
      }
      return true;
    },
    {
      message:
        "Maximum budget should be greater than or equal to minimum budget",
      path: ["budgetMax"],
    }
  )
  .refine(
    (data) => {
      // At least 1 tag is required
      return data.tags && data.tags.length > 0;
    },
    {
      message: "At least one tag is required",
      path: ["tags"],
    }
  );

// Create a TypeScript type from the Zod schema
type BuyerFormData = z.infer<typeof formSchema>;

interface BuyerFormProps {
  initialData?: Partial<BuyerFormData>;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export function BuyerForm({
  initialData,
  onSubmit,
  isSubmitting,
}: BuyerFormProps) {
  // State for conditional fields
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>(
    initialData?.propertyType || ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      city: initialData?.city || undefined,
      propertyType: initialData?.propertyType || undefined,
      bhk: initialData?.bhk || undefined,
      purpose: initialData?.purpose || undefined,
      budgetMin: initialData?.budgetMin || undefined,
      budgetMax: initialData?.budgetMax || undefined,
      timeline: initialData?.timeline || undefined,
      source: initialData?.source || undefined,
      status: initialData?.status || "New",
      notes: initialData?.notes || "",
      tags: initialData?.tags || [],
      // Include hidden fields if they exist in initialData
      id: initialData?.id,
      updatedAt: initialData?.updatedAt,
    },
  });

  // Watch property type for conditional rendering
  const watchPropertyType = watch("propertyType");

  // Update state when property type changes
  React.useEffect(() => {
    if (watchPropertyType) {
      setSelectedPropertyType(watchPropertyType);
      // Clear BHK if property type doesn't require it
      if (!["Apartment", "Villa"].includes(watchPropertyType)) {
        setValue("bhk", undefined);
      }
    }
  }, [watchPropertyType, setValue]);

  // Handle form submission with type safety
  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      console.log("Form submission data:", data);

      // Check and fix required fields before submitting
      let needsUpdate = false;

      // Validate city before submitting
      if (!data.city || !cityEnum.options.includes(data.city as any)) {
        console.warn("City is required or invalid, setting default");
        setValue("city", "Other" as any);
        needsUpdate = true;
      }

      // If we updated any fields, get the fresh values
      if (needsUpdate) {
        // Wait for React Hook Form to update
        await new Promise((resolve) => setTimeout(resolve, 0));
        // Submit with the updated form data
        await onSubmit(getValues() as unknown as BuyerFormData);
      } else {
        // Submit with the original form data
        await onSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  // Handle tag input
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  return (
    <>
      <h1 className="text-3xl font-bold text-black my-4">Add New Buyer Lead</h1>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Hidden fields */}
        {initialData?.id && (
          <input type="hidden" {...register("id")} value={initialData.id} />
        )}
        {initialData?.updatedAt && (
          <input
            type="hidden"
            {...register("updatedAt")}
            value={new Date(initialData.updatedAt).toISOString()}
          />
        )}

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Full Name */}
            <div className="col-span-1 md:col-span-2">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                {...register("fullName")}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                aria-invalid={errors.fullName ? "true" : "false"}
                aria-describedby={
                  errors.fullName ? "fullName-error" : undefined
                }
              />
              {errors.fullName && (
                <p id="fullName-error" className="mt-1 text-sm text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone *
              </label>
              <input
                type="text"
                id="phone"
                {...register("phone")}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                aria-invalid={errors.phone ? "true" : "false"}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* City */}
            <div className="col-span-1 md:col-span-2">
              {/* Hidden input to ensure React Hook Form registers this field */}
              <input type="hidden" {...register("city")} />

              <IndianLocationInput
                cityId="city"
                cityValue={(watch("city") as string) || ""}
                onCityChange={(value) => {
                  console.log("City changed to:", value);
                  // Make sure the value is one of the allowed enum values
                  if (cityEnum.options.includes(value as any)) {
                    setValue("city", value as any);
                  } else {
                    console.warn("Invalid city value:", value);
                  }
                }}
                cityError={errors.city?.message}
                cityOptions={cityEnum.options}
                required={true}
              />
              <p className="text-xs text-blue-600 mt-1">
                Current value - City: {watch("city") || "None"}
              </p>
            </div>

            {/* Property Type */}
            <div>
              <label
                htmlFor="propertyType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Property Type *
              </label>
              <select
                id="propertyType"
                {...register("propertyType")}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                aria-invalid={errors.propertyType ? "true" : "false"}
                aria-describedby={
                  errors.propertyType ? "propertyType-error" : undefined
                }
              >
                <option value="">Select property type</option>
                {propertyTypeEnum.options.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.propertyType && (
                <p
                  id="propertyType-error"
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.propertyType.message}
                </p>
              )}
            </div>

            {/* BHK (conditional) */}
            <div>
              <label
                htmlFor="bhk"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                BHK{" "}
                {["Apartment", "Villa"].includes(selectedPropertyType)
                  ? "*"
                  : ""}
              </label>
              <select
                id="bhk"
                {...register("bhk")}
                disabled={
                  !["Apartment", "Villa"].includes(selectedPropertyType)
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                aria-invalid={errors.bhk ? "true" : "false"}
                aria-describedby={errors.bhk ? "bhk-error" : undefined}
              >
                <option value="">Select BHK</option>
                {bhkEnum.options.map((bhk) => (
                  <option key={bhk} value={bhk}>
                    {bhk}
                  </option>
                ))}
              </select>
              {errors.bhk && (
                <p id="bhk-error" className="mt-1 text-sm text-red-600">
                  {errors.bhk.message}
                </p>
              )}
            </div>

            {/* Purpose */}
            <div>
              <label
                htmlFor="purpose"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Purpose *
              </label>
              <select
                id="purpose"
                {...register("purpose")}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                aria-invalid={errors.purpose ? "true" : "false"}
                aria-describedby={errors.purpose ? "purpose-error" : undefined}
              >
                <option value="">Select purpose</option>
                {purposeEnum.options.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
              {errors.purpose && (
                <p id="purpose-error" className="mt-1 text-sm text-red-600">
                  {errors.purpose.message}
                </p>
              )}
            </div>

            {/* Budget Min */}
            <div>
              <label
                htmlFor="budgetMin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Budget Min (INR)
              </label>
              <input
                type="number"
                id="budgetMin"
                {...register("budgetMin", { valueAsNumber: true })}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                aria-invalid={errors.budgetMin ? "true" : "false"}
                aria-describedby={
                  errors.budgetMin ? "budgetMin-error" : undefined
                }
              />
              {errors.budgetMin && (
                <p id="budgetMin-error" className="mt-1 text-sm text-red-600">
                  {errors.budgetMin.message}
                </p>
              )}
            </div>

            {/* Budget Max */}
            <div>
              <label
                htmlFor="budgetMax"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Budget Max (INR)
              </label>
              <input
                type="number"
                id="budgetMax"
                {...register("budgetMax", { valueAsNumber: true })}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                aria-invalid={errors.budgetMax ? "true" : "false"}
                aria-describedby={
                  errors.budgetMax ? "budgetMax-error" : undefined
                }
              />
              {errors.budgetMax && (
                <p id="budgetMax-error" className="mt-1 text-sm text-red-600">
                  {errors.budgetMax.message}
                </p>
              )}
            </div>

            {/* Timeline */}
            <div>
              <label
                htmlFor="timeline"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Timeline *
              </label>
              <select
                id="timeline"
                {...register("timeline")}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                aria-invalid={errors.timeline ? "true" : "false"}
                aria-describedby={
                  errors.timeline ? "timeline-error" : undefined
                }
              >
                <option value="">Select timeline</option>
                {timelineEnum.options.map((timeline) => (
                  <option key={timeline} value={timeline}>
                    {timeline}
                  </option>
                ))}
              </select>
              {errors.timeline && (
                <p id="timeline-error" className="mt-1 text-sm text-red-600">
                  {errors.timeline.message}
                </p>
              )}
            </div>

            {/* Source */}
            <div>
              <label
                htmlFor="source"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Source *
              </label>
              <select
                id="source"
                {...register("source")}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                aria-invalid={errors.source ? "true" : "false"}
                aria-describedby={errors.source ? "source-error" : undefined}
              >
                <option value="">Select source</option>
                {sourceEnum.options.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              {errors.source && (
                <p id="source-error" className="mt-1 text-sm text-red-600">
                  {errors.source.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status *
              </label>
              <select
                id="status"
                {...register("status")}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                aria-invalid={errors.status ? "true" : "false"}
                aria-describedby={errors.status ? "status-error" : undefined}
              >
                {statusEnum.options.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p id="status-error" className="mt-1 text-sm text-red-600">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              {...register("notes")}
              rows={4}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              aria-invalid={errors.notes ? "true" : "false"}
              aria-describedby={errors.notes ? "notes-error" : undefined}
            ></textarea>
            {errors.notes && (
              <p id="notes-error" className="mt-1 text-sm text-red-600">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="mt-6">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags *
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Tags help categorize leads. Color-coded for easy identification.
              At least one tag is required.
            </p>
            <TagInput
              value={tags}
              onChange={(newTags) => {
                setTags(newTags);
                setValue("tags", newTags);
              }}
              placeholder="Add tags (press Enter to add, or select from suggestions)"
              suggestions={[
                // Priority tags
                "Hot Lead",
                "Urgent",
                "VIP",
                "Premium",
                "High Priority",
                // Client type
                "Investor",
                "End User",
                "Cash Buyer",
                "First Time",
                "Repeat Client",
                // Budget tags
                "High Budget",
                "Mid Budget",
                "Low Budget",
                "Negotiable",
                // Status tags
                "Follow Up",
                "Viewed",
                "Interested",
                "Not Interested",
                "Closed",
                // Property specific
                "Ready to Move",
                "Under Construction",
                "Off Plan",
                "Resale",
              ]}
              required
              minTags={1}
              error={errors.tags?.message}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </>
  );
}
