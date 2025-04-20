import { InsertCity } from "@shared/schema";

// Elenco delle principali città italiane con coordinate
export const italianCities: Omit<InsertCity, "id">[] = [
  // Città più popolate in Italia
  { name: "Roma", country: "IT", province: "Roma", population: 2872800, latitude: 41.9028, longitude: 12.4964, isPopular: true },
  { name: "Milano", country: "IT", province: "Milano", population: 1366180, latitude: 45.4642, longitude: 9.1900, isPopular: true },
  { name: "Napoli", country: "IT", province: "Napoli", population: 959470, latitude: 40.8518, longitude: 14.2681, isPopular: true },
  { name: "Torino", country: "IT", province: "Torino", population: 875698, latitude: 45.0703, longitude: 7.6869, isPopular: true },
  { name: "Palermo", country: "IT", province: "Palermo", population: 663401, latitude: 38.1157, longitude: 13.3615, isPopular: true },
  { name: "Genova", country: "IT", province: "Genova", population: 580097, latitude: 44.4056, longitude: 8.9463, isPopular: true },
  { name: "Bologna", country: "IT", province: "Bologna", population: 390636, latitude: 44.4949, longitude: 11.3426, isPopular: true },
  { name: "Firenze", country: "IT", province: "Firenze", population: 382258, latitude: 43.7696, longitude: 11.2558, isPopular: true },
  { name: "Bari", country: "IT", province: "Bari", population: 324198, latitude: 41.1171, longitude: 16.8719, isPopular: true },
  { name: "Catania", country: "IT", province: "Catania", population: 311584, latitude: 37.5079, longitude: 15.0830, isPopular: true },
  
  // Città turistiche e culturali italiane
  { name: "Venezia", country: "IT", province: "Venezia", population: 261905, latitude: 45.4408, longitude: 12.3155, isPopular: true },
  { name: "Verona", country: "IT", province: "Verona", population: 257275, latitude: 45.4384, longitude: 10.9916, isPopular: true },
  { name: "Padova", country: "IT", province: "Padova", population: 210440, latitude: 45.4064, longitude: 11.8768, isPopular: false },
  { name: "Trieste", country: "IT", province: "Trieste", population: 204267, latitude: 45.6495, longitude: 13.7768, isPopular: false },
  { name: "Parma", country: "IT", province: "Parma", population: 196518, latitude: 44.8015, longitude: 10.3279, isPopular: false },
  { name: "Pisa", country: "IT", province: "Pisa", population: 90488, latitude: 43.7228, longitude: 10.4017, isPopular: true },
  { name: "Siena", country: "IT", province: "Siena", population: 53901, latitude: 43.3186, longitude: 11.3305, isPopular: true },
  { name: "Perugia", country: "IT", province: "Perugia", population: 166134, latitude: 43.1107, longitude: 12.3908, isPopular: false },
  { name: "Cagliari", country: "IT", province: "Cagliari", population: 154460, latitude: 39.2238, longitude: 9.1217, isPopular: false },
  { name: "Rimini", country: "IT", province: "Rimini", population: 150755, latitude: 44.0678, longitude: 12.5695, isPopular: true }
];

// Elenco delle principali città spagnole con coordinate
export const spanishCities: Omit<InsertCity, "id">[] = [
  // Città più popolate in Spagna
  { name: "Madrid", country: "ES", province: "Madrid", population: 3223000, latitude: 40.4168, longitude: -3.7038, isPopular: true },
  { name: "Barcelona", country: "ES", province: "Barcelona", population: 1620000, latitude: 41.3851, longitude: 2.1734, isPopular: true },
  { name: "Valencia", country: "ES", province: "Valencia", population: 791413, latitude: 39.4699, longitude: -0.3763, isPopular: true },
  { name: "Sevilla", country: "ES", province: "Sevilla", population: 688711, latitude: 37.3891, longitude: -5.9845, isPopular: true },
  { name: "Zaragoza", country: "ES", province: "Zaragoza", population: 674997, latitude: 41.6488, longitude: -0.8891, isPopular: true },
  { name: "Málaga", country: "ES", province: "Málaga", population: 569002, latitude: 36.7213, longitude: -4.4214, isPopular: true },
  { name: "Murcia", country: "ES", province: "Murcia", population: 447182, latitude: 37.9922, longitude: -1.1307, isPopular: false },
  { name: "Palma", country: "ES", province: "Baleares", population: 402949, latitude: 39.5696, longitude: 2.6502, isPopular: true },
  { name: "Las Palmas", country: "ES", province: "Las Palmas", population: 379925, latitude: 28.1248, longitude: -15.4300, isPopular: true },
  { name: "Bilbao", country: "ES", province: "Vizcaya", population: 345821, latitude: 43.2630, longitude: -2.9350, isPopular: true },
  
  // Città turistiche e culturali spagnole
  { name: "Alicante", country: "ES", province: "Alicante", population: 330525, latitude: 38.3452, longitude: -0.4815, isPopular: true },
  { name: "Córdoba", country: "ES", province: "Córdoba", population: 325701, latitude: 37.8882, longitude: -4.7794, isPopular: true },
  { name: "Granada", country: "ES", province: "Granada", population: 232462, latitude: 37.1773, longitude: -3.5986, isPopular: true },
  { name: "Toledo", country: "ES", province: "Toledo", population: 83741, latitude: 39.8628, longitude: -4.0273, isPopular: true },
  { name: "Segovia", country: "ES", province: "Segovia", population: 51683, latitude: 40.9429, longitude: -4.1088, isPopular: true },
  { name: "Salamanca", country: "ES", province: "Salamanca", population: 143978, latitude: 40.9649, longitude: -5.6630, isPopular: true },
  { name: "Santiago de Compostela", country: "ES", province: "A Coruña", population: 95671, latitude: 42.8782, longitude: -8.5448, isPopular: true },
  { name: "Santander", country: "ES", province: "Cantabria", population: 172539, latitude: 43.4609, longitude: -3.8079, isPopular: false },
  { name: "San Sebastián", country: "ES", province: "Guipúzcoa", population: 186665, latitude: 43.3183, longitude: -1.9812, isPopular: true },
  { name: "Cádiz", country: "ES", province: "Cádiz", population: 116027, latitude: 36.5298, longitude: -6.2924, isPopular: true }
];

// Combina le città italiane e spagnole in un'unica lista
export const allCities = [...italianCities, ...spanishCities];