import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Card, CardContent, CardTitle } from "@workspace/ui/components/card";
import { StarRating } from "./star_rating";
import { Badge } from "@workspace/ui/components/badge";
import { ReviewForm } from "./review_form";

export async function ProductReviews({ productId }: { productId: string }) {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*, profiles:user_id (full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  console.log(reviews);

  return (
    <div className="space-y-10 mt-16 border-t pt-10">
      <h2 className="text-md font-bold">
        Customer Reviews
        <br />
        <span className="text-xs font-thin">{reviews?.length} ratings</span>
      </h2>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left */}
        <div className="space-y-6">
          {reviews?.length === 0 ? (
            <p className="text-gray-500 italic">
              NO reviews yet. Be the first!
            </p>
          ) : (
            reviews?.map((review: any) => (
              <div className="border-b pb-6 last:border-0" key={review.id}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    {/* <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {review.profiles?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar> */}
                    <div>
                      <div className="flex items-center gap-2">
                        <StarRating value={review.rating} readOnly />
                        {review.is_verified && (
                          <Badge
                            variant={"secondary"}
                            className="text-[10px] h-5 px-1 bg-green-100 text-green-700"
                          >
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm">{review.comment}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  By {review.profiles?.full_name || "Anonymous"}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right */}
        {/* <div className="bg-gray-50 p-6 rounded-lg h-fit"> */}
        <div className="bg-accent p-6 rounded-lg h-fit">
          <h3 className="font-semibold mb-4">Write a Review</h3>
          <ReviewForm productId={productId} />
        </div>
      </div>
    </div>
  );
}
