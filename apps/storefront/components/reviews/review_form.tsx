"use client";

import { ReviewState, submitReview } from "@/app/product/actions";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { StarRating } from "./star_rating";

const initialState: ReviewState = {
  success: false,
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        "Post Review"
      )}
    </Button>
  );
}

export function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle Success/Error Feedback
  useEffect(() => {
    if (state?.success) {
      toast.success("Review submitted successfully!");
      setRating(0); // Reset UI stars
      formRef.current?.reset(); // Reset text inputs
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />

      {/* Star Rating */}
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-2">
          <StarRating name="rating" value={rating} onChange={setRating} />
          {rating > 0 && (
            <span className="text-sm font-medium text-muted-foreground">
              {rating}/5
            </span>
          )}
        </div>

        {/* Hidden input to pass rating to Server Action */}
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
          className="min-h-[100px] resize-none"
          required
        />
      </div>

      <SubmitButton />

      <p className="text-xs text-muted-foreground text-center mt-2">
        Verified purchases will be marked with a badge.
      </p>
    </form>
  );
}
