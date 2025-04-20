import { faker } from '@faker-js/faker/locale/it';
import { db } from '../db';
import { allCities, italianCities, spanishCities } from './cityData';
import { cities, properties, users, propertyTypeEnum } from '@shared/schema';
import { InsertProperty, InsertCity } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { log } from '../vite';

// Configurazioni
const ADMIN_USER_ID = 1; // ID dell'utente amministratore che sarà il proprietario degli annunci

// Funzione per generare un prezzo realistico in base al tipo di proprietà e alla città
function generateRealisticPrice(propertyType: string, city: InsertCity): number {
  const basePrice = {
    'stanza_singola': { min: 300, max: 600 },
    'stanza_doppia': { min: 200, max: 450 },
    'monolocale': { min: 500, max: 1000 },
    'bilocale': { min: 650, max: 1300 },
    'altro': { min: 800, max: 1500 }
  };

  // Fattore di aggiustamento basato sulla popolazione (città più grandi = prezzi più alti)
  const population = city.population || 0;
  const populationFactor = population > 1000000 ? 1.4 : 
                         population > 500000 ? 1.2 :
                         population > 200000 ? 1.1 : 1.0;
  
  // Fattore di aggiustamento basato sul fatto che sia una città turistica
  const touristicFactor = city.isPopular ? 1.3 : 1.0;
  
  // Fattore di aggiustamento basato sul paese
  const countryFactor = city.country === 'IT' ? 1.0 : 0.9; // Spagna leggermente più economica in generale
  
  const priceRange = basePrice[propertyType as keyof typeof basePrice];
  const minPrice = priceRange.min * populationFactor * touristicFactor * countryFactor;
  const maxPrice = priceRange.max * populationFactor * touristicFactor * countryFactor;
  
  return Math.round(faker.number.int({ min: minPrice, max: maxPrice }) / 10) * 10; // Arrotonda a decine
}

// Funzione per generare caratteristiche realistiche
function generateFeatures(propertyType: string): { [key: string]: boolean } {
  // Caratteristiche di base che tutti i tipi di proprietà possono avere
  const basicFeatures = {
    wifi: faker.datatype.boolean(0.9), // 90% di probabilità
    lavatrice: faker.datatype.boolean(0.8),
    riscaldamento: faker.datatype.boolean(0.95),
    arredato: faker.datatype.boolean(0.9),
    ascensore: faker.datatype.boolean(0.6),
    balcone: faker.datatype.boolean(0.5),
    animaliAmmessi: faker.datatype.boolean(0.2),
    cucinaCondivisa: propertyType === 'stanza_singola' || propertyType === 'stanza_doppia' ? faker.datatype.boolean(0.9) : false,
    bagnoPrivato: propertyType === 'stanza_singola' ? faker.datatype.boolean(0.4) : 
                 propertyType === 'stanza_doppia' ? faker.datatype.boolean(0.5) : true
  };

  // Caratteristiche aggiuntive per appartamenti
  if (propertyType === 'monolocale' || propertyType === 'bilocale' || propertyType === 'altro') {
    return {
      ...basicFeatures,
      ariaCondizionata: faker.datatype.boolean(0.6),
      lavastovigie: faker.datatype.boolean(0.5),
      televisione: faker.datatype.boolean(0.7),
      parcheggioIncluded: faker.datatype.boolean(0.3),
      vista: faker.datatype.boolean(0.2)
    };
  }

  return basicFeatures;
}

// Genera un titolo realistico
function generateTitle(propertyType: string, city: InsertCity, propertyFeatures: any): string {
  const propertyTypeMap = {
    'stanza_singola': 'Stanza singola',
    'stanza_doppia': 'Stanza doppia',
    'monolocale': 'Monolocale',
    'bilocale': 'Bilocale',
    'altro': 'Appartamento'
  };

  const descriptors = [
    'luminoso', 'accogliente', 'moderno', 'ristrutturato', 'spazioso', 
    'comodo', 'elegante', 'centrale', 'tranquillo', 'ben collegato'
  ];

  const locations = [
    'in centro', 'vicino all\'università', 'ben collegato', 
    'zona residenziale', 'vicino al centro', 'ottima posizione'
  ];

  const titleFeatures = [];
  if (Math.random() > 0.5) {
    titleFeatures.push(faker.helpers.arrayElement(descriptors));
  }
  if (Math.random() > 0.7) {
    titleFeatures.push(faker.helpers.arrayElement(locations));
  }

  const propertyTypeLabel = propertyTypeMap[propertyType as keyof typeof propertyTypeMap];
  const featureStr = titleFeatures.length > 0 ? ` ${titleFeatures.join(', ')}` : '';
  
  return `${propertyTypeLabel}${featureStr} a ${city.name}`;
}

