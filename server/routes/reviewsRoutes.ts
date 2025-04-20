import express from 'express';
import { db } from '../db';
import { userReviews } from '@shared/schema';
import { eq, and, sql, avg, count } from 'drizzle-orm';
import type { UserReviewWithAuthor, ReviewStats } from '@/hooks/use-reviews';
import { users } from '@shared/schema';


// Instanziamo il router
const router = express.Router();

// GET /api/reviews/user/:inserzionistId - Ottieni tutte le recensioni per un inserzionista
router.get('/user/:inserzionistId', async (req, res) => {
  try {
    const inserzionistId = parseInt(req.params.inserzionistId);
    
    if (isNaN(inserzionistId)) {
      return res.status(400).json({ error: 'ID inserzionista non valido' });
    }
    
    // Recupera le recensioni con informazioni sull'autore
    const reviewsQuery = await db
      .select({
        id: userReviews.id,
        inserzionistId: userReviews.inserzionistId,
        authorId: userReviews.authorId,
        rating: userReviews.rating,
        comment: userReviews.comment,
        createdAt: userReviews.createdAt,
        updatedAt: userReviews.updatedAt,
        authorName: users.name,
        authorUsername: users.username,
        authorProfileImage: users.profileImage
      })
      .from(userReviews)
      .leftJoin(users, eq(userReviews.authorId, users.id))
      .where(eq(userReviews.inserzionistId, inserzionistId))
      .orderBy(sql`${userReviews.createdAt} DESC`);
    
    // Calcola le statistiche (media voti e numero recensioni)
    const statsQuery = await db
      .select({
        averageRating: sql<number>`COALESCE(avg(${userReviews.rating}), 0)`,
        totalReviews: sql<number>`count(*)`
      })
      .from(userReviews)
      .where(eq(userReviews.inserzionistId, inserzionistId));
    
    const stats: ReviewStats = {
      averageRating: parseFloat(statsQuery[0].averageRating.toFixed(1)),
      totalReviews: statsQuery[0].totalReviews
    };
    
    res.json({
      reviews: reviewsQuery,
      stats
    });
  } catch (error: any) {
    console.error('Errore nel recupero delle recensioni:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle recensioni' });
  }
});

// GET /api/reviews/user/:inserzionistId/by/:authorId - Ottieni la recensione di un utente specifico per un inserzionista
router.get('/user/:inserzionistId/by/:authorId', async (req, res) => {
  try {
    const inserzionistId = parseInt(req.params.inserzionistId);
    const authorId = parseInt(req.params.authorId);
    
    if (isNaN(inserzionistId) || isNaN(authorId)) {
      return res.status(400).json({ error: 'ID non validi' });
    }
    
    const review = await db
      .select()
      .from(userReviews)
      .where(
        and(
          eq(userReviews.inserzionistId, inserzionistId),
          eq(userReviews.authorId, authorId)
        )
      )
      .limit(1);
    
    if (review.length === 0) {
      return res.status(404).json({ error: 'Recensione non trovata' });
    }
    
    res.json(review[0]);
  } catch (error: any) {
    console.error('Errore nel recupero della recensione:', error);
    res.status(500).json({ error: 'Errore durante il recupero della recensione' });
  }
});

// POST /api/reviews/user/:inserzionistId - Crea una nuova recensione
router.post('/user/:inserzionistId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Non autenticato' });
  }
  
  try {
    const inserzionistId = parseInt(req.params.inserzionistId);
    const authorId = req.user.id;
    
    if (isNaN(inserzionistId)) {
      return res.status(400).json({ error: 'ID inserzionista non valido' });
    }
    
    // Controlla se l'utente sta tentando di recensire se stesso
    if (inserzionistId === authorId) {
      return res.status(403).json({ error: 'Non puoi recensire te stesso' });
    }
    
    // Controlla se l'utente ha già scritto una recensione per questo inserzionista
    const existingReview = await db
      .select()
      .from(userReviews)
      .where(
        and(
          eq(userReviews.inserzionistId, inserzionistId),
          eq(userReviews.authorId, authorId)
        )
      )
      .limit(1);
    
    if (existingReview.length > 0) {
      return res.status(409).json({ error: 'Hai già recensito questo inserzionista' });
    }
    
    // Valida i dati della recensione
    const { rating, comment } = req.body;
    
    // Validazione manuale
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La valutazione deve essere un numero tra 1 e 5' });
    }
    
    if (comment && typeof comment !== 'string') {
      return res.status(400).json({ error: 'Il commento deve essere una stringa' });
    }
    
    const reviewData = {
      inserzionistId,
      authorId,
      rating,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
      interaction: false
    };
    
    // Crea la recensione
    const result = await db
      .insert(userReviews)
      .values(reviewData)
      .returning();
    
    res.status(201).json(result[0]);
  } catch (error: any) {
    console.error('Errore nella creazione della recensione:', error);
    res.status(500).json({ error: 'Errore durante la creazione della recensione' });
  }
});

// PUT /api/reviews/:reviewId - Aggiorna una recensione esistente
router.put('/:reviewId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Non autenticato' });
  }
  
  try {
    const reviewId = parseInt(req.params.reviewId);
    const userId = req.user.id;
    
    if (isNaN(reviewId)) {
      return res.status(400).json({ error: 'ID recensione non valido' });
    }
    
    // Verifica che la recensione esista e appartenga all'utente
    const existingReview = await db
      .select()
      .from(userReviews)
      .where(eq(userReviews.id, reviewId))
      .limit(1);
    
    if (existingReview.length === 0) {
      return res.status(404).json({ error: 'Recensione non trovata' });
    }
    
    if (existingReview[0].authorId !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a modificare questa recensione' });
    }
    
    // Aggiorna la recensione
    const { rating, comment } = req.body;
    const updateData: any = { updatedAt: new Date() };
    
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'La valutazione deve essere tra 1 e 5' });
      }
      updateData.rating = rating;
    }
    
    if (comment !== undefined) {
      updateData.comment = comment;
    }
    
    const result = await db
      .update(userReviews)
      .set(updateData)
      .where(eq(userReviews.id, reviewId))
      .returning();
    
    res.json(result[0]);
  } catch (error: any) {
    console.error('Errore nell\'aggiornamento della recensione:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della recensione' });
  }
});

// DELETE /api/reviews/:reviewId - Elimina una recensione
router.delete('/:reviewId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Non autenticato' });
  }
  
  try {
    const reviewId = parseInt(req.params.reviewId);
    const userId = req.user.id;
    
    if (isNaN(reviewId)) {
      return res.status(400).json({ error: 'ID recensione non valido' });
    }
    
    // Verifica che la recensione esista e appartenga all'utente
    const existingReview = await db
      .select()
      .from(userReviews)
      .where(eq(userReviews.id, reviewId))
      .limit(1);
    
    if (existingReview.length === 0) {
      return res.status(404).json({ error: 'Recensione non trovata' });
    }
    
    if (existingReview[0].authorId !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a eliminare questa recensione' });
    }
    
    // Elimina la recensione
    await db
      .delete(userReviews)
      .where(eq(userReviews.id, reviewId));
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Errore nell\'eliminazione della recensione:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione della recensione' });
  }
});

export default router;