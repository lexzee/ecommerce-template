"use server";

import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CheckCircle2, MessageSquareOff } from "lucide-react";
import { ReviewForm } from "./review_form";
import { StarRating } from "./star_rating";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  is_verified: boolean;
  profiles: { full_name: string | null } | null;
}

export async function ProductReviews({ productId }: { productId: string }) {
  const supabase = await createClient();

  const { data: rawReviews } = await supabase
    .from("reviews")
    .select("*, profiles:user_id (full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  const reviews = (rawReviews as unknown as Review[]) || [];

  return (
    <section className="mt-16 border-t border-border pt-10" id="reviews">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
        <span className="text-sm text-muted-foreground">
          {reviews.length} {reviews.length === 1 ? "rating" : "ratings"}
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left: Reviews List (Takes up 7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg bg-muted/30">
              <MessageSquareOff className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to share your thoughts on this product.
              </p>
            </div>
          ) : (
            reviews.map((review) => {
              const initials = review.profiles?.full_name
                ? review.profiles.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "U";

              return (
                <div
                  key={review.id}
                  className="border-b border-border pb-8 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm">
                          {review.profiles?.full_name || "Anonymous"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <StarRating value={review.rating} readOnly />
                    {review.is_verified && (
                      <Badge
                        variant="outline"
                        className="gap-1 text-[10px] font-normal border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Write Review Form (Takes up 5 cols)  */}
        <div className="lg:col-span-5">
          <Card className="bg-muted/30 border-border sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewForm productId={productId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