// Genera una descrizione realistica per un annuncio
function generateDescription(propertyType: string, city: InsertCity, features: any, price: number): string {
  const propertyTypeMap = {
    'stanza_singola': 'stanza singola',
    'stanza_doppia': 'stanza doppia',
    'monolocale': 'monolocale',
    'bilocale': 'bilocale',
    'altro': 'appartamento'
  };

  const intro = [
    `Affitto ${propertyTypeMap[propertyType as keyof typeof propertyTypeMap]} a ${city.name}, ${city.province}.`,
    `${propertyTypeMap[propertyType as keyof typeof propertyTypeMap].charAt(0).toUpperCase() + propertyTypeMap[propertyType as keyof typeof propertyTypeMap].slice(1)} in affitto nella zona di ${city.name}.`,
    `Proponiamo in affitto questo ${propertyTypeMap[propertyType as keyof typeof propertyTypeMap]} situato a ${city.name}.`
  ];

  const details = [];
  if (features.wifi) details.push("WiFi incluso");
  if (features.lavatrice) details.push("lavatrice");
  if (features.ariaCondizionata) details.push("aria condizionata");
  if (features.riscaldamento) details.push("riscaldamento");
  if (features.balcone) details.push("balcone");
  if (features.arredato) details.push("completamente arredato");
  if (features.ascensore) details.push("ascensore");
  if (features.bagnoPrivato) details.push("bagno privato");

  const positions = [
    "Situato in posizione strategica",
    "Collocato in una zona tranquilla",
    "In zona ben servita",
    "In ottima posizione",
    "Situato in un quartiere residenziale"
  ];

  const transportInfo = [
    "ben collegato con i mezzi pubblici",
    "a pochi passi dalla fermata del bus",
    "vicino alla stazione della metropolitana",
    "comodo ai servizi di trasporto pubblico",
    "facile accesso ai principali collegamenti"
  ];

  const amenitiesNearby = [
    "supermercati, negozi e ristoranti nelle vicinanze",
    "tutti i servizi principali a portata di mano",
    "vicino a parchi e aree verdi",
    "in prossimità di scuole e università",
    "circondato da tutti i servizi necessari"
  ];

  const closing = [
    `Canone mensile di ${price}€, spese escluse.`,
    `Affitto richiesto: ${price}€ al mese più spese condominiali.`,
    `Prezzo: ${price}€ mensili, escluse utenze.`
  ];

  const availability = [
    "Disponibile da subito",
    `Disponibile dal ${faker.date.between({ from: new Date(), to: new Date(new Date().setMonth(new Date().getMonth() + 3)) }).toLocaleDateString('it-IT')}`,
    "Libero per essere occupato immediatamente",
    `Disponibilità immediata`
  ];

  return `
${faker.helpers.arrayElement(intro)}

${propertyType === 'stanza_singola' || propertyType === 'stanza_doppia' 
  ? 'La stanza si trova in un appartamento condiviso con altre persone.' 
  : 'L\'appartamento è stato recentemente ristrutturato e si presenta in ottime condizioni.'}

Caratteristiche principali:
- ${details.join('\n- ')}

${faker.helpers.arrayElement(positions)}, ${faker.helpers.arrayElement(transportInfo)}. ${faker.helpers.arrayElement(amenitiesNearby)}.

${faker.helpers.arrayElement(closing)}
${faker.helpers.arrayElement(availability)}.

Contattaci per maggiori informazioni o per fissare un appuntamento per visionare l'immobile.
`.trim();
}

// Genera URL di foto realistiche per il tipo di proprietà
function generatePhotos(propertyType: string): string[] {
  const photoCategories = {
    'stanza_singola': ['bedroom', 'bedroom', 'smallroom', 'apartment', 'livingroom'],
    'stanza_doppia': ['bedroom', 'bedroom', 'room', 'apartment', 'livingroom'],
    'monolocale': ['apartment', 'livingroom', 'kitchen', 'bathroom', 'apartment'],
    'bilocale': ['apartment', 'livingroom', 'kitchen', 'bathroom', 'bedroom'],
    'altro': ['house', 'livingroom', 'kitchen', 'bathroom', 'bedroom']
  };

  const photos = [];
  const category = photoCategories[propertyType as keyof typeof photoCategories];
  
  // Ogni proprietà ha 4-5 foto
  const numPhotos = faker.number.int({ min: 4, max: 5 });
  
  for (let i = 0; i < numPhotos; i++) {
    const photoType = category[i % category.length];
    // Uso immagini Unsplash con query specifiche per il tipo di stanza
    photos.push(`https://source.unsplash.com/random/800x600?${photoType}`);
  }
  
  return photos;
}

// Calcola una data di scadenza realistica per l'annuncio (6 mesi nel futuro)
function calculateExpiryDate(): Date {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6);
  return expiryDate;
}

