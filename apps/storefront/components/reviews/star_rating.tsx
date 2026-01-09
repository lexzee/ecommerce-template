"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  name?: string; // for form submission
  value?: number; // controlled value
  onChange?: (val: number) => void;
  readOnly?: boolean;
  className?: string;
}

export function StarRating({
  name,
  value = 0,
  onChange,
  readOnly = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  return (
    <div
      className={cn("flex gap-0.5", className)}
      onMouseLeave={() => !readOnly && setHoverValue(0)}
    >
      {/* Hidden input for form submission if name is provided */}
      {!readOnly && name && <input type="hidden" name={name} value={value} />}

      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            aria-label={`Rate ${star} out of 5 stars`}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            className={cn(
              "transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-0.5",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
              isFilled ? "text-yellow-500" : "text-muted-foreground/30"
            )}
          >
            <Star className={cn("h-5 w-5", isFilled && "fill-current")} />
          </button>
        );
      })}
    </div>
  );
}
