"use client";

import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { useFormState, useFormStatus } from "react-dom";
import { StarRating } from "./star_rating";
import { Textarea } from "@workspace/ui/components/textarea";
import { ReviewState, submitReview } from "@/app/product/actions";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

const initialState: ReviewState = {
  success: false,
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Submitting..." : "Post Review"}
    </Button>
  );
}

export function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(0);

  // Reset form on success or show error
  useEffect(() => {
    if (state?.success) {
      toast.success("Review submitted successfully!");
      setRating(0); // Reset stars
      const form = document.getElementById("review_form") as HTMLFormElement;
      form?.reset();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);
  return (
    <form action={formAction} id="review_form" className="space-y-4">
      <input type="hidden" name="productId" value={productId} />

      {/* Star Rating */}
      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating name="rating" value={rating} onChange={setRating} />
        {/* Helper text if they try to submit without stars */}
        <input
          type="number"
          className="sr-only"
          name="rating"
          value={rating}
          required
          min={1}
          max={5}
          readOnly
        />
      </div>

      {/* Comment Input */}
      <div className="space-y-2">
        <Label htmlFor="comment">Your Review</Label>
        <Textarea
          id="comment"
          name="comment"
          placeholder="What did you like or dislike?"
          className="min-h-[100px]"
        />
      </div>

      <SubmitButton />

      {/* Helpful Hint */}
      <p className="text-xs text-gray-400 text-center mt-2">
        Verified purchases will be marked with a badge.
      </p>
    </form>
  );
}
