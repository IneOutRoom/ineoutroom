import nodemailer from 'nodemailer';

// Configurazione del trasporto per l'invio delle email
let transporter;

// Inizializza il trasporto in base all'ambiente
if (process.env.NODE_ENV === 'production') {
  // In produzione, usa SMTP
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
} else {
  // In sviluppo, usa Ethereal per testare le email
  // Questa configurazione permetterà di vedere le email nella console
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal_pass',
    },
  });
}

/**
 * Invia un'email di verifica all'utente
 * @param {string} to - Indirizzo email del destinatario
 * @param {string} token - Token di verifica
 * @returns {Promise<boolean>} - True se l'email è stata inviata con successo
 */
export async function sendVerificationEmail(to, token) {
  try {
    // URL per la verifica dell'email
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
    
    // Contenuto dell'email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'In&Out <noreply@ineoutroom.eu>',
      to,
      subject: 'Verifica il tuo indirizzo email - In&Out',
      text: `
        Grazie per esserti registrato su In&Out!
        
        Per completare la registrazione e verificare il tuo indirizzo email, fai clic sul link seguente:
        ${verificationUrl}
        
        Se non hai richiesto questa email, puoi ignorarla.
        
        Il link di verifica scadrà tra 24 ore.
        
        Cordiali saluti,
        Il team di In&Out
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.png" alt="In&Out Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #6a0dad; margin-bottom: 20px;">Verifica il tuo indirizzo email</h2>
          
          <p>Grazie per esserti registrato su In&Out!</p>
          
          <p>Per completare la registrazione e verificare il tuo indirizzo email, fai clic sul pulsante seguente:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #6a0dad; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verifica Email</a>
          </div>
          
          <p>Oppure copia e incolla il seguente URL nel tuo browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${verificationUrl}
          </p>
          
          <p style="color: #777; font-size: 0.9em; margin-top: 30px;">Se non hai richiesto questa email, puoi ignorarla.</p>
          <p style="color: #777; font-size: 0.9em;">Il link di verifica scadrà tra 24 ore.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9e9e9; color: #777; font-size: 0.9em;">
            <p>Cordiali saluti,<br>Il team di In&Out</p>
          </div>
        </div>
      `,
    };
    
    // Invia l'email
    if (process.env.NODE_ENV === 'development') {
      // In sviluppo, mostra l'email nella console
      console.log('========== EMAIL DI VERIFICA (SVILUPPO) ==========');
      console.log('A:', to);
      console.log('Oggetto:', mailOptions.subject);
      console.log('Link di verifica:', verificationUrl);
      console.log('================================================');
      return true;
    } else {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email di verifica inviata:', info.messageId);
      return true;
    }
  } catch (error) {
    console.error('Errore durante l\'invio dell\'email di verifica:', error);
    return false;
  }
}

/**
 * Invia un'email per il reset della password
 * @param {string} to - Indirizzo email del destinatario
 * @param {string} token - Token di reset
 * @returns {Promise<boolean>} - True se l'email è stata inviata con successo
 */
export async function sendPasswordResetEmail(to, token) {
  try {
    // URL per il reset della password
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    
    // Contenuto dell'email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'In&Out <noreply@ineoutroom.eu>',
      to,
      subject: 'Reset della password - In&Out',
      text: `
        Hai richiesto il reset della password per il tuo account In&Out.
        
        Per reimpostare la tua password, fai clic sul link seguente:
        ${resetUrl}
        
        Se non hai richiesto il reset della password, puoi ignorare questa email.
        
        Il link di reset scadrà tra 1 ora.
        
        Cordiali saluti,
        Il team di In&Out
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.png" alt="In&Out Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #6a0dad; margin-bottom: 20px;">Reset della password</h2>
          
          <p>Hai richiesto il reset della password per il tuo account In&Out.</p>
          
          <p>Per reimpostare la tua password, fai clic sul pulsante seguente:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #6a0dad; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          
          <p>Oppure copia e incolla il seguente URL nel tuo browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <p style="color: #777; font-size: 0.9em; margin-top: 30px;">Se non hai richiesto il reset della password, puoi ignorare questa email.</p>
          <p style="color: #777; font-size: 0.9em;">Il link di reset scadrà tra 1 ora.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9e9e9; color: #777; font-size: 0.9em;">
            <p>Cordiali saluti,<br>Il team di In&Out</p>
          </div>
        </div>
      `,
    };
    
    // Invia l'email
    if (process.env.NODE_ENV === 'development') {
      // In sviluppo, mostra l'email nella console
      console.log('========== EMAIL DI RESET PASSWORD (SVILUPPO) ==========');
      console.log('A:', to);
      console.log('Oggetto:', mailOptions.subject);
      console.log('Link di reset:', resetUrl);
      console.log('====================================================');
      return true;
    } else {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email di reset password inviata:', info.messageId);
      return true;
    }
  } catch (error) {
    console.error('Errore durante l\'invio dell\'email di reset password:', error);
    return false;
  }
}