import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.uid,
        user_name: user.displayName || user.email?.split("@")[0] || "Anonymous",
        user_email: user.email,
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
        verified_purchase: false,
      });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      setRating(0);
      setTitle("");
      setComment("");
      onReviewSubmitted();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-muted/50 rounded-xl p-6 text-center">
        <p className="text-muted-foreground">
          Please{" "}
          <a href="/login" className="text-primary underline">
            login
          </a>{" "}
          to write a review
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-muted/50 rounded-xl p-6 space-y-4">
      <h3 className="font-display text-lg font-semibold">Write a Review</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium">Your Rating</label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onRatingChange={setRating}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Review Title (optional)
        </label>
        <Input
          id="title"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Your Review
        </label>
        <Textarea
          id="comment"
          placeholder="Tell us what you liked or didn't like about this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  );
};
