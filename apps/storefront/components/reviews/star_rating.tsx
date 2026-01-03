"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface StarRatingProps {
  name?: string; // for form submission
  value?: number; // controlled value
  onChange?: (val: number) => void;
  readOnly?: boolean;
}

export function StarRating({
  name,
  value = 0,
  onChange,
  readOnly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  return (
    <div
      className="flex gap-1"
      onMouseLeave={() => !readOnly && setHoverValue(0)}
    >
      {/* Hidden input for form submission */}
      {!readOnly && name && <input type="hidden" name={name} value={value} />}

      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={cn(
            "text-gray-300 transition-colors",
            !readOnly && "hover:scale-110 cursor-pointer",
            star <= displayValue && "text-yellow-400 fill-yellow-400"
          )}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHoverValue(star)}
        >
          <Star className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}
