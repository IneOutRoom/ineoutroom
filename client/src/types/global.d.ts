// Definizioni globali per TypeScript

// Estende l'interfaccia Window per includere i callback Google Maps
interface Window {
  initGoogleMaps?: () => void;
  google?: {
    maps: {
      Map: typeof google.maps.Map;
      Marker: typeof google.maps.Marker;
      InfoWindow: typeof google.maps.InfoWindow;
      LatLng: typeof google.maps.LatLng;
      event: typeof google.maps.event;
      places: {
        Autocomplete: typeof google.maps.places.Autocomplete;
        PlaceAutocompleteElement: typeof google.maps.places.PlaceAutocompleteElement;
        PlacesService: typeof google.maps.places.PlacesService;
        AutocompleteService: typeof google.maps.places.AutocompleteService;
      };
      StreetViewPanorama: typeof google.maps.StreetViewPanorama;
      StreetViewService: typeof google.maps.StreetViewService;
      StreetViewStatus: {
        OK: string;
        UNKNOWN_ERROR: string;
        ZERO_RESULTS: string;
        [key: string]: string;
      };
      Animation: {
        DROP: number;
        BOUNCE: number;
      };
    };
  };
}