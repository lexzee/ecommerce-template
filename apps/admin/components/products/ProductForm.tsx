"use client";

import { Product } from "@/app/products/columns";
import { NICHE_CATEGORIES } from "@/config/niche-fields";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTypedClient } from "@repo/database";
import { Button } from "@workspace/ui/components/button";
import { ImageUpload } from "@workspace/ui/components/image_upload";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Base Schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(1, "Price must be a positive number."),
  stock_quantity: z.coerce
    .number()
    .min(0, "Stock quantity cannot be negative."),
  category: z.string().min(1, "Please select a category."),
  attributes: z.record(z.any(), z.any()),
  images: z.array(z.string()).min(1, "At least one image is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  // initialData?: Product;
  initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const title = initialData ? "Edit Product" : "Create Product";
  const action = initialData ? "Save Changes" : "Create";

  // Form Setup
  const form = useForm<FormValues>({
    // @ts-ignore
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: initialData
      ? { ...initialData, price: parseFloat(initialData.price) }
      : {
          name: "",
          description: "",
          price: 0,
          stock_quantity: 0,
          category: "",
          images: [],
          attributes: {},
        },
  });

  // Render dynamic fields based on category
  const selectedCategory = form.watch("category");
  const dynamicFields =
    selectedCategory &&
    NICHE_CATEGORIES[selectedCategory as keyof typeof NICHE_CATEGORIES]
      ? NICHE_CATEGORIES[selectedCategory as keyof typeof NICHE_CATEGORIES]
          .fields
      : [];

  // Handle Form Submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const supabase = createTypedClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    );

    try {
      let productId = initialData?.id;

      if (initialData) {
        const { error } = await supabase
          .from("products")
          .update({
            name: values.name,
            description: values.description,
            price: values.price,
            stock_quantity: values.stock_quantity,
            category: values.category,
            attributes: values.attributes,
            images: values.images,
            // slug:
            //   values.name.slice(0, 8).toLowerCase().replace(/\s+/g, "-") +
            //   "_" +
            //   Date.now(),
          })
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { data: productData, error } = await supabase
          .from("products")
          .insert({
            name: values.name,
            description: values.description,
            price: values.price,
            stock_quantity: values.stock_quantity,
            category: values.category,
            attributes: values.attributes,
            images: values.images,
            slug:
              values.name.slice(0, 8).toLowerCase().replace(/\s+/g, "-") +
              "_" +
              Date.now(),
          })
          .select() // To get the new ID back
          .single();

        if (error) throw error;
        productId = productData.id;
        toast.success("Product created");
      }

      // Trigger AI Embedding Generation
      const embeddingRes = await fetch("/api/generate_embedding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // id: productData.id,
          id: productId,
          name: values.name,
          description: values.description,
          category: values.category,
          attributes: values.attributes,
        }),
      });

      if (!embeddingRes.ok) {
        console.error(
          "Failed to generate product embedding, but product created."
        );
      }

      router.push("/products");
      router.refresh();
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const supabase = createTypedClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    );

    const uploadUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        throw new Error("Error uploading image");
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);
      uploadUrls.push(data.publicUrl);
    }

    return uploadUrls;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ArrowLeft size={30} onClick={() => router.back()} />
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-2xl"
      >
        {/* Image Upload Section */}
        <div className="space-y-2 col-span-2">
          <Label>Product Images</Label>
          <ImageUpload
            value={form.watch("images") || []}
            disabled={isLoading}
            onChange={(urls) => form.setValue("images", urls)}
            onRemove={(url) => {
              const currentImages = form.getValues("images");
              form.setValue(
                "images",
                currentImages.filter((i) => i !== url)
              );
            }}
            onUpload={uploadImages}
          />
          {form.formState.errors.images && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.images.message}
            </p>
          )}
        </div>

        {/* Standard Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="e.g Dior Sauvage"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description (Used by AI)</Label>
            <Textarea
              id="description"
              placeholder="Describe the product in detail..."
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (NGN)</Label>
            <Input
              type="number"
              id="price"
              placeholder="e.g 15000"
              {...form.register("price", { valueAsNumber: true })}
            />
            {form.formState.errors.price && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Stock </Label>
            <Input
              type="number"
              id="stock_quantity"
              placeholder="e.g 100"
              {...form.register("stock_quantity", { valueAsNumber: true })}
            />
            {form.formState.errors.stock_quantity && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.stock_quantity.message}
              </p>
            )}
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register("category")}
            >
              <option value="">Select a niche...</option>
              {Object.entries(NICHE_CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic field */}
        {selectedCategory && (
          <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">
              {
                NICHE_CATEGORIES[
                  selectedCategory as keyof typeof NICHE_CATEGORIES
                ].label
              }{" "}
              Specifics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {dynamicFields.map((field) => (
                <div className="space-y-2" key={field.name}>
                  <Label>{field.label}</Label>
                  {field.type === "select" ? (
                    <select
                      id={field.name}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...form.register(`attributes.${field.name}`)}
                    >
                      {/* @ts-ignore */}
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={field.type}
                      id={field.name}
                      {...form.register(`attributes.${field.name}`)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : action}
          </Button>
        </div>
      </form>
    </div>
  );
}
