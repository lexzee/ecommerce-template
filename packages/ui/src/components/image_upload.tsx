"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (url: string) => void;
  disabled?: boolean;
  className?: string;
  onUpload: (files: File[]) => Promise<string[]>;
}

function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  className,
  onUpload,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      const urls = await onUpload(files);
      onChange([...value, ...urls]);
    } catch (e) {
      console.error("Error uploading files", e);
      alert("Error uploading files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // if (e.target.files && e.target.files.length > 0) {
    //   setIsUploading(true);
    //   try {
    //     const files = Array.from(e.target.files);
    //     const urls = await onUpload(files);
    //     onChange([...value, ...urls]);
    //   } catch (e) {
    //     console.error("Error uploading files", e);
    //     alert("Error uploading files");
    //   } finally {
    //     setIsUploading(false);
    //   }
    // }
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  // Drag and drop handlers
  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      }
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {value.map((url) => (
            <div
              className="relative aspect-square rounded-md overflow-hidden border"
              key={url}
            >
              <div className="absolute top-2 right-2 z-10">
                <Button
                  type="button"
                  onClick={() => onRemove(url)}
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <img
                src={url}
                alt="Product"
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload Box */}
      <div className="flex items-center justify-center w-full">
        {/* <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-muted-foreground/25">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isUploading
                ? "Uploading..."
                : "Click to upload or drag and drop"}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </label> */}
        <label
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out",
            // Base styles
            "border-muted-foreground/25 hover:bg-muted/50",
            // Drag active styles (Blue border + light blue background)
            isDragging && "border-primary bg-primary/10",
            // Disabled styles
            (disabled || isUploading) &&
              "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload
              className={cn(
                "w-8 h-8 mb-2 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
            <p className="text-sm text-muted-foreground">
              {isUploading
                ? "Uploading..."
                : isDragging
                  ? "Drop images here"
                  : "Click or drag images to upload"}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </label>
      </div>
    </div>
  );
}

export { ImageUpload };