// Funzione per creare un annuncio completo
async function createListing(city: InsertCity, propertyType: string, userId: number): Promise<InsertProperty> {
  const features = generateFeatures(propertyType);
  const price = generateRealisticPrice(propertyType, city);
  const title = generateTitle(propertyType, city, features);
  const description = generateDescription(propertyType, city, features, price);
  const photos = generatePhotos(propertyType);
  const availableFrom = faker.date.between({ 
    from: new Date(), 
    to: new Date(new Date().setMonth(new Date().getMonth() + 2))
  });
  
  // Genera valori realistici per metri quadri in base al tipo di proprietà
  const squareMetersRange = {
    'stanza_singola': { min: 12, max: 20 },
    'stanza_doppia': { min: 16, max: 30 },
    'monolocale': { min: 30, max: 50 },
    'bilocale': { min: 45, max: 80 },
    'altro': { min: 60, max: 120 }
  };
  
  const range = squareMetersRange[propertyType as keyof typeof squareMetersRange];
  const squareMeters = faker.number.int({ min: range.min, max: range.max });

  // Genera un indirizzo realistico
  const address = `${faker.location.street()}, ${city.name}`;
  
  // Generale coordinate realistiche (piccola variazione dalle coordinate della città)
  const latVariation = (Math.random() - 0.5) * 0.1;
  const longVariation = (Math.random() - 0.5) * 0.1;
  const latitude = city.latitude ? city.latitude + latVariation : null;
  const longitude = city.longitude ? city.longitude + longVariation : null;

  // Determina il numero di bagni e camere da letto in base al tipo di proprietà
  let bedrooms = 1;
  let bathrooms = 1;
  
  if (propertyType === 'bilocale') {
    bedrooms = 2;
    bathrooms = faker.helpers.arrayElement([1, 1, 1, 2]); // 75% ha 1 bagno, 25% ne ha 2
  } else if (propertyType === 'altro') {
    bedrooms = faker.helpers.arrayElement([2, 3, 4]);
    bathrooms = faker.helpers.arrayElement([1, 1, 2, 2, 3]); // distribuzione più varia
  }

  // Crea l'annuncio
  return {
    userId,
    title,
    description,
    propertyType: propertyType as any,
    price: price * 100, // Convertire in centesimi come richiesto dallo schema
    country: city.country,
    city: city.name,
    address,
    zone: faker.helpers.arrayElement([`Centro`, `${city.name} Nord`, `${city.name} Sud`, `Periferia`, null]),
    latitude,
    longitude,
    squareMeters,
    bedrooms,
    bathrooms,
    photos,
    features,
    availableFrom,
    expiresAt: calculateExpiryDate()
  };
}

// Funzione principale per popolare il database
export async function seedListings(adminUserId: number = ADMIN_USER_ID): Promise<{ count: number, cityCount: number }> {
  try {
    log('Inizio seeding delle città...', 'info');
    
    // Prima controlla se ci sono già città nel database
    const existingCities = await db.select().from(cities);
    
    // Se non ci sono città, inseriscile
    if (existingCities.length === 0) {
      log(`Inserimento di ${allCities.length} città (${italianCities.length} italiane, ${spanishCities.length} spagnole)...`, 'info');
      await db.insert(cities).values(allCities);
    } else {
      log(`Trovate ${existingCities.length} città già presenti nel database, salto l'inserimento.`, 'info');
    }
    
    // Verifica che l'utente admin esista
    const adminUser = await db.select().from(users).where(eq(users.id, adminUserId)).limit(1);
    if (adminUser.length === 0) {
      throw new Error(`Utente amministratore con ID ${adminUserId} non trovato. Impossibile creare annunci.`);
    }
    
    // Ottieni tutte le città dal database
    const dbCities = await db.select().from(cities);
    log(`Recuperate ${dbCities.length} città dal database.`, 'info');
    
    // Prepara gli annunci
    const listings: InsertProperty[] = [];
    
    // Per ogni città, genera 4 annunci (1 stanza singola, 2 bilocali, 1 stanza doppia)
    for (const city of dbCities) {
      // 1 stanza singola
      listings.push(await createListing(city, 'stanza_singola', adminUserId));
      
      // 2 bilocali
      listings.push(await createListing(city, 'bilocale', adminUserId));
      listings.push(await createListing(city, 'bilocale', adminUserId));
      
      // 1 stanza doppia
      listings.push(await createListing(city, 'stanza_doppia', adminUserId));
    }
    
    log(`Generati ${listings.length} annunci immobiliari.`, 'info');
    
    // Inserisci gli annunci nel database
    const result = await db.insert(properties).values(listings);
    
    log(`Seeding completato con successo! Inseriti ${listings.length} annunci.`, 'success');
    
    return { count: listings.length, cityCount: dbCities.length };
  } catch (error) {
    log(`Errore durante il seeding: ${error}`, 'error');
    throw error;
  }
}