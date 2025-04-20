// pages/api/properties/search.js
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  startAt, 
  endAt,
  getFirestore 
} from "firebase/firestore";
import { db } from "../../../firebase";

/**
 * API endpoint per cercare proprietà con vari filtri
 * Utilizza gli indici compositi definiti in firestore.indexes.json
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    // Estrai parametri di ricerca dal corpo della richiesta
    const {
      city,
      propertyType,
      minPrice,
      maxPrice,
      isFurnished,
      allowsPets,
      internetIncluded,
      isActive = true,
      limit: resultLimit = 50,
      latitude,
      longitude,
      radius
    } = req.body;

    // Costruisci la query base
    let constraints = [];

    // Filtro isActive (default: true)
    constraints.push(where("isActive", "==", isActive));

    // Filtro città (se specificato)
    if (city) {
      constraints.push(where("city", "==", city));
    }

    // Filtro tipo proprietà (se specificato)
    if (propertyType) {
      constraints.push(where("propertyType", "==", propertyType));
    }

    // Filtri per prezzo
    // Nota: Firestore supporta solo un filtro di disuguaglianza per query
    if (minPrice !== undefined && maxPrice === undefined) {
      constraints.push(where("price", ">=", parseInt(minPrice)));
    } else if (minPrice === undefined && maxPrice !== undefined) {
      constraints.push(where("price", "<=", parseInt(maxPrice)));
    } else if (minPrice !== undefined && maxPrice !== undefined) {
      // Se entrambi specificati, usiamo minPrice come filtro principale
      // e filtriamo maxPrice sul client (o meglio, qui sul server)
      constraints.push(where("price", ">=", parseInt(minPrice)));
    }

    // Filtri per caratteristiche (furnishing, pets, etc.)
    if (isFurnished !== undefined) {
      constraints.push(where("features", "array-contains", "arredato"));
    }

    if (allowsPets !== undefined) {
      constraints.push(where("features", "array-contains", "animali_ammessi"));
    }

    if (internetIncluded !== undefined) {
      constraints.push(where("features", "array-contains", "wifi"));
    }

    // Ordina i risultati per prezzo crescente 
    // (usiamo l'indice composito definito in firestore.indexes.json)
    constraints.push(orderBy("price", "asc"));

    // Limita il numero di risultati
    constraints.push(limit(parseInt(resultLimit)));

    // Esegui la query
    const q = query(collection(db, "listings"), ...constraints);
    const querySnapshot = await getDocs(q);

    // Processa i risultati
    let results = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Titolo non disponibile",
        description: data.description || "",
        city: data.city,
        zone: data.zone || "",
        country: data.country || "Italia",
        price: data.price,
        squareMeters: data.squareMeters,
        propertyType: data.propertyType,
        latitude: data.latitude,
        longitude: data.longitude,
        features: data.features || [],
        imageURL: data.imageURL || null,
        photos: data.photos || [],
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });

    // Filtra in base al prezzo massimo se necessario
    if (minPrice !== undefined && maxPrice !== undefined) {
      results = results.filter(property => 
        property.price <= parseInt(maxPrice)
      );
    }

    // Filtri avanzati per caratteristiche se specificati
    // Nota: array-contains supporta solo un valore, quindi applichiamo ulteriori filtri qui
    const featureFilters = [];
    
    if (isFurnished && !constraints.some(c => c.toString().includes("array-contains") && c.toString().includes("arredato"))) {
      featureFilters.push("arredato");
    }
    
    if (allowsPets && !constraints.some(c => c.toString().includes("array-contains") && c.toString().includes("animali_ammessi"))) {
      featureFilters.push("animali_ammessi");
    }
    
    if (internetIncluded && !constraints.some(c => c.toString().includes("array-contains") && c.toString().includes("wifi"))) {
      featureFilters.push("wifi");
    }
    
    if (featureFilters.length > 0) {
      results = results.filter(property => 
        featureFilters.every(feature => property.features?.includes(feature))
      );
    }

    // Filtra per geolocalizzazione se specificata
    if (latitude && longitude && radius) {
      // Convertire il raggio in gradi (approssimazione)
      // In media, 1 grado è circa 111 km all'equatore
      const approxRadiusInDegrees = parseFloat(radius) / 111;
      
      // Filtro semplice basato su raggio (NOTA: è un'approssimazione)
      results = results.filter(property => {
        if (!property.latitude || !property.longitude) return false;
        
        const distance = Math.sqrt(
          Math.pow(property.latitude - parseFloat(latitude), 2) +
          Math.pow(property.longitude - parseFloat(longitude), 2)
        );
        
        return distance <= approxRadiusInDegrees;
      });
    }

    // Se non ci sono risultati, restituiamo un array vuoto
    res.status(200).json(results);
  } catch (error) {
    console.error("Errore durante la ricerca delle proprietà:", error);
    res.status(500).json({ error: 'Errore durante la ricerca delle proprietà' });
  }
}