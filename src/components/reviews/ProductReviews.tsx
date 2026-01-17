import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "./StarRating";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  title: string | null;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="font-display text-2xl font-bold mb-6">
        Customer Reviews
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Summary */}
        <div className="lg:col-span-1">
          <div className="bg-muted/50 rounded-xl p-6">
            <div className="text-center mb-4">
              <span className="font-display text-4xl font-bold">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground"> / 5</span>
              <div className="flex justify-center mt-2">
                <StarRating rating={Math.round(averageRating)} size="lg" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on {reviews.length} review{reviews.length !== 1 && "s"}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2 mt-6">
              {ratingCounts.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List & Form */}
        <div className="lg:col-span-2 space-y-6">
          <ReviewForm productId={productId} onReviewSubmitted={fetchReviews} />
          <ReviewList reviews={reviews} loading={loading} />
        </div>
      </div>
    </div>
  );
};
