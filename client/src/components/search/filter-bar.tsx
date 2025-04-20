import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Map, List, X } from 'lucide-react';

interface FilterBadge {
  id: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  activeFilters?: FilterBadge[];
  onRemoveFilter?: (id: string) => void;
  onSortChange?: (value: string) => void;
  onViewChange?: (view: 'list' | 'map') => void;
  currentView?: 'list' | 'map';
  resultsCount?: number;
  onSaveSearch?: () => void;
}

export function FilterBar({
  activeFilters = [],
  onRemoveFilter = () => {},
  onSortChange = () => {},
  onViewChange = () => {},
  currentView = 'list',
  resultsCount = 0,
  onSaveSearch
}: FilterBarProps) {
  const [sortBy, setSortBy] = useState('relevance');

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  return (
    <section className="filter-bar bg-white py-4 border-b border-neutral-200 sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200">
              <Filter className="h-4 w-4" />
              <span>Filtri</span>
            </Button>
            
            {activeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="outline"
                className="rounded-full bg-primary/10 text-primary border-none px-4 py-2"
              >
                {filter.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2 text-primary hover:bg-transparent hover:text-primary-dark"
                  onClick={() => onRemoveFilter(filter.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          {/* Sort & View options */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-neutral-500 flex items-center">
              <span className="mr-2 hidden sm:inline">Ordina per:</span>
              <Select defaultValue={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="border-0 bg-transparent w-auto p-0 h-auto focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Rilevanza</SelectItem>
                  <SelectItem value="price_asc">Prezzo (crescente)</SelectItem>
                  <SelectItem value="price_desc">Prezzo (decrescente)</SelectItem>
                  <SelectItem value="date_desc">Data (più recenti)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center border rounded overflow-hidden">
              <Button
                variant={currentView === 'list' ? 'default' : 'ghost'} 
                size="sm"
                className={currentView === 'list' ? 'bg-primary text-white' : 'bg-white text-neutral-500 hover:text-primary'}
                onClick={() => onViewChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={currentView === 'map' ? 'default' : 'ghost'}
                size="sm"
                className={`map-view-button ${currentView === 'map' ? 'bg-primary text-white' : 'bg-white text-neutral-500 hover:text-primary'}`}
                onClick={() => onViewChange('map')}
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
