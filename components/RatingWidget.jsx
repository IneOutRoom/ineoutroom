// File: components/RatingWidget.jsx
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { FaHome } from 'react-icons/fa';

const colors = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#27ae60"]; 
// Array di colori per 1,2,3,4,5 casette (rosso, arancio, giallo, verde chiaro, verde scuro)

const RatingWidget = ({ listingId }) => {
  const user = auth.currentUser;
  const [avgRating, setAvgRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myRatingId, setMyRatingId] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    
    // Query Firestore per le valutazioni di questo annuncio
    const q = query(collection(db, "ratings"), where("listingId", "==", listingId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      const ratings = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        ratings.push({ id: doc.id, ...data });
        total += data.rating;
      });
      
      const count = ratings.length;
      const avg = count > 0 ? total / count : 0;
      
      setAvgRating(avg);
      setRatingsCount(count);
      
      if (user) {
        // Controlla se l'utente corrente ha già valutato
        const myRatingEntry = ratings.find(r => r.userId === user.uid);
        if (myRatingEntry) {
          setMyRating(myRatingEntry.rating);
          setMyRatingId(myRatingEntry.id);
        } else {
          setMyRating(0);
          setMyRatingId(null);
        }
      }
    });
    
    return () => unsubscribe();
  }, [listingId, user]);

  const handleRate = async (value) => {
    if (!user) {
      alert("Accedi per lasciare una valutazione");
      return;
    }
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (myRatingId) {
        // Aggiorna la valutazione esistente
        await updateDoc(doc(db, "ratings", myRatingId), {
          rating: value,
          updatedAt: new Date()
        });
      } else {
        // Verifica se esiste già una valutazione per questo utente e annuncio
        const existingQuery = query(
          collection(db, "ratings"),
          where("listingId", "==", listingId),
          where("userId", "==", user.uid)
        );
        
        const existingRatings = await getDocs(existingQuery);
        
        if (!existingRatings.empty) {
          // Aggiorna la valutazione esistente
          const existingRatingDoc = existingRatings.docs[0];
          await updateDoc(doc(db, "ratings", existingRatingDoc.id), {
            rating: value,
            updatedAt: new Date()
          });
          setMyRatingId(existingRatingDoc.id);
        } else {
          // Crea una nuova valutazione
          const docRef = await addDoc(collection(db, "ratings"), {
            listingId: listingId,
            userId: user.uid,
            userDisplayName: user.displayName || 'Utente',
            userPhotoURL: user.photoURL || null,
            rating: value,
            createdAt: new Date()
          });
          setMyRatingId(docRef.id);
        }
      }
      
      setMyRating(value);
    } catch (err) {
      console.error("Errore nell'invio della valutazione:", err);
      alert("Errore nel salvare la valutazione. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determina quante "casette" colorare in base alla valutazione media o dell'utente
  const displayRating = hoveredRating || myRating || Math.round(avgRating);
  const displayColor = displayRating > 0 ? colors[displayRating - 1] : "#bdc3c7"; // grigio chiaro se 0

  return (
    <div className="rating-widget">
      <div className="houses flex">
        {[1, 2, 3, 4, 5].map(num => (
          <FaHome 
            key={num} 
            onClick={() => user && handleRate(num)} 
            onMouseEnter={() => user && setHoveredRating(num)} 
            onMouseLeave={() => setHoveredRating(0)} 
            color={num <= displayRating ? displayColor : "#bdc3c7"} 
            size={24} 
            className={`mr-1 transition-all duration-200 ${
              user ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } ${isSubmitting ? 'opacity-50' : 'opacity-100'}`}
            title={user ? `Dai ${num} su 5` : "Effettua login per valutare"}
          />
        ))}
      </div>
      <div className="rating-info text-sm text-muted-foreground mt-1">
        {ratingsCount > 0 ? (
          <span className="flex items-center">
            <span className="font-semibold text-foreground">{avgRating.toFixed(1)}</span>
            <span className="mx-1">/</span>
            <span>5</span>
            <span className="mx-1">•</span>
            <span>{ratingsCount} {ratingsCount === 1 ? 'valutazione' : 'valutazioni'}</span>
          </span>
        ) : (
          <span>Nessuna valutazione</span>
        )}
        {myRating > 0 && (
          <div className="mt-1">
            <span className="text-xs">La tua valutazione: {myRating}/5</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingWidget;