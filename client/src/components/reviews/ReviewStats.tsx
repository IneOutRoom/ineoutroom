import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  ownerResponse: string | null;
  helpful: number | null;
  unhelpful: number | null;
  createdAt: Date;
}

interface ReviewStatsProps {
  reviews: Review[];
}

export function ReviewStats({ reviews }: ReviewStatsProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  // Calcola la valutazione media
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  // Conta recensioni per ogni valutazione (da 1 a 5 stelle)
  const ratingCounts = Array(5).fill(0);
  reviews.forEach(review => {
    ratingCounts[review.rating - 1]++;
  });
  
  // Calcola le percentuali per ogni valutazione
  const ratingPercentages = ratingCounts.map(count => {
    return reviews.length > 0 ? (count / reviews.length) * 100 : 0;
  });
  
  // Oggetto con colori per le diverse valutazioni
  const ratingColors = {
    5: "bg-green-500",
    4: "bg-green-400",
    3: "bg-yellow-400",
    2: "bg-orange-400",
    1: "bg-red-500"
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Riepilogo valutazione e numero recensioni */}
      <div className="flex flex-col items-center md:w-1/3">
        <div className="text-4xl font-bold mb-1">{averageRating.toFixed(1)}</div>
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={cn(
                "fill-current",
                star <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"
              )}
            />
          ))}
        </div>
        <div className="text-sm text-gray-500">{reviews.length} recensioni</div>
      </div>
      
      {/* Distribuzione delle valutazioni */}
      <div className="w-full md:w-2/3 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center">
            <div className="w-12 text-xs text-gray-500 flex items-center">
              <span>{rating}</span>
              <Star size={12} className="ml-1 fill-current text-yellow-400" />
            </div>
            <Progress 
              value={ratingPercentages[rating - 1]} 
              className="h-2 flex-1 bg-gray-100" 
              indicatorClassName={ratingColors[rating as keyof typeof ratingColors]}
            />
            <div className="w-12 text-xs text-right text-gray-500">
              {ratingCounts[rating - 1]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}