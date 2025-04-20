import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedFiltersProps {
  onFilterChange: (filters: {
    isFurnished?: boolean;
    allowsPets?: boolean;
    internetIncluded?: boolean;
  }) => void;
  initialFilters?: {
    isFurnished?: boolean;
    allowsPets?: boolean;
    internetIncluded?: boolean;
  };
  className?: string;
}

export function AdvancedFilters({
  onFilterChange,
  initialFilters = {},
  className = ''
}: AdvancedFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [isFurnished, setIsFurnished] = useState(initialFilters.isFurnished || false);
  const [allowsPets, setAllowsPets] = useState(initialFilters.allowsPets || false);
  const [internetIncluded, setInternetIncluded] = useState(initialFilters.internetIncluded || false);

  const handleFilterChange = (key: string, value: boolean) => {
    let newFilters = {};
    
    switch (key) {
      case 'isFurnished':
        setIsFurnished(value);
        newFilters = { isFurnished: value, allowsPets, internetIncluded };
        break;
      case 'allowsPets':
        setAllowsPets(value);
        newFilters = { isFurnished, allowsPets: value, internetIncluded };
        break;
      case 'internetIncluded':
        setInternetIncluded(value);
        newFilters = { isFurnished, allowsPets, internetIncluded: value };
        break;
    }
    
    onFilterChange(newFilters);
  };

  return (
    <Card className={cn('bg-white border border-neutral-200 mb-4', className)}>
      <div 
        className="px-4 py-3 flex justify-between items-center cursor-pointer border-b border-neutral-100"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-sm font-semibold text-neutral-700">Filtri avanzati</h3>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-neutral-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        )}
      </div>
      
      {expanded && (
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="furnished" 
              checked={isFurnished}
              onCheckedChange={(checked) => handleFilterChange('isFurnished', checked === true)}
            />
            <Label 
              htmlFor="furnished" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Arredato
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="pets" 
              checked={allowsPets}
              onCheckedChange={(checked) => handleFilterChange('allowsPets', checked === true)}
            />
            <Label 
              htmlFor="pets" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Animali ammessi
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="internet" 
              checked={internetIncluded}
              onCheckedChange={(checked) => handleFilterChange('internetIncluded', checked === true)}
            />
            <Label 
              htmlFor="internet" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Internet incluso
            </Label>
          </div>
        </CardContent>
      )}
    </Card>
  );
}