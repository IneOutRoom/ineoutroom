import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Verifica se un utente può pubblicare un annuncio
 * Controlla abbonamenti attivi, pacchetti acquistati e prima inserzione gratuita
 * @param userId ID dell'utente
 * @returns true se l'utente può pubblicare, false altrimenti
 */
export async function canPublishListing(userId: number): Promise<boolean> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    return false;
  }

  // Verifica se l'utente ha un abbonamento attivo
  const hasActiveSubscription = 
    user.subscriptionPlan && 
    user.subscriptionExpiresAt && 
    new Date(user.subscriptionExpiresAt) > new Date();

  // Verifica se l'utente ha inserzioni rimanenti
  const hasRemainingListings = user.remainingListings && user.remainingListings > 0;

  // Verifica se l'utente ha diritto alla prima inserzione gratuita
  const hasFreeListing = user.usedFreeListing !== true;

  return hasActiveSubscription || hasRemainingListings || hasFreeListing;
}

/**
 * Marca la prima inserzione gratuita come utilizzata
 * @param userId ID dell'utente
 */
export async function markFreeListingAsUsed(userId: number): Promise<void> {
  await db
    .update(users)
    .set({ usedFreeListing: true })
    .where(eq(users.id, userId));
}

/**
 * Decrementa il contatore delle inserzioni rimanenti per l'utente
 * @param userId ID dell'utente
 */
export async function decrementRemainingListings(userId: number): Promise<void> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (user && user.remainingListings && user.remainingListings > 0) {
    await db
      .update(users)
      .set({ remainingListings: user.remainingListings - 1 })
      .where(eq(users.id, userId));
  }
}

/**
 * Aggiunge un certo numero di inserzioni al credito dell'utente
 * @param userId ID dell'utente
 * @param count Numero di inserzioni da aggiungere
 */
export async function addListingsCredit(userId: number, count: number): Promise<void> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (user) {
    const currentCount = user.remainingListings || 0;
    
    await db
      .update(users)
      .set({ remainingListings: currentCount + count })
      .where(eq(users.id, userId));
  }
}

/**
 * Aggiorna l'abbonamento dell'utente
 * @param userId ID dell'utente
 * @param plan Piano di abbonamento
 * @param expirationDate Data di scadenza
 * @param listingsLimit Limite di inserzioni (opzionale, per piani con limite)
 */
export async function updateUserSubscription(
  userId: number,
  plan: string,
  expirationDate: Date,
  listingsLimit?: number
): Promise<void> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (user) {
    // Se il piano è cambiato, aggiorna il limite di inserzioni
    // altrimenti mantiene le inserzioni attuali
    const currentCount = user.remainingListings || 0;
    const newCount = listingsLimit !== undefined ? listingsLimit : currentCount;

    await db
      .update(users)
      .set({
        subscriptionPlan: plan as any,
        subscriptionExpiresAt: expirationDate,
        remainingListings: newCount
      })
      .where(eq(users.id, userId));
  }
}

/**
 * Aggiorna la modalità di pagamento una tantum per singolo pacchetto (5 inserzioni)
 * @param userId ID dell'utente
 */
export async function processListingsPackagePurchase(userId: number): Promise<void> {
  // Aggiunge 5 inserzioni al credito dell'utente
  await addListingsCredit(userId, 5);
}