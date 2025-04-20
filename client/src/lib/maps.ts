// Tipi di base
export interface Marker {
  id: number;
  position: { lat: number; lng: number };
  title: string;
  info?: string;
  icon?: string;
}

export interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
}

// Funzione per inizializzare una mappa Google Maps
export function initMap(
  elementId: string,
  options: MapOptions
): google.maps.Map {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento con ID ${elementId} non trovato`);
  }

  return new google.maps.Map(element, {
    center: options.center,
    zoom: options.zoom,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ],
  });
}

// Funzione per aggiungere marker a una mappa
export function addMarkers(
  map: google.maps.Map,
  markers: Marker[]
): google.maps.Marker[] {
  return markers.map((markerData) => {
    const marker = new google.maps.Marker({
      position: markerData.position,
      map,
      title: markerData.title,
      icon: markerData.icon,
      animation: google.maps.Animation.DROP,
    });

    // Se c'è un contenuto info window, crea l'info window
    if (markerData.info) {
      const infoWindow = new google.maps.InfoWindow({
        content: markerData.info,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    }

    return marker;
  });
}

// Funzione per ottenere l'ubicazione dell'utente
export async function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalizzazione non supportata dal browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Errore di geolocalizzazione:', error);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// Funzione per geocodificare un indirizzo (convertire indirizzo in coordinate)
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API non caricata'));
      return;
    }

    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        console.error('Geocoding fallito:', status);
        resolve(null);
      }
    });
  });
}

// Funzione per reverse geocoding (convertire coordinate in indirizzo)
export async function reverseGeocode(
  location: { lat: number; lng: number }
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API non caricata'));
      return;
    }

    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(location.lat, location.lng);
    
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        console.error('Reverse geocoding fallito:', status);
        resolve(null);
      }
    });
  });
}

// Funzione per calcolare la distanza in km tra due punti (formula di Haversine)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raggio della Terra in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Arrotonda a 1 decimale
}

// Funzione di supporto per convertire gradi in radianti
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Funzione per trovare la città più vicina alle coordinate date
export function findNearestCity(
  userLocation: { lat: number; lng: number },
  cities: { name: string; lat: number; lng: number }[]
): { name: string; distance: number } {
  let nearestCity = cities[0];
  let minDistance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    cities[0].lat,
    cities[0].lng
  );

  cities.forEach((city) => {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      city.lat,
      city.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });

  return {
    name: nearestCity.name,
    distance: minDistance,
  };
}