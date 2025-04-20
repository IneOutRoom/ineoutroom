import { Router } from 'express';
import { seedListings } from '../seeds/listingsSeeder';
import { log } from '../vite';

const router = Router();

// Rotta per avviare il seeding delle proprietà (solo in modalità sviluppo)
router.get('/listings', async (req, res) => {
  // Verifica che l'ambiente sia di sviluppo
  if (process.env.NODE_ENV !== 'development') {
    log('Tentativo di accesso al seeder in ambiente di produzione!', 'warning');
    return res.status(403).json({
      success: false,
      message: 'Il seeding è consentito solo in ambiente di sviluppo'
    });
  }

  try {
    const adminUserId = 1; // Usa l'ID dell'utente amministratore
    const result = await seedListings(adminUserId);
    
    return res.status(200).json({
      success: true,
      message: `Seeding completato con successo! Sono stati creati ${result.count} annunci per ${result.cityCount} città.`,
      data: result
    });
  } catch (error: any) {
    log(`Errore durante il seeding: ${error.message}`, 'error');
    return res.status(500).json({
      success: false,
      message: 'Si è verificato un errore durante il seeding',
      error: error.message
    });
  }
});

// Aggiungere altre rotte di seeding qui, se necessario

export default router;