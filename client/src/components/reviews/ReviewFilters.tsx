import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Star } from "lucide-react";

interface ReviewFiltersProps {
  onFilterChange: (rating: number | null, sortBy: string) => void;
}

export function ReviewFilters({ onFilterChange }: ReviewFiltersProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Opzioni di ordinamento
  const sortOptions = [
    { value: "newest", label: "Più recenti" },
    { value: "oldest", label: "Più vecchie" },
    { value: "highest", label: "Valutazione più alta" },
    { value: "lowest", label: "Valutazione più bassa" },
    { value: "mostHelpful", label: "Più utili" }
  ];

  // Applica filtri
  const applyFilters = (newRating?: number | null, newSortBy?: string) => {
    const updatedRating = newRating !== undefined ? newRating : rating;
    const updatedSortBy = newSortBy || sortBy;
    
    setRating(updatedRating);
    setSortBy(updatedSortBy);
    onFilterChange(updatedRating, updatedSortBy);
  };

  // Resetta i filtri
  const resetFilters = () => {
    setRating(null);
    setSortBy("newest");
    onFilterChange(null, "newest");
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center mb-6">
      <div className="flex items-center space-x-2">
        <SlidersHorizontal className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium">Filtra:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Filtro per valutazione */}
        {[5, 4, 3, 2, 1].map((value) => (
          <Button
            key={value}
            variant={rating === value ? "default" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => applyFilters(rating === value ? null : value)}
          >
            {value} <Star className="h-3 w-3 ml-1 fill-current text-yellow-400" />
          </Button>
        ))}
      </div>
      
      <div className="flex-1"></div>
      
      {/* Ordinamento */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Ordina per:</span>
        <Select
          value={sortBy}
          onValueChange={(value) => applyFilters(undefined, value)}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Ordina per" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Pulsante reset se ci sono filtri attivi */}
      {(rating !== null || sortBy !== "newest") && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={resetFilters}
          className="text-gray-500"
        >
          Azzera filtri
        </Button>
      )}
    </div>
  );
}