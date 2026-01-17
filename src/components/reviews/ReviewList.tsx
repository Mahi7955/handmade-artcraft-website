import { format } from "date-fns";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  title: string | null;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
}

export const ReviewList = ({ reviews, loading }: ReviewListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted/50 rounded-xl p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-muted rounded mb-2" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-muted/50 rounded-xl p-8 text-center">
        <p className="text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-muted/50 rounded-xl p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.user_name}</span>
                  {review.verified_purchase && (
                    <Badge variant="secondary" className="text-xs">
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {review.title && (
            <h4 className="font-semibold mb-1">{review.title}</h4>
          )}
          <p className="text-muted-foreground">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};
