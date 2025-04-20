import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useAutocomplete } from '@/hooks/use-autocomplete';
import { useGeolocation } from '@/hooks/use-geolocation';
import { propertyTypeEnum } from '@shared/schema';
import { AdvancedFilters } from './advanced-filters';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import OpenStreetMapAutocomplete from '@/components/maps/OpenStreetMapAutocomplete';

interface Country {
  code: string;
  name: string;
}

interface SearchBoxProps {
  onSearch: (searchParams: any) => void;
  onNearMe: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

export function SearchBox({ onSearch, onNearMe, className = "" }: SearchBoxProps) {
  const [propertyType, setPropertyType] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [cityInput, setCityInput] = useState<string>("");
  const [advancedFilters, setAdvancedFilters] = useState({
    isFurnished: false,
    allowsPets: false,
    internetIncluded: false
  });
  
  // Caricamento dei paesi dal server
  const { data: paesi = [], isLoading: paesiLoading } = useQuery<Country[]>({
    queryKey: ['/api/countries'],
    queryFn: async () => {
      const response = await fetch('/api/countries');
      if (!response.ok) {
        throw new Error('Errore nel caricamento dei paesi');
      }
      return response.json();
    }
  });
  
  const { predictions, getPredictions, selectPrediction } = useAutocomplete({
    country: country !== 'all' ? country : undefined
  });
  const { getPosition, position, loading: geoLoading } = useGeolocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchCoords = useRef<{lat: number, lng: number} | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [cityDisabled, setCityDisabled] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Abilita o disabilita l'input della città in base alla selezione del paese
  useEffect(() => {
    if (country) {
      setCityDisabled(false);
    } else {
      setCityDisabled(true);
      setCityInput(''); // Resetta l'input della città quando il paese viene deselezionato
      getPredictions(''); // Resetta anche le predizioni
    }
  }, [country, setCityInput, getPredictions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parametri di base
    const searchParams: any = {
      country: country || undefined,
      city: cityInput,
      propertyType: propertyType === "all" ? undefined : propertyType || undefined,
      maxPrice: maxPrice === "any" ? undefined : maxPrice ? parseInt(maxPrice) : undefined,
      isFurnished: advancedFilters.isFurnished || undefined,
      allowsPets: advancedFilters.allowsPets || undefined,
      internetIncluded: advancedFilters.internetIncluded || undefined
    };
    
    // Aggiungi coordinate se disponibili dall'autocomplete
    if (searchCoords.current) {
      searchParams.latitude = searchCoords.current.lat;
      searchParams.longitude = searchCoords.current.lng;
      searchParams.radius = 5; // 5km di raggio di default
    }
    
    onSearch(searchParams);
  };
  
  const handleAdvancedFilterChange = (filters: {
    isFurnished?: boolean;
    allowsPets?: boolean;
    internetIncluded?: boolean;
  }) => {
    setAdvancedFilters({
      ...advancedFilters,
      ...filters
    });
  };

  const handleNearMeClick = () => {
    getPosition();
    if (position) {
      onNearMe({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    }
  };

  const handlePredictionClick = (prediction: { place_id: string; description: string }) => {
    const cityName = prediction.description.split(',')[0].trim();
    setCityInput(cityName);
    setShowPredictions(false);
  };

  return (
    <div className={`search-box-container ${className}`}>
      <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
        <CardContent className="p-1">
          <div className="flex items-center justify-end p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center text-neutral-500 hover:text-primary text-sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              Filtri avanzati
            </Button>
          </div>
          
          {showAdvancedFilters && (
            <AdvancedFilters
              onFilterChange={handleAdvancedFilterChange}
              initialFilters={advancedFilters}
              className="mx-2 mb-2"
            />
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-none md:flex md:flex-row w-full">
              {/* Country selector */}
              <div className="flex-1 p-3 border-b sm:border-r sm:border-b md:border-b-0 md:border-r border-neutral-200">
                <label className="block text-neutral-500 text-xs font-medium mb-1">Paese</label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 truncate">
                    <SelectValue placeholder="Seleziona un paese" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 overflow-y-auto">
                    <SelectItem value="all">Tutti i paesi</SelectItem>
                    {paesiLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                        <span>Caricamento paesi...</span>
                      </div>
                    ) : (
                      paesi.map((paese: Country) => (
                        <SelectItem key={paese.code} value={paese.code}>{paese.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Location search */}
              <div className="flex-1 p-3 border-b sm:border-b md:border-b-0 md:border-r border-neutral-200" ref={searchRef}>
                <label className="block text-neutral-500 text-xs font-medium mb-1">Città</label>
                <div className="relative">
                  <div className="flex items-center">
                    <Search className="w-4 h-4 text-neutral-400 mr-2 absolute left-2" />
                    <OpenStreetMapAutocomplete 
                      placeholder={cityDisabled ? "Seleziona prima un paese" : "Città, via, quartiere o zona"} 
                      className="pl-8 border-0 focus-visible:ring-0 placeholder:text-neutral-400 truncate"
                      initialValue={cityInput}
                      country={country !== 'all' ? country.toLowerCase() : undefined}
                      disabled={cityDisabled}
                      onAddressSelect={(address) => {
                        setCityInput(address.city || address.full);
                        // Se abbiamo coordinate, le salviamo per la ricerca
                        if (address.lat && address.lng) {
                          searchCoords.current = {
                            lat: address.lat,
                            lng: address.lng
                          };
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Property type */}
              <div className="flex-1 p-3 border-b sm:border-r sm:border-b md:border-b-0 md:border-r border-neutral-200">
                <label className="block text-neutral-500 text-xs font-medium mb-1">Tipologia</label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 truncate">
                    <SelectValue placeholder="Qualsiasi tipologia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualsiasi tipologia</SelectItem>
                    <SelectItem value="stanza_singola">Stanza singola</SelectItem>
                    <SelectItem value="stanza_doppia">Stanza doppia</SelectItem>
                    <SelectItem value="monolocale">Monolocale</SelectItem>
                    <SelectItem value="bilocale">Bilocale</SelectItem>
                    <SelectItem value="altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Budget */}
              <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-neutral-200">
                <label className="block text-neutral-500 text-xs font-medium mb-1">Budget massimo</label>
                <Select value={maxPrice} onValueChange={setMaxPrice}>
                  <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 truncate">
                    <SelectValue placeholder="Qualsiasi prezzo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualsiasi prezzo</SelectItem>
                    <SelectItem value="400">Fino a 400€</SelectItem>
                    <SelectItem value="600">Fino a 600€</SelectItem>
                    <SelectItem value="800">Fino a 800€</SelectItem>
                    <SelectItem value="1000">Fino a 1000€</SelectItem>
                    <SelectItem value="2000">Oltre 1000€</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Search button */}
            <div className="p-3 flex items-center">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-medium">
                Cerca ora
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Near me button */}
      <Button
        onClick={handleNearMeClick}
        variant="outline"
        className="mt-4 mx-auto flex items-center bg-white/80 backdrop-blur-sm rounded-full py-2 px-6 hover:bg-white transition border-white text-primary font-semibold shadow-md"
      >
        <MapPin className="mr-2 h-4 w-4" />
        <span>Vedi annunci vicino a me</span>
      </Button>
    </div>
  );
}
