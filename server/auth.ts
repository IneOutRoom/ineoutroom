import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as DbUser, InsertUser } from "@shared/schema";

// Risolviamo il problema dell'interfaccia ricorsiva
declare global {
  namespace Express {
    // L'interfaccia User di Express estende l'interfaccia DbUser dal nostro schema
    interface User extends DbUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Utilizziamo un secret fisso per lo sviluppo, ma idealmente useremo una variabile d'ambiente in produzione
  const sessionSecret = process.env.SESSION_SECRET || "inout-development-secret-key-2025";
  console.log(`Utilizzando ${process.env.SESSION_SECRET ? 'SESSION_SECRET da environment' : 'secret di sviluppo'} per l'autenticazione`);
  
  const isProduction = process.env.NODE_ENV === "production";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: true, // Forza il resave della sessione anche se non è cambiata
    saveUninitialized: true, // Salva sessioni non inizializzate per facilitare la gestione
    store: storage.sessionStore,
    name: 'inout.sid', // Nome personalizzato del cookie
    cookie: {
      secure: isProduction, // Solo HTTPS in produzione
      httpOnly: true, // Il cookie non è accessibile tramite JavaScript
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 giorni
      sameSite: 'lax',  // Per una migliore compatibilità con i browser moderni
      path: '/' // Cookie valido per tutti i percorsi
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Controlla se l'username è un'email
        const isEmail = username.includes('@');
        
        let user;
        if (isEmail) {
          user = await storage.getUserByEmail(username);
        } else {
          user = await storage.getUserByUsername(username);
        }
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Credenziali non valide" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Controlla se l'utente esiste già
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username già in uso" });
      }

      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email già in uso" });
      }

      // Crea l'utente
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Effettua il login
      console.log("POST /api/register - Utente creato:", user.id);
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("POST /api/register - Errore durante il login:", loginErr);
          return next(loginErr);
        }
        
        // Salva la sessione esplicitamente
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("POST /api/register - Errore durante il salvataggio della sessione:", saveErr);
            return next(saveErr);
          }
          
          console.log("POST /api/register - Sessione salvata con successo, ID:", req.sessionID);
          
          // Ometti la password nella risposta
          const { password, ...userWithoutPassword } = user;
          res.status(201).json(userWithoutPassword);
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("POST /api/login - Tentativo di login con:", { username: req.body.username });
    
    passport.authenticate("local", (err: Error | null, user: DbUser | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("POST /api/login - Errore durante l'autenticazione:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("POST /api/login - Autenticazione fallita:", info?.message || "Credenziali non valide");
        return res.status(401).json({ message: info?.message || "Autenticazione fallita" });
      }
      
      console.log("POST /api/login - Utente autenticato:", user.id);
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("POST /api/login - Errore durante il login:", loginErr);
          return next(loginErr);
        }
        
        // Salva la sessione esplicitamente
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("POST /api/login - Errore durante il salvataggio della sessione:", saveErr);
            return next(saveErr);
          }
          
          console.log("POST /api/login - Sessione salvata con successo, ID:", req.sessionID);
          
          // Ometti la password nella risposta
          const { password, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    console.log("POST /api/logout - Tentativo di logout, Session ID:", req.sessionID);
    
    // Prima effettuiamo il logout
    req.logout((err) => {
      if (err) {
        console.error("POST /api/logout - Errore durante il logout:", err);
        return next(err);
      }
      
      // Poi distruggiamo la sessione
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("POST /api/logout - Errore durante la distruzione della sessione:", destroyErr);
          return next(destroyErr);
        }
        
        console.log("POST /api/logout - Logout e distruzione sessione completati con successo");
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("GET /api/user - Autenticato:", req.isAuthenticated());
    console.log("GET /api/user - Session ID:", req.sessionID);
    
    if (!req.isAuthenticated()) {
      console.log("GET /api/user - Sessione non autenticata");
      return res.sendStatus(401);
    }
    
    // Ometti la password nella risposta
    console.log("GET /api/user - Utente autenticato:", req.user?.id);
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });
}
